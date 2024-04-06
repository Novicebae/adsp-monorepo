import React, { FunctionComponent, useEffect, useState } from 'react';
import { TemplateEditorContainer, MonacoDiv, EditTemplateActions, MonacoDivBody } from './styled-components';

import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { languages } from 'monaco-editor';
import { buildSuggestions, triggerInScope } from '@lib/autoComplete';
import { Template } from '@store/notification/models';
import { SaveFormModal } from '@components/saveModal';
import { subjectEditorConfig, bodyEditorConfig } from './config';
import { Tab, Tabs } from '@components/Tabs';
import { GoAButton, GoAButtonGroup, GoABadge, GoAFormItem } from '@abgov/react-components-new';
import { areObjectsEqual } from '@lib/objectUtil';

interface TemplateEditorProps {
  modelOpen: boolean;
  mainTitle: string;
  onSubjectChange: (value: string, channel: string) => void;
  onBodyChange: (value: string, channel: string) => void;

  setPreview: (channel: string) => void;
  templates: Template;
  validChannels: string[];

  saveCurrentTemplate?: () => void;
  resetToSavedAction: () => void;
  eventTemplateFormState?: { saveOrAddActionText: string; cancelOrBackActionText: string; mainTitle: string };
  savedTemplates: Template;
  initialChannel: string;
  saveAndReset: (closeEventModal?: boolean) => void;
  validateEventTemplateFields?: () => boolean;
  actionButtons?: JSX.Element;
  // eslint-disable-next-line
  errors?: any;
  serviceName?: string;
  // eslint-disable-next-line
  eventSuggestion?: any;
}

export const TemplateEditor: FunctionComponent<TemplateEditorProps> = ({
  modelOpen,
  mainTitle,
  onSubjectChange,
  onBodyChange,
  setPreview,
  templates,
  validChannels,
  eventTemplateFormState,
  saveCurrentTemplate,
  resetToSavedAction,
  savedTemplates,
  initialChannel,
  saveAndReset,
  validateEventTemplateFields,
  errors,
  serviceName,
  eventSuggestion,
}) => {
  const monaco = useMonaco();
  const bodyEditorHintText =
    "*GOA default header and footer wrapper is applied if the template doesn't include proper <html> opening and closing tags";

  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerCompletionItemProvider('handlebars', {
        triggerCharacters: ['{{', '.'],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });
          const suggestions = triggerInScope(textUntilPosition, position.lineNumber)
            ? buildSuggestions(monaco, eventSuggestion, model, position)
            : [];

          return {
            suggestions,
          } as languages.ProviderResult<languages.CompletionList>;
        },
      });
      return function cleanup() {
        provider.dispose();
      };
    }
  }, [monaco, eventSuggestion]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saveModal, setSaveModal] = useState(false);

  useEffect(() => {
    if (initialChannel) {
      setPreview(initialChannel);
    }
  }, [initialChannel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modelOpen) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [modelOpen]);

  const switchTabPreview = (value) => {
    setPreview(value);
  };

  const tabNames = { sms: 'SMS', bot: 'Bot', email: 'Email' };
  const titleNames = { sms: ' SMS', bot: ' bot', email: 'n email' };
  const saveChangesAction = () => {
    saveCurrentTemplate();
  };

  const resetSavedAction = () => {
    resetToSavedAction();
  };

  let radioOptions = [];

  if (templates) {
    radioOptions = validChannels.map((eventKey, index) => {
      return {
        name: eventKey,
        display: tabNames[eventKey],
        subject: templates[eventKey]?.subject,
        body: templates[eventKey]?.body,
        label: eventKey,
        key: index,
        dataTestId: `${eventKey}-radio-button`,
      };
    });
  } else return null;

  return (
    <TemplateEditorContainer>
      <GoAFormItem label="">
        <Tabs activeIndex={activeIndex} changeTabCallback={(index: number) => switchTabPreview(validChannels[index])}>
          {radioOptions.map((item, key) => (
            <Tab
              data-testid={`${item.display}-tab`}
              key={item.name}
              label={
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div>{item.display}</div>
                  <div style={{ margin: '3px 0 0 5px' }}>
                    {(savedTemplates[item.name]?.body !== templates[item.name]?.body ||
                      savedTemplates[item.name]?.subject !== templates[item.name]?.subject) &&
                    item.body?.length !== 0 &&
                    item.subject?.length !== 0 ? (
                      <div>
                        <div className="mobile">
                          <GoABadge content="" type="information" />
                        </div>
                        <div className="desktop">
                          <GoABadge content="Unsaved" type="information" />
                        </div>
                      </div>
                    ) : (
                      (item.body?.length === 0 || item.subject?.length === 0) && (
                        <div>
                          <div className="mobile">
                            <GoABadge type="important" icon />
                          </div>
                          <div className="desktop">
                            <GoABadge type="important" content="Unfilled" icon />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              }
            >
              <h3 data-testid="modal-title">{`${mainTitle}${titleNames[item.name] || ''} template--${serviceName}`}</h3>

              <>
                <GoAFormItem error={errors['subject'] ?? ''} label="Subject">
                  <MonacoDiv data-testid="templated-editor-subject">
                    <MonacoEditor
                      language={item.name === 'slack' ? 'markdown' : 'handlebars'}
                      data-testid="templated-editor-subject"
                      onChange={(value) => {
                        onSubjectChange(value, item.name);
                      }}
                      value={templates[item.name]?.subject}
                      {...subjectEditorConfig}
                    />
                  </MonacoDiv>
                </GoAFormItem>

                <GoAFormItem
                  error={errors['body'] ?? ''}
                  helpText={errors['body'] ? '' : bodyEditorHintText}
                  label="Body"
                >
                  <MonacoDivBody data-testid="templated-editor-body">
                    <MonacoEditor
                      language={item.name === 'slack' ? 'markdown' : 'handlebars'}
                      value={templates[item.name]?.body}
                      onChange={(value, event) => {
                        onBodyChange(value, item.name);
                      }}
                      {...bodyEditorConfig}
                    />
                  </MonacoDivBody>
                </GoAFormItem>
              </>
            </Tab>
          ))}
        </Tabs>
      </GoAFormItem>
      <EditTemplateActions>
        <GoAButtonGroup alignment="end">
          <GoAButton
            onClick={() => {
              if (JSON.stringify(savedTemplates) !== JSON.stringify(templates)) {
                setSaveModal(true);
              } else {
                resetSavedAction();
              }
            }}
            testId="template-form-close"
            type="secondary"
          >
            {eventTemplateFormState.cancelOrBackActionText}
          </GoAButton>
          <GoAButton
            onClick={() => {
              saveAndReset(true);
            }}
            type="primary"
            testId="template-form-save"
            disabled={!validateEventTemplateFields() || areObjectsEqual(savedTemplates, templates)}
          >
            {eventTemplateFormState.saveOrAddActionText}
          </GoAButton>
        </GoAButtonGroup>
      </EditTemplateActions>

      <SaveFormModal
        open={saveModal}
        onDontSave={() => {
          resetSavedAction();
          setSaveModal(false);
        }}
        onSave={() => {
          saveChangesAction();
          saveAndReset(true);
          setSaveModal(false);
        }}
        onCancel={() => {
          setSaveModal(false);
        }}
        saveDisable={!validateEventTemplateFields()}
      />
    </TemplateEditorContainer>
  );
};
