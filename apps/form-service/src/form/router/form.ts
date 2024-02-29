import {
  adspId,
  AdspId,
  DomainEvent,
  EventService,
  isAllowedUser,
  startBenchmark,
  UnauthorizedUserError,
} from '@abgov/adsp-service-sdk';
import {
  createValidationHandler,
  InvalidOperationError,
  NotFoundError,
} from '@core-services/core-common';
import { RequestHandler, Router } from 'express';
import { formSubmitted, formUnlocked, formSetToDraft } from '..';
import { formArchived, formCreated, formDeleted } from '../events';
import { FormDefinitionEntity, FormEntity, FormSubmissionEntity } from '../model';
import { NotificationService } from '../../notification';
import { FormRepository, FormSubmissionRepository } from '../repository';
import { FormServiceRoles } from '../roles';
import { Form, FormCriteria, FormSubmission, FormSubmissionCriteria } from '../types';
import {
  ARCHIVE_FORM_OPERATION,
  FormOperations,
  SEND_CODE_OPERATION,
  SUBMIT_FORM_OPERATION,
  UNLOCK_FORM_OPERATION,
  SET_TO_DRAFT_FORM_OPERATION,
} from './types';
import { FileService } from '../../file';
import { body, checkSchema, param, query } from 'express-validator';
import validator from 'validator';
import { QueueTaskService } from '../../task';
import { CommentService } from '../comment';

export function mapFormDefinition(entity: FormDefinitionEntity) {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    anonymousApply: entity.anonymousApply,
    applicantRoles: entity.applicantRoles,
    assessorRoles: entity.assessorRoles,
    clerkRoles: entity.clerkRoles,
    formDraftUrlTemplate: entity.formDraftUrlTemplate,
    dataSchema: entity.dataSchema,
    uiSchema: entity.uiSchema,
  };
}

export function mapForm(
  apiId: AdspId,
  entity: FormEntity
): Omit<Form, 'definition' | 'applicant'> & {
  urn: string;
  definitionId: string;
  applicant: { addressAs: string };
} {
  return {
    urn: adspId`${apiId}:/forms/${entity.id}`.toString(),
    id: entity.id,
    definitionId: entity.definition.id,
    formDraftUrl: entity.formDraftUrl,
    anonymousApplicant: entity.anonymousApplicant,
    data: entity.data,
    files: entity.files,
    status: entity.status,
    created: entity.created,
    createdBy: entity.createdBy,
    locked: entity.locked,
    submitted: entity.submitted,
    lastAccessed: entity.lastAccessed,
    applicant: entity.applicant
      ? {
          addressAs: entity.applicant.addressAs,
        }
      : null,
  };
}

export function mapFormData(entity: FormEntity): Pick<Form, 'id' | 'data' | 'files'> {
  return {
    id: entity.id,
    data: entity.data,
    files: Object.entries(entity.files || {}).reduce((f, [k, v]) => ({ ...f, [k]: v?.toString() }), {}),
  };
}

export function mapFormSubmissionData(entity: FormSubmissionEntity): FormSubmission {
  return {
    id: entity.id,
    formId: entity.formId,
    formDefinitionId: entity.formDefinitionId,
    formData: entity.formData,
    formFiles: entity.formFiles,
    created: entity.created,
    createdBy: { id: entity.createdBy.id, name: entity.createdBy.name },
    disposition: {
      id: entity.disposition?.id,
      date: entity.disposition?.date,
      status: entity.disposition?.status,
      reason: entity.disposition?.reason,
    },
    updated: entity.updated,
    updatedBy: { id: entity.updatedBy.id, name: entity.updatedBy.name },
    hash: entity.hash,
  };
}

export const getFormDefinitions: RequestHandler = async (req, res, next) => {
  try {
    const user = req.user;

    const [configuration] = await req.getConfiguration<Record<string, FormDefinitionEntity>>();
    const definitions = Object.entries(configuration)
      .filter(([_id, entity]) => entity.canAccessDefinition(user))
      .map(([_id, entity]) => mapFormDefinition(entity));
    res.send(definitions);
  } catch (err) {
    next(err);
  }
};

