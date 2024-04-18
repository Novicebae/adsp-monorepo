import React from 'react';
import { ControlProps, isEnumControl, OwnPropsOfEnum, RankedTester, rankWith, optionIs, and } from '@jsonforms/core';
import { TranslateProps, withJsonFormsEnumProps, withTranslateProps } from '@jsonforms/react';
import { WithInputProps } from './type';
import merge from 'lodash/merge';
import { GoAInputBaseControl } from './InputBaseControl';
import { WithOptionLabel } from '../../util';
import { GoARadioGroup, GoARadioItem } from '@abgov/react-components-new';
import { EnumCellProps, WithClassname } from '@jsonforms/core';
import { checkFieldValidity } from '../../util/stringUtils';

type RadioGroupProp = EnumCellProps & WithClassname & TranslateProps & WithInputProps;

export const RadioGroup = (props: RadioGroupProp): JSX.Element => {
  const { data, className, id, enabled, schema, uischema, path, handleChange, options, config, label, t } = props;
  const enumData = schema?.enum || [];
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options, uischema, options);
  const errorsFormInput = checkFieldValidity(props as ControlProps);
  return (
    <GoARadioGroup
      error={errorsFormInput.length > 0}
      name={`${options || appliedUiSchemaOptions.label}`}
      testId={`${label || id}-jsonforms-radio`}
      value={data}
      disabled={!enabled}
      {...appliedUiSchemaOptions}
      onChange={(name: string, value: string) => handleChange(path, value)}
      {...uischema?.options?.componentProps}
    >
      {enumData.map((value) => {
        return <GoARadioItem name={value} value={`${value}`} label={value} {...appliedUiSchemaOptions} />;
      })}
    </GoARadioGroup>
  );
};

export const EnumRadioControl = (props: ControlProps & OwnPropsOfEnum & WithOptionLabel & TranslateProps) => {
  return <GoAInputBaseControl {...props} input={RadioGroup} />;
};

export const GoAEnumRadioGroupControl = withJsonFormsEnumProps(withTranslateProps(EnumRadioControl), true);
export const GoARadioGroupControlTester: RankedTester = rankWith(20, and(isEnumControl, optionIs('format', 'radio')));
