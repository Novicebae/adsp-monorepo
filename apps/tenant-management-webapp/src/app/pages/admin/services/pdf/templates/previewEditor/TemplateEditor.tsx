import React, { useEffect, useState } from 'react';
import {
  TemplateEditorContainerPdf,
  EditTemplateActions,
  MonacoDivBody,
  PdfEditorLabelWrapper,
  PdfEditActionLayout,
  PdfEditActions,
  GeneratorStyling,
  PDFTitle,
  ButtonRight,
} from '../../styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { GoAForm, GoAFormItem } from '@abgov/react-components/experimental';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { PdfTemplate } from '@store/pdf/model';
import { languages } from 'monaco-editor';
import { buildSuggestions, triggerInScope } from '@lib/autoComplete';
import { GoAButton } from '@abgov/react-components-new';
import { Tab, Tabs } from '@components/Tabs';
import { SaveFormModal } from '@components/saveModal';
import { PDFConfigForm } from './PDFConfigForm';
import { getSuggestion } from '../utils/suggestion';
import { bodyEditorConfig } from './config';
import GeneratedPdfList from '../generatedPdfList';
import { DeleteModal } from '../DeleteModal';
import { LogoutModal } from '@components/LogoutModal';
import {
  deletePdfFilesService,
  getPdfTemplates,
  updatePdfTemplate,
  setPdfDisplayFileId,
  updateTempTemplate,
} from '@store/pdf/action';
import { RootState } from '@store/index';
import { FetchFileService } from '@store/file/actions';
import { useHistory, useParams } from 'react-router-dom';
import { useDebounce } from '@lib/useDebounce';
const TEMPLATE_RENDER_DEBOUNCE_TIMER = 500; // ms

interface TemplateEditorProps {
  modelOpen: boolean;
  //eslint-disable-next-line
  errors?: any;
}

const isPDFUpdated = (prev: PdfTemplate, next: PdfTemplate): boolean => {
  return (
    prev?.template !== next?.template ||
    prev?.header !== next?.header ||
    prev?.footer !== next?.footer ||
    prev?.additionalStyles !== next?.additionalStyles ||
    prev?.name !== next?.name ||
    prev?.description !== next?.description ||
    prev?.variables !== next?.variables
  );
};