export const getFormDefinition: RequestHandler = async (req, res, next) => {
  try {
    const { definitionId } = req.params;
    const user = req.user;

    const [configuration] = await req.getConfiguration<Record<string, FormDefinitionEntity>>();
    const definition = configuration[definitionId];
    if (!definition) {
      throw new NotFoundError('form definition', definitionId);
    }

    if (!definition.canAccessDefinition(user)) {
      throw new UnauthorizedUserError('access definition', user);
    }

    res.send(mapFormDefinition(definition));
  } catch (err) {
    next(err);
  }
};

export function findForms(apiId: AdspId, repository: FormRepository): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const { top: topValue, after, criteria: criteriaValue } = req.query;
      const top = topValue ? parseInt(topValue as string) : 10;
      const criteria: FormCriteria = criteriaValue ? JSON.parse(criteriaValue as string) : {};

      if (!isAllowedUser(user, req.tenant.id, FormServiceRoles.Admin)) {
        // If user is not a form service admin, then limit search to only forms created by the user.
        criteria.createdByIdEquals = user.id;
      }

      if (user.tenantId) {
        criteria.tenantIdEquals = user.tenantId;
      }

      const { results, page } = await repository.find(top, after as string, criteria);

      end();
      res.send({
        results: results.map((r) => mapForm(apiId, r)),
        page,
      });
    } catch (err) {
      next(err);
    }
  };
}

export function findFormSubmissions(
  repository: FormSubmissionRepository,
  formRepository: FormRepository
): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const tenantId = req.tenant.id;
      const { formId } = req.params;
      const { criteria: criteriaValue } = req.query;
      const criteria: FormSubmissionCriteria = criteriaValue ? JSON.parse(criteriaValue as string) : {};

      const [configuration] = await req.getConfiguration<Record<string, FormDefinitionEntity>>();
      const formEntity: FormEntity = await formRepository.get(tenantId, formId);

      const definition = configuration[formEntity?.definition?.id || ''];

      if (definition && !isAllowedUser(user, tenantId, [FormServiceRoles.Admin, ...definition.assessorRoles])) {
        throw new UnauthorizedUserError('find form submissions', user);
      }

      const { results, page } = await repository.find({
        ...criteria,
        tenantIdEquals: tenantId,
        formIdEquals: formId,
      });

      end();
      res.send({
        results: results.map((r) => mapFormSubmissionData(r)),
        page,
      });
    } catch (err) {
      next(err);
    }
  };
}

export function createForm(
  apiId: AdspId,
  repository: FormRepository,
  eventService: EventService,
  notificationService: NotificationService,
  commentService: CommentService
): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const { definitionId, applicant: applicantInfo } = req.body;

      const [configuration] = await req.getConfiguration<Record<string, FormDefinitionEntity>>();
      const definition = configuration[definitionId];
      if (!definition) {
        throw new NotFoundError('form definition', definitionId);
      }

      const form = await definition.createForm(user, repository, notificationService, applicantInfo);

      end();
      const result = mapForm(apiId, form);
      res.send(result);

      eventService.send(formCreated(user, form));
      if (definition.supportTopic) {
        commentService.createSupportTopic(form, result.urn);
      }
    } catch (err) {
      next(err);
    }
  };
}

const FORM = 'form';
export function getForm(repository: FormRepository): RequestHandler {
  return async (req, _res, next) => {
    try {
      const end = startBenchmark(req, 'get-entity-time');
      const { formId } = req.params;

      const form = await repository.get(req.tenant.id, formId);
      if (!form) {
        throw new NotFoundError('form', formId);
      }
      req[FORM] = form;

      end();
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function getFormSubmission(
  submissionRepository: FormSubmissionRepository,
  formRepository: FormRepository
): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'get-entity-time');
      const { formId, submissionId } = req.params;
      const user = req.user;
      const [configuration] = await req.getConfiguration<Record<string, FormDefinitionEntity>>();
      const formEntity: FormEntity = await formRepository.get(user.tenantId, formId);

      const definition = configuration[formEntity?.definition?.id || ''];

      if (definition && !isAllowedUser(user, req.tenant.id, [FormServiceRoles.Admin, ...definition.assessorRoles])) {
        throw new UnauthorizedUserError('find form submission', user);
      }

      const formSubmission = await submissionRepository.getByFormIdAndSubmissionId(req.tenant.id, submissionId, formId);
      if (!formSubmission) {
        throw new NotFoundError('Form Submission', submissionId);
      }

      end();
      res.send(mapFormSubmissionData(formSubmission));
    } catch (err) {
      next(err);
    }
  };
}

