import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  GoAButtonGroup,
  GoAButton,
  GoAFormItem,
  GoADropdown,
  GoADropdownItem,
  GoATextArea,
} from '@abgov/react-components-new';
import { Grid } from '../../../lib/common/Grid';
import { useDispatch, useSelector } from 'react-redux';
import { TASK_STATUS, TaskDetailsProps } from './types';
import { registerDetailsComponent } from './register';
import {
  AppDispatch,
  formSelector,
  selectForm,
  AppState,
  formLoadingSelector,
  anyFileLoadingSelector,
} from '../../state';
import { getAllRequiredFields } from './getRequiredFields';
import { Categorization, isVisible, ControlElement, Category } from '@jsonforms/core';
import { useValidators } from '../../../lib/validations/useValidators';
import { isNotEmptyCheck } from '../../../lib/validations/checkInput';
import { AdspId } from '../../../lib/adspId';

import {
  ReviewItem,
  ReviewItemSection,
  ReviewItemTitle,
  ReviewItemBasic,
  ReviewContainer,
  ReviewContent,
  ActionContainer,
  ActionControl,
} from './styled-components';
import { RenderFormReviewFields } from './RenderFormReviewFields';
import { ajv } from '../../../lib/validations/checkInput';
import { Element } from './RenderFormReviewFields';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { TaskCancelModal } from './TaskCancelModal';

