import React, { useEffect, useState } from 'react';

import { GoAButton } from '@abgov/react-components-new';

import { useDispatch, useSelector } from 'react-redux';
import { getFormDefinitions, deleteFormDefinition } from '@store/form/action';
import { RootState } from '@store/index';
import { renderNoItem } from '@components/NoItem';
import { FormDefinitionsTable } from './definitionsList';
import { PageIndicator } from '@components/Indicator';
import { defaultFormDefinition } from '@store/form/model';

import { DeleteModal } from '@components/DeleteModal';
import { useHistory } from 'react-router-dom';
import { useRouteMatch } from 'react-router';

export const FormDefinitions = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentDefinition, setCurrentDefinition] = useState(defaultFormDefinition);

  const formDefinitions = useSelector((state: RootState) => {
    return Object.entries(state?.form?.definitions)
      .sort((template1, template2) => {
        return template1[1].name.localeCompare(template2[1].name);
      })
      .reduce((tempObj, [formDefinitionId, formDefinitionData]) => {
        tempObj[formDefinitionId] = formDefinitionData;
        return tempObj;
      }, {});
  });

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  const history = useHistory();
  const { url } = useRouteMatch();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFormDefinitions());
  }, []);

  // eslint-disable-next-line
  useEffect(() => {}, [formDefinitions]);

  return (
    <>
      <div>
        <br />
        <GoAButton
          testId="add-definition"
          onClick={() => {
            history.push(`${url}/new?definitions=true`);
          }}
        >
          Add definition
        </GoAButton>
        <br />
        <br />
        <PageIndicator />

        {!indicator.show && !formDefinitions && renderNoItem('form templates')}
        {!indicator.show && formDefinitions && (
          <FormDefinitionsTable
            definitions={formDefinitions}
            onDelete={(currentTemplate) => {
              setShowDeleteConfirmation(true);
              setCurrentDefinition(currentTemplate);
            }}
          />
        )}

        <DeleteModal
          isOpen={showDeleteConfirmation}
          title="Delete form definition"
          content={
            <div>
              Are you sure you wish to delete <b>{`${currentDefinition?.name}?`}</b>
            </div>
          }
          onCancel={() => setShowDeleteConfirmation(false)}
          onDelete={() => {
            setShowDeleteConfirmation(false);
            dispatch(deleteFormDefinition(currentDefinition));
          }}
        />
      </div>
    </>
  );
};