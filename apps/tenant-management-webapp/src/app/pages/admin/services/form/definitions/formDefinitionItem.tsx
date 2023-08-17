import React from 'react';
import { FormDefinition } from '@store/form/model';
import { Edit, OverflowWrap } from '../styled-components';
import { GoAIconButton } from '@abgov/react-components-new';
import { useRouteMatch } from 'react-router';
import { useHistory } from 'react-router-dom';

interface PdfTemplateItemProps {
  formDefinition: FormDefinition;
  onDelete?: (FormDefinition) => void;
}

export const FormDefinitionItem = ({ formDefinition, onDelete }: PdfTemplateItemProps): JSX.Element => {
  const { url } = useRouteMatch();
  const history = useHistory();
  return (
    <>
      <tr>
        <td data-testid="form-definitions-name">{formDefinition.name}</td>
        <td data-testid="form-definitions-template-id">{formDefinition.id}</td>
        <td data-testid="form-definitions-description">
          <OverflowWrap>{formDefinition.description}</OverflowWrap>
        </td>
        <td data-testid="form-definitions-action">
          <Edit>
            <GoAIconButton
              testId="form-definition-edit"
              title="Edit"
              size="small"
              icon="create"
              onClick={() => history.push(`${url}/edit/${formDefinition.id}`)}
            />
            <GoAIconButton
              testId={`form-definition-delete`}
              title="Delete"
              size="small"
              icon="trash"
              onClick={() => onDelete(formDefinition)}
            />
          </Edit>
        </td>
      </tr>
    </>
  );
};