export const FormSubmissionReviewTask: FunctionComponent<TaskDetailsProps> = ({
  user,
  task,
  isExecuting,
  onClose,
  onStart,
  onComplete,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const form = useSelector(formSelector);
  const formIsLoading = useSelector((state: AppState) => formLoadingSelector(state));

  const anyFileIsLoading = useSelector((state: AppState) => anyFileLoadingSelector(state));

  const adspId = AdspId.parse(task.recordId);
  const [_, _type, id, _submission, submissionId] = adspId.resource.split('/');

  useEffect(() => {
    dispatch(selectForm({ formId: id, submissionId: submissionId }));
  }, [dispatch, id, submissionId]);

  const NO_DISPOSITION_SELECTED = {
    id: 'No disposition selected',
    label: 'No disposition selected',
    value: '',
  };

  const definitionId = form.forms[id]?.formDefinitionId;
  const definition = form.definitions[definitionId];
  const currentForm = form.forms[id];
  const categorization = definition?.uiSchema as Categorization;
  const [categories, setCategories] = React.useState<(Categorization | Category | ControlElement)[]>(
    categorization?.elements
  );

  const dispositionStates = [...(definition?.dispositionStates ?? [])].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const [dispositionReason, setDispositionReason] = useState<string>('');
  const [dispositionStatus, setDispositionStatus] = useState<string>(NO_DISPOSITION_SELECTED.value);
  const [showTaskCancelConfirmation, setShowTaskCancelConfirmation] = useState(false);

  const { errors, validators } = useValidators('dispositionReason', 'dispositionReason', isNotEmptyCheck('Reason'))
    .add('dispositionStatus', 'dispositionStatus', isNotEmptyCheck('Disposition'))
    .build();

  const onCompleteValidationCheck = () => {
    onComplete({ formId: form.selected, submissionId, dispositionStatus, dispositionReason });
    validators.clear();
  };

  useEffect(() => {
    const cats = categorization?.elements.filter((category) => isVisible(category, currentForm?.formData, '', ajv));
    setCategories(cats as (Categorization | Category | ControlElement)[]);
  }, [categorization, currentForm]);

  const disableFormDispositionControls = () => {
    if (task.status === TASK_STATUS.PENDING) return true;

    return task.status === TASK_STATUS.COMPLETED;
  };

  const buttonDisabledForCompleteTask = () => {
    if (dispositionReason === '' || dispositionStatus === '') return true;

    if (dispositionReason !== '' && dispositionStatus === NO_DISPOSITION_SELECTED.label) return true;
    if (dispositionReason === '' && dispositionStatus !== NO_DISPOSITION_SELECTED.label) return true;

    if (Object.keys(errors).length > 0) return true;

    return !user.isWorker || isExecuting;
  };

  const loading = formIsLoading || anyFileIsLoading;

  const renderFormSubmissionReview = () => {
    return (
      <div>
        <LoadingIndicator isLoading={loading} />
        {!loading && categories && (
          <ReviewItem>
            {categories.map((category, index) => {
              const categoryLabel = category.label || category.i18n || '';
              const requiredFields = getAllRequiredFields(definition?.dataSchema);

              return (
                <div>
                  {category?.type === 'Control' ? (
                    <ReviewItemBasic>
                      <Element
                        element={category}
                        index={index}
                        data={currentForm?.formData}
                        requiredFields={requiredFields}
                      />
                    </ReviewItemBasic>
                  ) : (
                    // eslint-disable-next-line react/jsx-no-comment-textnodes
                    <ReviewItemSection key={index}>
                      <ReviewItemTitle>{categoryLabel as string}</ReviewItemTitle>
                      <Grid>
                        <RenderFormReviewFields
                          elements={category?.elements}
                          data={currentForm?.formData}
                          requiredFields={requiredFields}
                        />
                      </Grid>
                    </ReviewItemSection>
                  )}
                </div>
              );
            })}
          </ReviewItem>
        )}
      </div>
    );
  };

  const renderDisposition = () => {
    return (
      <div id="form-disposition-block">
        <GoAFormItem requirement="required" error={errors?.['dispositionStatus']} label="Disposition">
          <GoADropdown
            testId="formDispositionStatus"
            value={dispositionStatus}
            disabled={disableFormDispositionControls()}
            onChange={(_, value: string) => {
              setDispositionStatus(value);
              validators.remove('dispositionStatus');
              validators['dispositionStatus'].check(value);
            }}
            relative={true}
            width={'600px'}
          >
            <GoADropdownItem
              key={NO_DISPOSITION_SELECTED.id}
              value={NO_DISPOSITION_SELECTED.value}
              label={NO_DISPOSITION_SELECTED.label}
            />
            {dispositionStates?.map((dip, i) => (
              <GoADropdownItem key={dip.id} value={dip.name} label={dip.description} />
            ))}
          </GoADropdown>
        </GoAFormItem>
      </div>
    );
  };
  const renderReason = () => {
    return (
      <div id="form-reason-block">
        <GoAFormItem label="Reason" requirement="required" error={errors?.['dispositionReason']}>
          <GoATextArea
            name="reason"
            value={dispositionReason}
            disabled={disableFormDispositionControls()}
            width="600px"
            testId="reason"
            aria-label="reason"
            onKeyPress={(name, value: string) => {
              setDispositionReason(value);
              validators.remove('dispositionReason');
              validators['dispositionReason'].check(value);
            }}
            // eslint-disable-next-line
            onChange={() => {}}
          />
        </GoAFormItem>
      </div>
    );
  };

  const renderButtonGroup = () => {
    return (
      <GoAButtonGroup alignment="start">
        {task?.status === TASK_STATUS.IN_PROGRESS && (
          <>
            <GoAButton disabled={buttonDisabledForCompleteTask()} onClick={() => onCompleteValidationCheck()}>
              Submit Decision
            </GoAButton>
            <GoAButton
              type="secondary"
              disabled={!user.isWorker || isExecuting}
              onClick={() => {
                setShowTaskCancelConfirmation(true);
              }}
            >
              Cancel Review
            </GoAButton>
          </>
        )}
        <GoAButton type="tertiary" onClick={onClose}>
          Back
        </GoAButton>
        {task?.status === TASK_STATUS.PENDING && (
          <GoAButton disabled={!user.isWorker || isExecuting} onClick={onStart}>
            Start review
          </GoAButton>
        )}
      </GoAButtonGroup>
    );
  };

  const renderTaskCancelModal = () => {
    return (
      <TaskCancelModal
        title="Cancel Task"
        isOpen={showTaskCancelConfirmation}
        content={
          <div>
            <div>
              Are you sure you wish to cancel <b>{`${task.description}?`}</b>
              <br />
            </div>
          </div>
        }
        onYes={() => {
          onCancel(null);
          setShowTaskCancelConfirmation(false);
        }}
        onNo={() => {
          setShowTaskCancelConfirmation(false);
        }}
      />
    );
  };
  return (
    <ReviewContainer>
      <ReviewContent>
        {renderFormSubmissionReview()}
        {renderTaskCancelModal()}
      </ReviewContent>
      <ActionContainer>
        <goa-divider mt="m" mb="none"></goa-divider>
        <ActionControl>{renderDisposition()}</ActionControl>
        <ActionControl>{renderReason()}</ActionControl>
        <ActionControl>{renderButtonGroup()}</ActionControl>
      </ActionContainer>
    </ReviewContainer>
  );
};

registerDetailsComponent(
  (task) => task?.recordId.startsWith('urn:ads:platform:form-service:v1:/forms/'),
  FormSubmissionReviewTask
);
