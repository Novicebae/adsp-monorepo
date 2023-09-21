import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  EditorPadding,
  FileTypeEditor,
  FileTypeEditorTitle,
  FileTypePermissions,
  FileTypesEditorTitle,
  FinalButtonPadding,
  FlexRow,
  InfoCircleWrapper,
  NameDescriptionDataSchema,
  RetentionPolicyLabel,
  RetentionPolicyWrapper,
  RetentionToolTip,
  ScrollPane,
  SpinnerModalPadding,
  TextLoadingIndicator,
} from './styled-components';
import { ReactComponent as InfoCircle } from '@assets/icons/info-circle.svg';
import { useWindowDimensions } from '@lib/useWindowDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { GoAButton, GoAPageLoader } from '@abgov/react-components';
import { FileTypeConfigDefinition } from './fileTypeConfigDefinition';
import { GoAButtonGroup, GoACheckbox, GoAFormItem, GoAInput, GoAPopover } from '@abgov/react-components-new';
import { RootState } from '@store/index';
import { FileTypeDefault, FileTypeItem } from '@store/file/models';
import { useValidators } from '@lib/validation/useValidators';
import { badCharsCheck, duplicateNameCheck, isNotEmptyCheck, wordMaxLengthCheck } from '@lib/validation/checkInput';
import { ConfigServiceRole } from '@store/access/models';
import { ClientRoleTable } from '@components/RoleTable';
import { SaveFormModal } from '@components/saveModal';
import { ActionState } from '@store/session/models';
import { FETCH_KEYCLOAK_SERVICE_ROLES } from '@store/access/actions';
import { CreateFileTypeService, UpdateFileTypeService } from '@store/file/actions';
import { createSelector } from 'reselect';
import { selectFileTyeNames } from './fileTypeNew';

