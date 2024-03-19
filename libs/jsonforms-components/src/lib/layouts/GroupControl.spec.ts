import '@testing-library/jest-dom';
import { GoAGroupControlComponent } from './GroupControl';
import { GroupLayout, LayoutProps } from '@jsonforms/core';
import { render } from '@testing-library/react';

describe('Group Layout tests', () => {
  const groupUiSchema: GroupLayout = {
    type: 'Group',
    elements: [
      {
        type: 'Control',
      },
    ],
    options: {
      componentProps: {
        type: 'success',
        accent: 'thick',
        padding: 'relaxed',
      },
    },
  };

  const groupUiSchemaUndefined: GroupLayout = {
    type: 'Group',
    elements: [
      {
        type: 'Control',
      },
    ],
    options: {
      componentProps: {
        type: undefined,
        accent: undefined,
        padding: undefined,
      },
    },
  };

  const groupUiSchemaInvalidComponentProps: GroupLayout = {
    type: 'Group',
    elements: [
      {
        type: 'Control',
      },
    ],
    options: {
      componentProps: {
        invalidType: 'invalidType-success',
        invalidAccent: 'invalidAccent',
        invalidPadding: 'invalidPadding',
      },
    },
  };

  const staticProps: LayoutProps = {
    uischema: groupUiSchema,
    schema: {},
    enabled: true,
    label: 'Group Name',
    config: {},
    path: '',
    data: '',
    visible: true,
    direction: 'row',
  };

  const staticPropsUndefined: LayoutProps = {
    uischema: groupUiSchemaUndefined,
    schema: {},
    enabled: true,
    label: 'Group Name',
    config: {},
    path: '',
    data: '',
    visible: true,
    direction: 'row',
  };

  const staticPropsInvalidComponentProps: LayoutProps = {
    uischema: groupUiSchemaInvalidComponentProps,
    schema: {},
    enabled: true,
    label: 'Group Name',
    config: {},
    path: '',
    data: '',
    visible: true,
    direction: 'row',
  };

  describe('can create control for GoAGroupControlComponent', () => {
    beforeEach(() => {
      window.matchMedia = jest.fn().mockImplementation((query) => {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      });
    });

    it('can create control', () => {
      const props = { ...staticProps };
      const component = render(GoAGroupControlComponent(props));
      expect(component).toBeDefined();
    });

    it('can check container attributes is valid', () => {
      const props = { ...staticProps };
      const { container } = render(GoAGroupControlComponent(props));

      const el = container.querySelector('goa-container');
      const typeAttribute = el?.getAttribute('type');
      const accentAttribute = el?.getAttribute('accent');
      const relaxedAttribute = el?.getAttribute('padding');

      expect(typeAttribute).toBe('success');
      expect(accentAttribute).toBe('thick');
      expect(relaxedAttribute).toBe('relaxed');
    });

    it('can check container attributes is undefined', () => {
      const props = {
        ...staticPropsUndefined,
      };
      const { container } = render(GoAGroupControlComponent(props));

      const el = container.querySelector('goa-container');
      const typeAttribute = el?.getAttribute('type');
      const accentAttribute = el?.getAttribute('accent');
      const relaxedAttribute = el?.getAttribute('padding');

      //The expect is set to check a null value because when the componentProps is set to undefined, and the .getAttribute gets
      //invoked it will converted it to either or a string or null. So if it is undefined it changes it to a null value.
      expect(typeAttribute).toBeNull();
      expect(accentAttribute).toBeNull();
      expect(relaxedAttribute).toBeNull();
    });

    it('can check attributes is not a proper attribute name', () => {
      const props = {
        ...staticPropsInvalidComponentProps,
      };

      const { container } = render(GoAGroupControlComponent(props));
      const el = container.querySelector('goa-container');

      expect(!el?.getAttributeNames().includes('invalidType')).toBe(true);
      expect(!el?.getAttributeNames().includes('invalidAccent')).toBe(true);
      expect(!el?.getAttributeNames().includes('invalidPadding')).toBe(true);
    });

    it('can check attribute value are invalid for attribute name', () => {
      const props = {
        ...staticPropsInvalidComponentProps,
      };

      const validTypeNames = ['success', 'info', 'non-interactive', 'error', 'interactive'];
      const validAccentNames = ['filled', 'thick', 'thin'];
      const validPaddingNames = ['relaxed', 'compact'];

      const { container } = render(GoAGroupControlComponent(props));
      const el = container.querySelector('goa-container');

      const typeAttribute = el?.getAttribute('type') as string;
      const accentAttribute = el?.getAttribute('accent') as string;
      const relaxedAttribute = el?.getAttribute('padding') as string;

      expect(!validTypeNames.includes(typeAttribute)).toBe(true);
      expect(!validAccentNames.includes(accentAttribute)).toBe(true);
      expect(!validPaddingNames.includes(relaxedAttribute)).toBe(true);
    });
  });
});
