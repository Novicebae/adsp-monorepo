import React, { useState, useEffect } from 'react';
import { FormDefinition } from '@store/form/model';
import { toKebabName } from '@lib/kebabName';
import { useValidators } from '@lib/validation/useValidators';
import {
  isNotEmptyCheck,
  wordMaxLengthCheck,
  badCharsCheck,
  duplicateNameCheck,
  Validator,
} from '@lib/validation/checkInput';
import { FormFormItem, HelpText, DescriptionItem, ErrorMsg } from '../styled-components';
import { PageIndicator } from '@components/Indicator';
import { useNavigate } from 'react-router-dom-6';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';
import { uischema } from './categorization-stepper-nav-buttons';
import { schema } from './categorization';
import { selectDefaultFormUrl } from '@store/form/selectors';

import {
  GoATextArea,
  GoAInput,
  GoAModal,
  GoAButtonGroup,
  GoAFormItem,
  GoAButton,
  GoAIcon,
  GoACheckbox,
} from '@abgov/react-components-new';
interface AddEditFormDefinitionProps {
  open: boolean;
  isEdit: boolean;
  initialValue?: FormDefinition;
  onClose: () => void;
  onSave: (definition: FormDefinition) => void;
}

export const checkFormDefaultUrl = (): Validator => {
  return (_url: string) => {
    const url = _url.replace(/\s/g, '');
    const isHttps = url.toLowerCase().startsWith('https://');
    const numberOfVariables = url.split('{{').length;
    const containsIdVariable = url.includes('{{id}}');
    if (!isHttps) return 'Only secure HTTP protocol is allowed.';
    if (numberOfVariables > 2 || (numberOfVariables === 2 && !containsIdVariable)) {
      return 'Can only contain one handlebar variable {{id}} in the url';
    }
  };
};

