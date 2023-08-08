import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveApplication } from '@store/status/actions';
import { fetchDirectory, fetchDirectoryDetailByURNs } from '@store/directory/actions';
import { ApplicationStatus } from '@store/status/models';
import { GoADropdown, GoADropdownOption, GoAButton, GoAButtonGroup } from '@abgov/react-components-new';
import { useValidators } from '@lib/validation/useValidators';

import {
  characterCheck,
  validationPattern,
  isNotEmptyCheck,
  Validator,
  wordMaxLengthCheck,
} from '@lib/validation/checkInput';

import {
  GoAForm,
  GoAFormItem,
  GoAInput,
  GoAModal,
  GoAModalContent,
  GoAModalTitle,
  GoAModalActions,
} from '@abgov/react-components/experimental';
import { GoATextArea } from '@abgov/react-components-new';
import { RootState } from '@store/index';
import { createSelector } from 'reselect';
import { IdField } from './styled-components';
import { toKebabName } from '@lib/kebabName';

interface Props {
  isOpen: boolean;
  title: string;
  testId: string;
  isEdit: boolean;
  defaultApplication: ApplicationStatus;
  onCancel?: () => void;
  onSave?: () => void;
}
const tenantServiceURNSelector = createSelector(
  (state: RootState) => state.directory.directory,
  (directory) => {
    if (!directory) {
      return [];
    }
    return Object.entries(directory)
      .filter((_directory) => {
        return _directory[1].isCore === false;
      })
      .map((_directory) => {
        return _directory[1].urn;
      });
  }
);

const healthEndpointsSelector = createSelector(
  (state: RootState) => state.directory.directory,
  (directory) => {
    return directory
      .filter((_directory) => {
        return _directory?.metadata?._links?.health?.href !== undefined;
      })
      .map((_directory) => {
        return _directory?.metadata._links.health.href;
      });
  }
);

export const ApplicationFormModal: FC<Props> = ({
  isOpen,
  title,
  onCancel,
  onSave,
  testId,
  defaultApplication,
  isEdit,
}: Props) => {
  const dispatch = useDispatch();
  const [application, setApplication] = useState<ApplicationStatus>({ ...defaultApplication });
  const tenantServiceUrns = useSelector(tenantServiceURNSelector);
  const healthEndpoints = useSelector(healthEndpointsSelector);
  const { directory } = useSelector((state: RootState) => state.directory);
  const { applications } = useSelector((state: RootState) => state.serviceStatus);
  const checkForBadChars = characterCheck(validationPattern.mixedArrowCaseWithSpace);

  const isDuplicateAppName = (): Validator => {
    return (appName: string) => {
      const existingApp = applications.filter((app) => app.name === appName);

      return existingApp.length === 1 ? 'application name is duplicate, please use a different name' : '';
    };
  };
  const isDuplicateAppKey = (): Validator => {
    return (appKey: string) => {
      const existingApp = applications.filter((app) => app.appKey === appKey);
      return existingApp.length === 1 ? 'application key is duplicate, please use a different name' : '';
    };
  };

  const { errors, validators } = useValidators(
    'nameAppKey',
    'name',
    checkForBadChars,
    wordMaxLengthCheck(32, 'Name'),
    isNotEmptyCheck('nameAppKey'),
    isDuplicateAppKey()
  )
    .add('nameOnly', 'name', checkForBadChars, isDuplicateAppName())
    .add('description', 'description', wordMaxLengthCheck(250, 'Description'))
    .add(
      'url',
      'url',
      wordMaxLengthCheck(150, 'URL'),
      characterCheck(validationPattern.validURL),
      isNotEmptyCheck('url')
    )
    .build();

  function save() {
    if (!isFormValid()) {
      return;
    }

    application.status = '';
    dispatch(saveApplication(application));
    if (onSave) onSave();
  }

  function isFormValid(): boolean {
    if (!application?.name) return false;
    if (!application?.endpoint.url) return false;
    return !validators.haveErrors();
  }

  useEffect(() => {
    if (directory.length === 0) {
      dispatch(fetchDirectory());
    }
  }, []);

  useEffect(() => {
    dispatch(fetchDirectoryDetailByURNs(tenantServiceUrns));
  }, [tenantServiceUrns.length]);

  // eslint-disable-next-line
  useEffect(() => {}, [healthEndpoints]);

  return (
    <GoAModal isOpen={isOpen} testId={testId}>
      <GoAModalTitle>{title}</GoAModalTitle>
      <GoAModalContent>
        <GoAForm>
          <GoAFormItem error={errors?.['name']}>
            <label>Application name</label>
            <GoAInput
              type="text"
              name="name"
              value={application?.name}
              onChange={(name, value) => {
                if (!isEdit) {
                  const appKey = toKebabName(value);
                  // check for duplicate appKey
                  validators['nameAppKey'].check(appKey);
                  setApplication({
                    ...application,
                    name: value,
                    appKey,
                  });
                } else {
                  // should not update appKey during update
                  validators['nameOnly'].check(value);
                  setApplication({
                    ...application,
                    name: value,
                  });
                }
              }}
              aria-label="name"
            />
          </GoAFormItem>
          <GoAFormItem>
            <label>Application ID</label>
            <IdField>{application.appKey}</IdField>
          </GoAFormItem>

          <GoAFormItem error={errors?.['url']}>
            <label>URL</label>
            <GoADropdown
              name="url"
              value={[application?.endpoint?.url]}
              aria-label="select-url-dropdown"
              width="100%"
              onChange={(name, value: string | string[]) => {
                validators.remove('url');
                validators['url'].check(value);
                setApplication({
                  ...application,
                  endpoint: {
                    url: value.toString(),
                    status: 'offline',
                  },
                });
              }}
            >
              {healthEndpoints.map((endpoint) => {
                return <GoADropdownOption name="url" label={endpoint} value={endpoint} key={endpoint} />;
              })}
            </GoADropdown>
          </GoAFormItem>
          <GoAFormItem error={errors?.['description']}>
            <label>Description</label>
            <GoATextArea
              name="description"
              width="100%"
              value={application?.description}
              onChange={(name, value) => {
                validators.remove('description');
                validators['description'].check(value);
                setApplication({
                  ...application,
                  description: value,
                });
              }}
              aria-label="description"
            />
          </GoAFormItem>
        </GoAForm>
      </GoAModalContent>
      <GoAModalActions>
        <GoAButtonGroup alignment="end">
          <GoAButton
            type="secondary"
            onClick={() => {
              if (onCancel) onCancel();
              validators.clear();
              setApplication({ ...defaultApplication });
            }}
          >
            Cancel
          </GoAButton>
          <GoAButton disabled={!isFormValid() || validators.haveErrors()} type="primary" onClick={save}>
            Save
          </GoAButton>
        </GoAButtonGroup>
      </GoAModalActions>
    </GoAModal>
  );
};

export default ApplicationFormModal;