export function updateFormSubmissionDisposition(submissionRepository: FormSubmissionRepository): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');
      const user = req.user;
      const { formId, submissionId } = req.params;
      const { dispositionStatus, dispositionReason } = req.body;

      const formSubmission = await submissionRepository.getByFormIdAndSubmissionId(req.tenant.id, submissionId, formId);
      if (!formSubmission) {
        throw new NotFoundError('Form submission', submissionId);
      }

      const updated = await formSubmission.dispositionSubmission(user, dispositionStatus, dispositionReason);
      end();

      res.send(mapFormSubmissionData(updated));
    } catch (err) {
      next(err);
    }
  };
}

export function accessForm(notificationService: NotificationService): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const { code } = req.query;
      const form: FormEntity = req[FORM];

      const result = await (code
        ? form.accessByCode(user, notificationService, code as string)
        : form.accessByUser(user));

      end();
      res.send(mapFormData(result));
    } catch (err) {
      next(err);
    }
  };
}

export const updateFormData: RequestHandler = async (req, res, next) => {
  try {
    const end = startBenchmark(req, 'operation-handler-time');

    const user = req.user;
    const form: FormEntity = req[FORM];
    const { data, files: fileIds } = req.body;
    const files: Record<string, AdspId> = fileIds
      ? Object.entries(fileIds).reduce((ids, [k, v]) => ({ ...ids, [k]: AdspId.parse(v as string) }), {})
      : null;

    const result = await form.update(user, data, files);

    end();
    res.send(mapFormData(result));
  } catch (err) {
    next(err);
  }
};

export function formOperation(
  apiId: AdspId,
  eventService: EventService,
  notificationService: NotificationService,
  queueTaskService: QueueTaskService,
  submissionRepository: FormSubmissionRepository
): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const form: FormEntity = req[FORM];
      const request: FormOperations = req.body;

      let result: FormEntity = null;
      let event: DomainEvent = null;

      switch (request.operation) {
        case SEND_CODE_OPERATION: {
          result = await form.sendCode(user, notificationService);
          break;
        }
        case UNLOCK_FORM_OPERATION: {
          result = await form.unlock(user);
          event = formUnlocked(user, result);
          break;
        }
        case SUBMIT_FORM_OPERATION: {
          const [submittedForm, _submission] = await form.submit(user, queueTaskService, submissionRepository);
          result = submittedForm;
          event = formSubmitted(user, result);

          break;
        }
        case SET_TO_DRAFT_FORM_OPERATION: {
          result = await form.setToDraft(user);
          event = formSetToDraft(user, result);
          break;
        }
        case ARCHIVE_FORM_OPERATION: {
          result = await form.archive(user);
          event = formArchived(user, result);
          break;
        }
        default:
          throw new InvalidOperationError(`Form operation '${req.body.operation}' not recognized.`);
      }

      end();

      res.send(mapForm(apiId, result));
      if (event) {
        eventService.send(event);
      }
    } catch (err) {
      next(err);
    }
  };
}

export function deleteForm(
  eventService: EventService,
  fileService: FileService,
  notificationService: NotificationService
): RequestHandler {
  return async (req, res, next) => {
    try {
      const end = startBenchmark(req, 'operation-handler-time');

      const user = req.user;
      const form: FormEntity = req[FORM];

      const deleted = await form.delete(user, fileService, notificationService);

      end();
      res.send({ deleted });
      eventService.send(formDeleted(user, form));
    } catch (err) {
      next(err);
    }
  };
}

interface FormRouterProps {
  serviceId: AdspId;
  repository: FormRepository;
  eventService: EventService;
  notificationService: NotificationService;
  queueTaskService: QueueTaskService;
  fileService: FileService;
  commentService: CommentService;
  submissionRepository: FormSubmissionRepository;
}

