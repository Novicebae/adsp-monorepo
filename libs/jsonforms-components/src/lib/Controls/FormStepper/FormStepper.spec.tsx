import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';
import FormStepper from './FormStepperControl';
import { StatePropsOfLayout } from '@jsonforms/core';
import Ajv from 'ajv';
import { Translator } from '@jsonforms/core';
import { AjvProps } from '@jsonforms/material-renderers';
import { TranslateProps } from '@jsonforms/react';
import { ContextProvider } from '../../../lib/Context';
const ajvInstance = new Ajv({ allErrors: true, verbose: true });
jest.mock('@jsonforms/core', () => ({
  ...jest.requireActual('@jsonforms/core'),
  isVisible: jest.fn(() => true), // Mocking isVisible to always return true
  isEnabled: jest.fn(() => true), // Mocking isVisible to always return true
}));
jest.mock('ajv', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    compile: jest.fn((schema) => {
      return jest.fn((data) => {
        return true;
      });
    }),
    validate: jest.fn(),
    addSchema: jest.fn(),
    addFormat: jest.fn(),
  })),
  compile: jest.fn((schema) => {
    return jest.fn((data) => {
      return true;
    });
  }),
  validate: jest.fn(), // Mock the validate method for non-default export
  addSchema: jest.fn(), // Mock any other methods you may need for non-default export
  addFormat: jest.fn(), // Mock any other methods you may need for non-default export
}));

export interface CategorizationStepperLayoutRendererProps extends StatePropsOfLayout, AjvProps, TranslateProps {
  // eslint-disable-next-line
  data: any;
}

const data = {
  firstName: 'Alex',
  address: {
    street: 'Springfield',
  },
};
const data1 = {
  firstName: '',
  address: {
    street: '',
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translator: Translator = (id: string, defaultMessage: string | undefined, values?: any) => {
  return 'Translated text';
};

const schema = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      minLength: 3,
      description: 'Please enter your first name',
    },

    birthDate: {
      type: 'string',
      format: 'date',
      description: 'Please enter your birth date.',
    },
  },
};

const uiSchema = {
  type: 'Categorization',
  elements: [
    {
      type: 'Category',
      label: 'Personal Information',
      elements: [
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/firstName',
            },
          ],
        },
        {
          type: 'HorizontalLayout',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/birthDate',
            },
          ],
        },
      ],
    },
  ],
};

const data2 = {
  provideAddress: true,
  vegetarian: false,
};

const staticProps: CategorizationStepperLayoutRendererProps = {
  uischema: uiSchema,
  schema: schema,
  enabled: true,
  label: 'Date control test',
  config: {},
  path: '',
  data: data2,
  visible: true,
  ajv: ajvInstance,
  locale: '',
  t: translator,
  direction: 'column',
};

describe('form stepper control', () => {
  const mockJsonFormContextValue = {
    data: new Map(),
    functions: new Map(),
    submitFunction: new Map([['submit-form', jest.fn()]]),
  };

  jest.mock('../../Context', () => ({
    ...jest.requireActual('../../Context'),
    JsonFormContext: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Consumer: ({ children }: { children: (value: any) => React.ReactNode }) => children(mockJsonFormContextValue),
    },
  }));

  const CustomWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <ContextProvider> {children}</ContextProvider>;
  };
  it('can render form stepper control', () => {
    const props = staticProps;
    const component = render(<FormStepper {...props} />, { wrapper: CustomWrapper });
    expect(component.getByTestId('form-stepper-test-wrapper')).toBeInTheDocument();
  });
});
