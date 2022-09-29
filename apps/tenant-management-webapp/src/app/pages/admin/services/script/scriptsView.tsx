import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { UpdateScript, FETCH_SCRIPTS_ACTION, fetchScripts } from '@store/script/actions';
import { ScriptItem, defaultScript } from '@store/script/models';

import { GoAButton } from '@abgov/react-components';
import { FetchRealmRoles } from '@store/tenant/actions';
import { fetchKeycloakServiceRoles } from '@store/access/actions';
import { AddScriptModal } from './addScriptModal';

import { fetchEventStreams } from '@store/stream/actions';
import { tenantRolesAndClients } from '@store/sharedSelectors/roles';
import { ScriptTableComponent } from './scriptList';
import { ActionState } from '@store/session/models';
import { PageIndicator } from '@components/Indicator';
import { renderNoItem } from '@components/NoItem';
import { ScriptEditor } from './editor/scriptEditor';
import { Modal, BodyGlobalStyles, ModalContent, ScriptPanelContainer } from './styled-components';
import { useValidators } from '@lib/useValidators';
import { characterCheck, validationPattern, isNotEmptyCheck, Validator } from '@lib/checkInput';
import { scriptEditorConfig } from './editor/config';

interface AddScriptProps {
  activeEdit: boolean;
}
export const ScriptsView = ({ activeEdit }: AddScriptProps): JSX.Element => {
  const dispatch = useDispatch();
  const [openAddScript, setOpenAddScript] = useState(false);
  const [showScriptEditForm, setShowScriptEditForm] = useState(false);
  const [selectedScript, setSelectedScript] = useState<ScriptItem>(defaultScript);
  const [currentSavedScript, setCurrentSavedScript] = useState<ScriptItem>(defaultScript);
  const { fetchScriptState } = useSelector((state: RootState) => ({
    fetchScriptState: state.scriptService.indicator?.details[FETCH_SCRIPTS_ACTION] || '',
  }));

  useEffect(() => {
    dispatch(fetchScripts());
    dispatch(FetchRealmRoles());
    dispatch(fetchKeycloakServiceRoles());
    dispatch(fetchEventStreams());
  }, []);
  const tenant = useSelector(tenantRolesAndClients);

  const { scripts } = useSelector((state: RootState) => state.scriptService);
  const checkForBadChars = characterCheck(validationPattern.mixedArrowCaseWithSpace);
  const descriptionCheck = (): Validator => (description: string) =>
    description.length > 250 ? 'Description should not exceed 250 characters' : '';

  const { errors, validators } = useValidators('name', 'name', checkForBadChars, isNotEmptyCheck('name'))
    .add('description', 'description', descriptionCheck())
    .build();

  useEffect(() => {
    if (activeEdit) {
      reset();
      setOpenAddScript(true);
    }
  }, [activeEdit]);

  // eslint-disable-next-line

  const reset = () => {
    setSelectedScript(defaultScript);
    setOpenAddScript(false);
    setShowScriptEditForm(false);
  };

  const saveScript = (script: ScriptItem) => {
    dispatch(UpdateScript(script));
  };
  const saveAndReset = () => {
    saveScript(selectedScript);
    reset();
    setShowScriptEditForm(false);
  };
  const onEdit = (script) => {
    setSelectedScript(script);
    setCurrentSavedScript(Object.assign({}, script));
    setShowScriptEditForm(true);
  };
  const onNameChange = (value) => {
    validators.remove('name');
    const validations = {
      name: value,
    };

    validators.checkAll(validations);
    const element: ScriptItem = selectedScript;
    element.name = value;
    setSelectedScript(element);
  };
  const onDescriptionChange = (value) => {
    validators.remove('description');
    validators['description'].check(value);
    const element: ScriptItem = selectedScript;
    element.description = value;
    setSelectedScript(element);
  };
  const onScriptChange = (value) => {
    const element: ScriptItem = selectedScript;
    element.script = value;
    setSelectedScript(element);
  };
  return (
    <>
      <div>
        <GoAButton
          activeEdit={activeEdit}
          data-testid="add-script-btn"
          onClick={() => {
            setSelectedScript(defaultScript);
            setOpenAddScript(true);
          }}
        >
          Add script
        </GoAButton>
        <br />
        <br />
      </div>
      {fetchScriptState === ActionState.inProcess && <PageIndicator />}
      {fetchScriptState === ActionState.completed && !scripts && renderNoItem('script')}
      {fetchScriptState === ActionState.completed && scripts && (
        <div>
          <ScriptTableComponent scripts={scripts} onEdit={onEdit} />
        </div>
      )}

      {openAddScript && (
        <AddScriptModal
          open={true}
          initialValue={selectedScript}
          realmRoles={tenant.realmRoles}
          tenantClients={tenant.tenantClients ? tenant.tenantClients : {}}
          onCancel={() => {
            reset();
          }}
          onSave={saveScript}
        />
      )}
      {
        <Modal open={showScriptEditForm} data-testid="script-edit-form">
          {/* Hides body overflow when the modal is up */}
          <BodyGlobalStyles hideOverflow={showScriptEditForm} />
          <ModalContent>
            <ScriptPanelContainer>
              <ScriptEditor
                editorConfig={scriptEditorConfig}
                name={selectedScript.name}
                description={selectedScript.description}
                scriptStr={selectedScript.script}
                currentScriptItem={currentSavedScript}
                onNameChange={onNameChange}
                onDescriptionChange={onDescriptionChange}
                onScriptChange={onScriptChange}
                errors={errors}
                saveAndReset={saveAndReset}
                onEditorCancel={reset}
              />
            </ScriptPanelContainer>
            {/* Add preview section */}
          </ModalContent>
        </Modal>
      }
    </>
  );
};