export const AddEditFormDefinition = ({
  initialValue,
  isEdit,
  onClose,
  open,
  onSave,
}: AddEditFormDefinitionProps): JSX.Element => {

  const navigate = useNavigate();
  const [definition, setDefinition] = useState<FormDefinition>(initialValue);
  const [multiForm, setMultiForm] = useState<boolean>(false);
  const [spinner, setSpinner] = useState<boolean>(false);

  const definitions = useSelector((state: RootState) => {
    return state?.form?.definitions;
  });
  const definitionIds = Object.keys(definitions);

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });
  const descErrMessage = 'Description can not be over 180 characters';

  const defaultFormUrl = useSelector((state: RootState) => selectDefaultFormUrl(state, definition?.id || null));

  useEffect(() => {
    if (open) {
      dispatch(fetchDirectory());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (spinner && Object.keys(definitions).length > 0 && !isEdit) {
      if (validators['duplicate'].check(definition.id)) {
        setSpinner(false);
        onClose();
      }
    }
  }, [definitions]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line
  useEffect(() => {}, [indicator, defaultFormUrl]);

  useEffect(() => {
    setDefinition(initialValue);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const { errors, validators } = useValidators(
    'name',
    'name',
    badCharsCheck,
    wordMaxLengthCheck(32, 'Name'),
    isNotEmptyCheck('name')
  )
    .add('duplicate', 'name', duplicateNameCheck(definitionIds, 'definition'))
    .add('description', 'description', wordMaxLengthCheck(180, 'Description'))
    .add('formDraftUrlTemplate', 'formDraftUrlTemplate', checkFormDefaultUrl())
    .build();
  return (
    <GoAModal
      testId="definition-form"
      open={open}
      heading={`${isEdit ? 'Edit' : 'Add'} definition`}
      width="640px"
      actions={
        <GoAButtonGroup alignment="end">
          <GoAButton
            testId="add-edit-form-cancel"
            type="secondary"
            onClick={() => {
              validators.clear();
              onClose();
            }}
          >
            Cancel
          </GoAButton>
          <GoAButton
            type="primary"
            testId="form-save"
            disabled={!definition.name || validators.haveErrors()}
            onClick={() => {
              if (indicator.show === true) {
                setSpinner(true);
              } else {
                if (!isEdit) {
                  const validations = {
                    duplicate: definition.name,
                  };
                  if (!validators.checkAll(validations)) {
                    return;
                  }
                  if (multiForm) {
                    definition.dataSchema = schema;
                    definition.uiSchema = uischema;
                  }
                }
                setSpinner(true);
                if (definition?.formDraftUrlTemplate === '') {
                  definition.formDraftUrlTemplate = defaultFormUrl;
                }
                onSave(definition);
                if (isEdit) {
                  onClose();
                } else {
                  navigate(`edit/${definition.id}`);
                }
              }
            }}
          >
            Save
          </GoAButton>
        </GoAButtonGroup>
      }
    >
      {spinner ? (
        <PageIndicator />
      ) : (
        <>
          <FormFormItem>
            <GoAFormItem error={errors?.['name']} label="Name">
              <GoAInput
                type="text"
                name="form-definition-name"
                value={definition.name}
                testId="form-definition-name"
                aria-label="form-definition-name"
                width="100%"
                onChange={(name, value) => {
                  const validations = {
                    name: value,
                    duplicate: value,
                  };

                  if (definition.id.length > 0) {
                    validators.remove('name');

                    validators.checkAll(validations);
                  }

                  setDefinition(
                    isEdit ? { ...definition, name: value } : { ...definition, name: value, id: toKebabName(value) }
                  );
                }}
              />
            </GoAFormItem>
          </FormFormItem>
          <GoAFormItem label="Definition ID">
            <FormFormItem>
              <GoAInput
                name="form-definition-id"
                value={definition.id}
                testId="form-definition-id"
                disabled={true}
                width="100%"
                // eslint-disable-next-line
                onChange={() => {}}
              />
            </FormFormItem>
          </GoAFormItem>

          <GoAFormItem label="Description">
            <DescriptionItem>
              <GoATextArea
                name="form-definition-description"
                value={definition.description}
                width="100%"
                testId="form-definition-description"
                aria-label="form-definition-description"
                // eslint-disable-next-line
                onChange={() => {}}
                onKeyPress={(name, value) => {
                  validators.remove('description');
                  validators['description'].check(value);
                  setDefinition({ ...definition, description: value });
                }}
              />
              <HelpText>
                {definition.description.length <= 180 ? (
                  <div> {descErrMessage} </div>
                ) : (
                  <ErrorMsg>
                    <GoAIcon type="warning" size="small" theme="filled" />
                    {`  ${errors?.['description']}`}
                  </ErrorMsg>
                )}
                <div>{`${definition.description.length}/180`}</div>
              </HelpText>
            </DescriptionItem>
          </GoAFormItem>

          <GoAFormItem error={errors?.['formDraftUrlTemplate']} label="Form template URL">
            <FormFormItem>
              <GoAInput
                name="form-url-id"
                value={definition?.formDraftUrlTemplate || defaultFormUrl}
                testId="form-url-id"
                disabled={!definition?.id?.length}
                width="100%"
                // eslint-disable-next-line
                onChange={(name, value) => {
                  validators.remove('formDraftUrlTemplate');
                  const validations = {
                    formDraftUrlTemplate: value,
                  };
                  validators.checkAll(validations);

                  setDefinition({ ...definition, formDraftUrlTemplate: value });
                }}
              />
            </FormFormItem>
          </GoAFormItem>

          {!isEdit && (
            <GoACheckbox
              name={'populate-form'}
              key={'populate-form'}
              ariaLabel={'populate-form-checkbox'}
              checked={multiForm}
              testId={'populate-template'}
              onChange={() => {
                setMultiForm(multiForm ? false : true);
              }}
            >
              Populate form with a default multi-page form
            </GoACheckbox>
          )}
        </>
      )}
    </GoAModal>
  );
};