export const TemplateEditor = ({ modelOpen, errors }: TemplateEditorProps): JSX.Element => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const monaco = useMonaco();
  const [saveModal, setSaveModal] = useState(false);

  const pdfTemplate = useSelector((state: RootState) => state?.pdf?.pdfTemplates[id]);

  const [tmpTemplate, setTmpTemplate] = useState(JSON.parse(JSON.stringify(pdfTemplate || '')));
  const [simulatedSaveTemplate, setSimulatedSaveTemplate] = useState(null);
  const suggestion = pdfTemplate ? getSuggestion() : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const notifications = useSelector((state: RootState) => state.notifications.notifications);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const debouncedTmpTemplate = useDebounce(tmpTemplate, TEMPLATE_RENDER_DEBOUNCE_TIMER);

  useEffect(() => {
    if (!pdfTemplate) dispatch(getPdfTemplates());
  }, []);

  const reloadFile = useSelector((state: RootState) => state.pdf?.reloadFile);

  const savePdfTemplate = (value) => {
    const saveObject = JSON.parse(JSON.stringify(value));
    dispatch(updatePdfTemplate(saveObject, 'no-refresh'));
    setSimulatedSaveTemplate(saveObject);
  };

  const history = useHistory();

  const cancel = () => {
    history.push({
      pathname: '/admin/services/pdf',
      state: { activeIndex: 1 },
    });
    dispatch(setPdfDisplayFileId(null));
  };

  useEffect(() => {
    dispatch(updateTempTemplate(tmpTemplate));
  }, [debouncedTmpTemplate]);

  useEffect(() => {
    if (reloadFile && reloadFile[pdfTemplate.id]) {
      dispatch(FetchFileService(reloadFile[pdfTemplate.id]));
    }
  }, [reloadFile]);

  useEffect(() => {
    setTmpTemplate(pdfTemplate);
    setSimulatedSaveTemplate(pdfTemplate);
  }, [pdfTemplate]);

  const template = simulatedSaveTemplate;

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
            ? buildSuggestions(monaco, suggestion, model, position)
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
  }, [monaco, suggestion]);

  useEffect(() => {
    if (modelOpen) {
      setActiveIndex(0);
    } else {
      setActiveIndex(-1);
    }
  }, [modelOpen]);

  const monacoHeight = `calc(100vh - 585px${notifications.length > 0 ? ' - 80px' : ''})`;

  return (
    <TemplateEditorContainerPdf>
      <LogoutModal />
      <PDFTitle>PDF / Template Editor</PDFTitle>
      <hr className="hr-resize" />
      {template && <PDFConfigForm template={template} />}

      <GoAForm>
        <GoAFormItem>
          <Tabs style={{ minWidth: '4.5em' }} activeIndex={activeIndex}>
            <Tab testId={`pdf-edit-header`} label={<PdfEditorLabelWrapper>Header</PdfEditorLabelWrapper>}>
              <GoAFormItem error={errors?.header ?? ''}>
                <MonacoDivBody style={{ height: monacoHeight }}>
                  {template && (
                    <MonacoEditor
                      language={'handlebars'}
                      value={tmpTemplate?.header}
                      onChange={(value) => {
                        setTmpTemplate({ ...tmpTemplate, header: value });
                      }}
                      {...bodyEditorConfig}
                    />
                  )}
                </MonacoDivBody>
              </GoAFormItem>
            </Tab>
            <Tab testId={`pdf-edit-body`} label={<PdfEditorLabelWrapper>Body</PdfEditorLabelWrapper>}>
              <>
                <GoAFormItem error={errors?.body ?? null}>
                  <MonacoDivBody style={{ height: monacoHeight }}>
                    <MonacoEditor
                      language={'handlebars'}
                      value={tmpTemplate?.template}
                      onChange={(value) => {
                        setTmpTemplate({ ...tmpTemplate, template: value });
                      }}
                      {...bodyEditorConfig}
                    />
                  </MonacoDivBody>
                </GoAFormItem>
              </>
            </Tab>
            <Tab testId={`pdf-edit-footer`} label={<PdfEditorLabelWrapper>Footer</PdfEditorLabelWrapper>}>
              <GoAFormItem error={errors?.footer ?? ''}>
                <MonacoDivBody style={{ height: monacoHeight }}>
                  <MonacoEditor
                    language={'handlebars'}
                    value={tmpTemplate?.footer}
                    onChange={(value) => {
                      setTmpTemplate({ ...tmpTemplate, footer: value });
                    }}
                    {...bodyEditorConfig}
                  />
                </MonacoDivBody>
              </GoAFormItem>
            </Tab>
            <Tab testId={`pdf-edit-css`} label={<PdfEditorLabelWrapper>CSS</PdfEditorLabelWrapper>}>
              <>
                <GoAFormItem error={errors?.body ?? null}>
                  <MonacoDivBody style={{ height: monacoHeight }}>
                    <MonacoEditor
                      language={'handlebars'}
                      value={tmpTemplate?.additionalStyles}
                      onChange={(value) => {
                        setTmpTemplate({ ...tmpTemplate, additionalStyles: value });
                      }}
                      {...bodyEditorConfig}
                    />
                  </MonacoDivBody>
                </GoAFormItem>
              </>
            </Tab>
            <Tab testId={`pdf-test-generator`} label={<PdfEditorLabelWrapper>Test data</PdfEditorLabelWrapper>}>
              <GoAFormItem error={errors?.body ?? null}>
                <MonacoDivBody style={{ height: monacoHeight }}>
                  <MonacoEditor
                    data-testid="form-schema"
                    value={tmpTemplate?.variables}
                    onChange={(value) => {
                      setTmpTemplate({ ...tmpTemplate, variables: value });
                    }}
                    language="json"
                    {...bodyEditorConfig}
                  />
                </MonacoDivBody>
              </GoAFormItem>
            </Tab>
            <Tab testId={`pdf-test-history`} label={<PdfEditorLabelWrapper>File history</PdfEditorLabelWrapper>}>
              <>
                <GeneratorStyling style={{ height: `calc(${monacoHeight} - 1.5em` }}>
                  <ButtonRight>
                    <GoAButton
                      type="secondary"
                      testId="pdf-delete-all-files"
                      size="compact"
                      onClick={() => {
                        setShowDeleteConfirmation(true);
                      }}
                    >
                      Delete all files
                    </GoAButton>
                  </ButtonRight>
                  <section>{template?.id && <GeneratedPdfList templateId={template.id} />}</section>
                </GeneratorStyling>
              </>
            </Tab>
          </Tabs>
          <hr className="hr-resize-bottom" />
          <EditTemplateActions>
            <PdfEditActionLayout>
              <PdfEditActions>
                <>
                  <GoAButton
                    disabled={!isPDFUpdated(tmpTemplate, template)}
                    onClick={() => savePdfTemplate(tmpTemplate)}
                    type="primary"
                    testId="template-form-save"
                  >
                    Save
                  </GoAButton>
                  <GoAButton
                    onClick={() => {
                      if (isPDFUpdated(tmpTemplate, template)) {
                        setSaveModal(true);
                      } else {
                        cancel();
                      }
                    }}
                    testId="template-form-close"
                    type="tertiary"
                  >
                    Back
                  </GoAButton>
                </>
              </PdfEditActions>
            </PdfEditActionLayout>
          </EditTemplateActions>
        </GoAFormItem>
      </GoAForm>
      {/* Delete confirmation */}
      {showDeleteConfirmation && (
        <DeleteModal
          isOpen={showDeleteConfirmation}
          title="Delete PDF file"
          content={<div>Are you sure you wish to delete all files?</div>}
          onCancel={() => setShowDeleteConfirmation(false)}
          onDelete={() => {
            setShowDeleteConfirmation(false);
            dispatch(deletePdfFilesService(template.id));
          }}
        />
      )}
      <SaveFormModal
        open={saveModal}
        onDontSave={() => {
          setSaveModal(false);
          // resetSavedAction();
          cancel();
        }}
        onSave={() => {
          savePdfTemplate(tmpTemplate);
          setSaveModal(false);
          cancel();
        }}
        saveDisable={false}
        onCancel={() => {
          setSaveModal(false);
        }}
      />
    </TemplateEditorContainerPdf>
  );
};
