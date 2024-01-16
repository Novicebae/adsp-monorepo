import React from 'react';
import {
  FileTypeTemplateEditorContainer,
  OuterFileTypeTemplateEditorContainer,
  Modal,
  HideTablet,
  FileTypeModalContent,
} from '../styled-components';
import { TabletMessage } from '@components/TabletMessage';
import { useHistory } from 'react-router-dom';
import { EditFileTypeDefinitionEditor } from './editFileTypeDefinitionEditor';

export const FileTypeDefinitionEditor = (): JSX.Element => {
  const history = useHistory();

  const goBack = () => {
    history.push({
      pathname: '/admin/services/file',
    });
  };

  return (
    <>
      <Modal data-testid="fileType-form">
        <FileTypeModalContent>
          <OuterFileTypeTemplateEditorContainer>
            <TabletMessage goBack={goBack} />
            <HideTablet>
              <FileTypeTemplateEditorContainer>
                <EditFileTypeDefinitionEditor />
              </FileTypeTemplateEditorContainer>
            </HideTablet>
          </OuterFileTypeTemplateEditorContainer>
        </FileTypeModalContent>
      </Modal>
    </>
  );
};