export function createFormRouter({
  serviceId,
  repository,
  eventService,
  notificationService,
  queueTaskService,
  fileService,
  commentService,
  submissionRepository,
}: FormRouterProps): Router {
  const apiId = adspId`${serviceId}:v1`;
  const router = Router();

  router.get('/definitions', getFormDefinitions);
  router.get(
    '/definitions/:definitionId',
    createValidationHandler(param('definitionId').isString().isLength({ min: 1, max: 50 })),
    getFormDefinition
  );

  router.get(
    '/forms',
    createValidationHandler(
      ...checkSchema(
        {
          top: { optional: true, isInt: { options: { min: 1, max: 5000 } } },
          after: { optional: true, isString: true },
        },
        ['query']
      )
    ),
    findForms(apiId, repository)
  );

  router.get(
    '/forms/:formId/submissions/:submissionId',
    createValidationHandler(
      param('formId').isUUID(),
      param('submissionId').isUUID(),
      getFormSubmission(submissionRepository, repository)
    )
  );
  router.post(
    '/forms/:formId/submissions/:submissionId',
    createValidationHandler(
      body('dispositionStatus').isString().isLength({ min: 1 }),
      body('dispositionReason').isString().isLength({ min: 1 })
    ),
    updateFormSubmissionDisposition(submissionRepository)
  );

  router.get(
    '/forms/:formId/submissions',
    createValidationHandler(
      query('criteria')
        .optional()
        .custom(async (value) => {
          const criteria = JSON.parse(value);
          if (criteria?.createDateBefore !== undefined) {
            if (!validator.isISO8601(criteria?.createDateBefore)) {
              throw new InvalidOperationError('createDateBefore requires ISO-8061 date string.');
            }
          }
          if (criteria?.createDateAfter !== undefined) {
            if (!validator.isISO8601(criteria?.createDateAfter)) {
              throw new InvalidOperationError('createDateAfter requires ISO-8061 date string.');
            }
          }
          if (criteria?.dispositionDateBefore !== undefined) {
            if (!validator.isISO8601(criteria?.dispositionDateBefore)) {
              throw new InvalidOperationError('dispositionDateBefore requires ISO-8061 date string.');
            }
          }
          if (criteria?.dispositionDateAfter !== undefined) {
            if (!validator.isISO8601(criteria?.dispositionDateAfter)) {
              throw new InvalidOperationError('dispositionDateAfter requires ISO-8061 date string.');
            }
          }
        })
    ),
    findFormSubmissions(submissionRepository, repository)
  );
  router.post(
    '/forms',
    createValidationHandler(
      body('definitionId').isString().isLength({ min: 1, max: 50 }),
      body('applicant.id').optional().isString(),
      body('applicant.userId').optional().isString(),
      body('applicant.channels').optional().isArray()
    ),
    createForm(apiId, repository, eventService, notificationService, commentService)
  );

  router.get('/forms/:formId', createValidationHandler(param('formId').isUUID()), getForm(repository), (req, res) =>
    res.send(mapForm(apiId, req[FORM]))
  );
  router.post(
    '/forms/:formId',
    createValidationHandler(
      param('formId').isUUID(),
      body('operation').isIn([
        SEND_CODE_OPERATION,
        UNLOCK_FORM_OPERATION,
        SUBMIT_FORM_OPERATION,
        ARCHIVE_FORM_OPERATION,
        SET_TO_DRAFT_FORM_OPERATION,
      ])
    ),
    getForm(repository),
    formOperation(apiId, eventService, notificationService, queueTaskService, submissionRepository)
  );
  router.delete(
    '/forms/:formId',
    createValidationHandler(param('formId').isUUID()),
    getForm(repository),
    deleteForm(eventService, fileService, notificationService)
  );

  router.get(
    '/forms/:formId/data',
    createValidationHandler(
      param('formId').isUUID(),
      query('code').optional().isString().isLength({ min: 1, max: 10 })
    ),
    getForm(repository),
    accessForm(notificationService)
  );

  router.put(
    '/forms/:formId/data',
    createValidationHandler(
      param('formId').isUUID(),
      body('data').optional({ nullable: true }).isObject(),
      body('files').optional({ nullable: true }).isObject()
    ),
    getForm(repository),
    updateFormData
  );

  return router;
}
