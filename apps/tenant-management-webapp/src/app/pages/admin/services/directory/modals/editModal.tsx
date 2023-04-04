import React, { useState, useEffect } from 'react';
import { GoAModal, GoAModalActions, GoAModalContent, GoAModalTitle } from '@abgov/react-components/experimental';
import { GoAButton } from '@abgov/react-components';
import { GoAForm, GoAFormItem, GoAInput } from '@abgov/react-components/experimental';
import { Service } from '@store/directory/models';
import { useDispatch, useSelector } from 'react-redux';
import { createEntry, updateEntry, fetchEntryDetail } from '@store/directory/actions';
import { RootState } from '@store/index';
import {
  characterCheck,
  validationPattern,
  Validator,
  isNotEmptyCheck,
  wordMaxLengthCheck,
} from '@lib/validation/checkInput';
import { useValidators } from '@lib/validation/useValidators';
import { EditModalType, AddModalType } from '@store/directory/models';
import { selectModalStateByType } from '@store/session/selectors';
import { ResetModalState } from '@store/session/actions';
import { selectEditAddDirectory } from '@store/directory/selectors';

const duplicateServiceCheck = (directory: Service[], tenantName: string, isNew: boolean): Validator => {
  return (input: Service) => {
    // If we don't have an API, check that the service is not duplicated.
    if (!input.api) {
      // If we're editing then the service name will already be in the directory; remove it for duplicate check.
      const dir = isNew ? directory : directory.slice(0).filter((e) => e.service === input.service);
      const duplicate = dir.find((s) => !s.api && s.namespace === tenantName && s.service === input.service);
      return duplicate ? 'Service duplicate, please use another' : '';
    }
  };
};

const duplicateApiCheck = (directory: Service[], tenantName: string, isNew: boolean): Validator => {
  return (input: Service) => {
    // If we have an API check that it is not a duplicate for the service.
    if (input.api) {
      // If we're editing then the api name will already be in the directory; remove it for duplicate check.
      const dir = isNew
        ? directory
        : directory.slice(0).filter((e) => e.api !== input.api && e.service === input.service);
      const duplicate = dir.find(
        (s) => s.namespace === tenantName && s.service === input.service && s.api === input.api
      );
      return duplicate ? 'Api duplicate, please use another' : '';
    }
  };
};

const lowerCaseCheck = characterCheck(validationPattern.lowerKebabCase);
const checkForBadUrl = characterCheck(validationPattern.validURL);
const checkServiceExists = isNotEmptyCheck('service');
const checkUrlExists = isNotEmptyCheck('URL');
const wordLengthCheck = wordMaxLengthCheck(32, 'name');

export const DirectoryModal = (): JSX.Element => {
  const editModal = useSelector(selectModalStateByType(EditModalType));
  const addModal = useSelector(selectModalStateByType(AddModalType));
  const initEntry = useSelector(selectEditAddDirectory) as unknown as Service;
  const [entry, setEntry] = useState<Service>(initEntry);
  const isNew = addModal?.isOpen && addModal?.id === null;
  const isQuickAdd = addModal?.isOpen && addModal?.id !== null;
  const isEdit = editModal?.isOpen;

  const title = isNew || isEdit ? 'Add entry' : 'Edit entry';
  const { directory } = useSelector((state: RootState) => state.directory);
  const tenantName = useSelector((state: RootState) => state.tenant?.name);
  const dispatch = useDispatch();
  const { errors, validators } = useValidators(
    'service',
    'service',
    lowerCaseCheck,
    checkServiceExists,
    wordLengthCheck
  )
    .add('api', 'api', lowerCaseCheck)
    .add('url', 'url', checkForBadUrl, checkUrlExists)
    .add('apiDuplicate', 'api', duplicateApiCheck(directory, tenantName, isNew))
    .add('serviceDuplicate', 'service', duplicateServiceCheck(directory, tenantName, isNew))
    .build();

  // eslint-disable-next-line
  useEffect(() => {}, [editModal?.isOpen, addModal?.isOpen]);

  useEffect(() => {
    setEntry(initEntry);
  }, [initEntry]);

  return (
    <GoAModal testId="directory-modal" isOpen={isNew || isEdit || isQuickAdd}>
      <GoAModalTitle>{title}</GoAModalTitle>
      <GoAModalContent>
        <GoAForm>
          <GoAFormItem error={errors?.['service']}>
            <label>Service</label>
            <GoAInput
              type="text"
              name="service"
              value={entry.service}
              data-testid={`directory-modal-service-input`}
              aria-label="service"
              disabled={!isNew || isQuickAdd}
              onChange={(name, value) => {
                validators['service'].check(value);
                setEntry({ ...entry, service: value });
              }}
            />
          </GoAFormItem>
          <GoAFormItem error={errors?.['api']}>
            <label>API</label>
            <GoAInput
              type="text"
              name="api"
              value={entry.api}
              data-testid={`directory-modal-api-input`}
              aria-label="api"
              disabled={!isNew || isQuickAdd}
              onChange={(name, value) => {
                validators['api'].check(value);
                setEntry({ ...entry, api: value });
              }}
            />
          </GoAFormItem>
          <GoAFormItem error={errors?.['url']}>
            <label>URL</label>
            <GoAInput
              type="url"
              name="url"
              value={entry.url}
              data-testid={`directory-modal-url-input`}
              aria-label="name"
              disabled={isQuickAdd}
              onChange={(name, value) => {
                validators['url'].check(value);
                setEntry({ ...entry, url: value });
              }}
            />
          </GoAFormItem>
        </GoAForm>
      </GoAModalContent>
      <GoAModalActions>
        <GoAButton
          buttonType="secondary"
          data-testid="directory-modal-cancel"
          onClick={() => {
            validators.clear();
            dispatch(ResetModalState());
          }}
        >
          Cancel
        </GoAButton>
        <GoAButton
          buttonType="primary"
          disabled={!entry.service || !entry.url || validators.haveErrors()}
          data-testid="directory-modal-save"
          onClick={(e) => {
            const validations = {
              serviceDuplicate: entry,
              apiDuplicate: entry,
            };

            if (!isEdit && !validators.checkAll(validations)) {
              return;
            }

            if (isNew) {
              dispatch(createEntry(entry));
              if (!entry.api) {
                const fetchTime = setInterval(() => dispatch(fetchEntryDetail(entry)), 1000);
                setTimeout(() => {
                  clearInterval(fetchTime);
                }, 1000);
              }
            }
            if (isQuickAdd) {
              dispatch(createEntry(entry));
            }
            if (isEdit) {
              dispatch(updateEntry(entry));
            }

            dispatch(ResetModalState());
          }}
        >
          Save
        </GoAButton>
      </GoAModalActions>
    </GoAModal>
  );
};