export const AddEditFileTypeDefinitionEditor = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileTypeNames = useSelector(selectFileTyeNames);
  const [spinner, setSpinner] = useState<boolean>(false);
  const [saveModal, setSaveModal] = useState({ visible: false, closeEditor: false });
  const [initialFileType, setInitialFileType] = useState<FileTypeItem>(FileTypeDefault);
  const [fileType, setFileType] = useState<FileTypeItem>(FileTypeDefault);
  const { fetchKeycloakRolesState } = useSelector((state: RootState) => ({
    fetchKeycloakRolesState: state.session.indicator?.details[FETCH_KEYCLOAK_SERVICE_ROLES] || '',
  }));

  const { height } = useWindowDimensions();

  const selectServiceKeyCloakRoles = createSelector(
    (state: RootState) => state.serviceRoles,
    (serviceRoles) => {
      return serviceRoles?.keycloak || {};
    }
  );

  const keyCloakClientRoles = useSelector(selectServiceKeyCloakRoles);

  //This is to add padding under the input text controls to space them vertically
  //out between the text controls and the back and cancel buttons.
  const heightCover = {
    height: height - 720,
  };

  const close = () => {
    history.push({
      pathname: '/admin/services/file',
    });
  };

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  const fileTypes: FileTypeItem[] = useSelector((state: RootState) => state.fileService.fileTypes);

  const roles = useSelector((state: RootState) => state.tenant.realmRoles);
  const roleNames = roles
    ?.map((role) => {
      return role.name;
    })
    .sort();

  //eslint-disable-next-line
  useEffect(() => {
    const foundFileType = fileTypes?.find((f) => f.id === id);
    if (id && foundFileType) {
      const selectedFileType = foundFileType;
      setFileType(selectedFileType);
      setInitialFileType(selectedFileType);
    }
  }, [fileTypes]);

  const { validators } = useValidators(
    'name',
    'name',
    badCharsCheck,
    wordMaxLengthCheck(32, 'Name'),
    isNotEmptyCheck('name')
  )
    .add('duplicated', 'name', duplicateNameCheck(fileTypeNames, 'File type'))
    .build();

  const isFileTypeUpdated = (prev: FileTypeItem, next: FileTypeItem): boolean => {
    const isUpdated =
      prev?.name !== next?.name ||
      prev?.id !== next?.id ||
      prev?.anonymousRead !== next?.anonymousRead ||
      prev?.readRoles !== next?.readRoles ||
      prev?.updateRoles !== next?.updateRoles ||
      prev?.rules?.retention !== next?.rules?.retention ||
      prev?.rules?.retention?.active !== next?.rules?.retention?.active;
    return isUpdated;
  };

  let elements = [{ roleNames: roleNames, clientId: '', currentElements: null }];
  let clientElements = null;

  clientElements =
    Object.entries(keyCloakClientRoles).length > 0 &&
    Object.entries(keyCloakClientRoles)
      .filter(([clientId, config]) => {
        return (config as ConfigServiceRole).roles.length > 0;
      })
      .map(([clientId, config]) => {
        const roles = (config as ConfigServiceRole).roles;
        const roleNames = roles?.map((role) => {
          return role.role;
        });
        return { roleNames: roleNames, clientId: clientId, currentElements: null };
      });
  elements = elements.concat(clientElements);

  const ClientRole = ({ roleNames, clientId }) => {
    return (
      <>
        <ClientRoleTable
          roles={roleNames}
          clientId={clientId}
          anonymousRead={fileType?.anonymousRead}
          roleSelectFunc={(roles, type) => {
            if (type === 'read') {
              setFileType({
                ...fileType,
                readRoles: roles,
              });
            } else {
              setFileType({
                ...fileType,
                updateRoles: roles,
              });
            }
          }}
          service="FileType"
          nameColumnWidth={80}
          checkedRoles={[
            { title: 'read', selectedRoles: fileType?.readRoles },
            { title: 'modify', selectedRoles: fileType?.updateRoles },
          ]}
        />
      </>
    );
  };

  return (
    <FileTypeEditor data-testid="filetype-editor">
      {spinner ? (
        <SpinnerModalPadding>
          <GoAPageLoader visible={true} type="infinite" message={'Loading...'} pagelock={false} />
        </SpinnerModalPadding>
      ) : (
        <FlexRow>
          <NameDescriptionDataSchema>
            <FileTypeEditorTitle>File Type</FileTypeEditorTitle>
            <hr className="hr-resize" />

            {isEdit && <FileTypeConfigDefinition fileType={fileType ?? FileTypeDefault} />}
            <GoACheckbox
              checked={fileType?.anonymousRead}
              name="file-type-anonymousRead-checkbox"
              testId="file-type-anonymousRead-checkbox"
              ariaLabel={`file-type-anonymousRead-checkbox`}
              onChange={() => {
                setFileType({
                  ...fileType,
                  anonymousRead: !fileType.anonymousRead,
                });
              }}
              text={'Make public (read only)'}
            />

            <GoAFormItem label="">
              <RetentionPolicyLabel>
                Retention policy
                <InfoCircleWrapper>
                  <GoAPopover testId={'file-type-retention-tooltip'} target={<InfoCircle />} maxWidth="260px">
                    <RetentionToolTip>
                      The untouched files within the file type will be deleted after the retention period provided.
                    </RetentionToolTip>
                  </GoAPopover>
                </InfoCircleWrapper>
              </RetentionPolicyLabel>
              <RetentionPolicyWrapper>
                <GoACheckbox
                  name="retentionActive"
                  key="retention-period-active-checkbox"
                  checked={fileType?.rules?.retention?.active === true}
                  onChange={(name, checked) => {
                    setFileType({
                      ...fileType,
                      rules: {
                        ...fileType?.rules,
                        retention: {
                          ...fileType?.rules?.retention,
                          active: checked,
                        },
                      },
                    });
                  }}
                  text={'Active retention policy'}
                />
                <b>Enter retention period</b>
              </RetentionPolicyWrapper>
            </GoAFormItem>
            <GoAInput
              onChange={(name, day) => {
                if (parseInt(day) > 0) {
                  setFileType({
                    ...fileType,
                    rules: {
                      ...fileType?.rules,
                      retention: {
                        ...fileType?.rules?.retention,
                        deleteInDays: parseInt(day),
                        active: fileType?.rules?.retention?.active || false,
                        createdAt: fileType?.rules?.retention?.createdAt || new Date().toISOString(),
                      },
                    },
                  });
                }
              }}
              testId={'delete-in-days-input'}
              name="delete-in-days"
              value={fileType?.rules?.retention?.deleteInDays?.toString()}
              type="number"
              disabled={fileType?.rules?.retention?.active !== true}
              aria-label="goa-input-delete-in-days"
              leadingContent="Days"
              width="15%"
            />

            <GoAFormItem label="">
              <EditorPadding>
                <div style={heightCover}></div>
              </EditorPadding>
            </GoAFormItem>

            <hr className="hr-resize-bottom" />
            <FinalButtonPadding>
              <GoAButtonGroup alignment="start">
                <GoAButton
                  type="primary"
                  testId="form-save"
                  disabled={!isFileTypeUpdated(initialFileType, fileType) || !fileType?.name || validators.haveErrors()}
                  onClick={() => {
                    if (indicator.show === true) {
                      setSpinner(true);
                    } else {
                      if (!isEdit) {
                        const validations = {
                          name: fileType.name,
                        };
                        if (!validators.checkAll(validations)) {
                          return;
                        }
                      }

                      setSpinner(true);
                      let elementNames = [];
                      elements.forEach((e) => {
                        if (e) {
                          elementNames = elementNames.concat(
                            e.roleNames.map((roleName) => (e.clientId ? `${e.clientId}:${roleName}` : roleName))
                          );
                        }
                      });

                      const cleanReadRoles = fileType.readRoles.filter((readRole) => {
                        return elementNames.includes(readRole);
                      });
                      const cleanUpdateRoles = fileType.updateRoles.filter((updateRole) =>
                        elementNames.includes(updateRole)
                      );

                      fileType.readRoles = cleanReadRoles;
                      fileType.updateRoles = cleanUpdateRoles;

                      if (!isEdit) {
                        dispatch(CreateFileTypeService(fileType));
                      } else {
                        dispatch(UpdateFileTypeService(fileType));
                      }
                      close();
                    }
                  }}
                >
                  Save
                </GoAButton>
                <GoAButton
                  testId="form-cancel"
                  type="secondary"
                  onClick={() => {
                    if (isFileTypeUpdated(initialFileType, fileType)) {
                      setSaveModal({ visible: true, closeEditor: false });
                    } else {
                      validators.clear();
                      close();
                    }
                  }}
                >
                  Back
                </GoAButton>
              </GoAButtonGroup>
            </FinalButtonPadding>
          </NameDescriptionDataSchema>
          <FileTypePermissions className="task-permissions-wrapper">
            <FileTypesEditorTitle>Roles</FileTypesEditorTitle>
            <hr className="hr-resize" />
            <ScrollPane>
              {elements.map((e, key) => {
                return <ClientRole roleNames={e.roleNames} key={key} clientId={e.clientId} />;
              })}
              {fetchKeycloakRolesState === ActionState.inProcess && (
                <TextLoadingIndicator>Loading roles from access service</TextLoadingIndicator>
              )}
            </ScrollPane>
          </FileTypePermissions>
        </FlexRow>
      )}
      <SaveFormModal
        open={saveModal.visible}
        onDontSave={() => {
          close();
          setSaveModal({ visible: false, closeEditor: true });
        }}
        onSave={() => {
          if (!isEdit) {
            const validations = {
              duplicate: fileType.name,
            };
            if (!validators.checkAll(validations)) {
              return;
            }
          }
          setSpinner(true);
          setSaveModal({ visible: false, closeEditor: true });
        }}
        saveDisable={!isFileTypeUpdated(initialFileType, fileType)}
        onCancel={() => {
          setSaveModal({ visible: false, closeEditor: false });
        }}
      />
    </FileTypeEditor>
  );
};
