import React from 'react';
import { ControlProps, isEnumControl, OwnPropsOfEnum, RankedTester, rankWith, optionIs, and } from '@jsonforms/core';
import { TranslateProps, withJsonFormsEnumProps, withTranslateProps } from '@jsonforms/react';
import { WithInputProps } from './type';
import merge from 'lodash/merge';
import { GoAInputBaseControl } from './InputBaseControl';
import { WithOptionLabel } from '@jsonforms/material-renderers';
import { GoARadioGroup, GoARadioItem } from '@abgov/react-components-new';
import { EnumCellProps, WithClassname } from '@jsonforms/core';

type RadioGroupProp = EnumCellProps & WithClassname & TranslateProps & WithInputProps;

export const RadioGroup = (props: RadioGroupProp): JSX.Element => {
  const { data, className, id, enabled, schema, uischema, path, handleChange, options, config, label, t } = props;
  const enumData = schema?.enum || [];
  const appliedUiSchemaOptions = merge({}, config, props.uischema.options, uischema, options);

  return (
    <GoARadioGroup
      name={`${options || appliedUiSchemaOptions.label}`}
      testId={`${id || label}-jsonform-dropdown`}
      value={data}
      disabled={!enabled}
      {...appliedUiSchemaOptions}
      onChange={(name: string, value: string) => handleChange(path, value)}
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

export const GoAEnumRadioGroupControl = withJsonFormsEnumProps(withTranslateProps(React.memo(EnumRadioControl)), false);
export const GoARadioGroupControlTester: RankedTester = rankWith(20, and(isEnumControl, optionIs('format', 'radio')));