import React from 'react';
import { CellProps, WithClassname, ControlProps, isIntegerControl, RankedTester, rankWith } from '@jsonforms/core';
import { GoAInputNumber } from '@abgov/react-components-new';
import { WithInputProps } from './type';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { GoAInputBaseControl } from './InputBaseControl';
import { getErrorsToDisplay, isValidDate } from '../../util/stringUtils';
type GoAInputIntegerProps = CellProps & WithClassname & WithInputProps;

export const GoAInputInteger = (props: GoAInputIntegerProps): JSX.Element => {
  // eslint-disable-next-line
  const { data, config, id, enabled, uischema, isValid, path, handleChange, schema, label } = props;
  const appliedUiSchemaOptions = { ...config, ...uischema?.options };
  const placeholder = appliedUiSchemaOptions?.placeholder || schema?.description || '';
  const InputValue = data ? data : 0;
  const clonedSchema = JSON.parse(JSON.stringify(schema));
  const StepValue = clonedSchema.multipleOf ? clonedSchema.multipleOf : 0;
  const MinValue = clonedSchema.minimum ? clonedSchema.minimum : 0;
  const MaxValue = clonedSchema.exclusiveMaximum ? clonedSchema.exclusiveMaximum : 99;
  const errorsFormInput = getErrorsToDisplay(props as ControlProps);

  return (
    <GoAInputNumber
      error={errorsFormInput.length > 0}
      width="100%"
      disabled={!enabled}
      value={InputValue}
      step={StepValue}
      min={MinValue}
      max={MaxValue}
      placeholder={placeholder}
      name={appliedUiSchemaOptions?.name || `${id || label}-input`}
      testId={appliedUiSchemaOptions?.testId || `${id}-input`}
      onBlur={(name: string, value: string) => {
        value = isValidDate(value) ? new Date(value)?.toISOString().substring(0, 10) : '';
        handleChange(path, value);
      }}
      onKeyPress={(name: string, value: string, key: string) => {
        if (!(key === 'Tab' || key === 'Shift')) {
          value = isValidDate(value) ? new Date(value)?.toISOString().substring(0, 10) : '';
          handleChange(path, value);
        }
      }}
      {...uischema?.options?.componentProps}
    />
  );
};

export const GoAIntegerControl = (props: ControlProps) => <GoAInputBaseControl {...props} input={GoAInputInteger} />;

export const GoAIntegerControlTester: RankedTester = rankWith(2, isIntegerControl);
export const GoAInputIntegerControl = withJsonFormsControlProps(GoAIntegerControl);
