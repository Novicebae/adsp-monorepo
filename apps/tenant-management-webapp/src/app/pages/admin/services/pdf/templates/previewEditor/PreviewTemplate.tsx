import React, { FunctionComponent } from 'react';
import { PreviewContainer, BodyPreview } from '../../styled-components';

interface PreviewTemplateProps {
  channelTitle: string;
  bodyPreviewContent: string;
  headerPreviewContent: string;
  footerPreviewContent: string;
  channel: string;
}

export const PreviewTemplate: FunctionComponent<PreviewTemplateProps> = ({
  channelTitle,
  bodyPreviewContent,
  headerPreviewContent,
  footerPreviewContent,
  channel,
}) => {
  const PdfPreview = () => {
    return (
      <>
        <h3>{channelTitle}</h3>
        <BodyPreview title={channelTitle} html={bodyPreviewContent}></BodyPreview>
      </>
    );
  };

  const HeaderFooterPreview = () => {
    return (
      <>
        <h3>Header</h3>
        <BodyPreview data-testid="header-preview-subject" title="Header" html={headerPreviewContent}></BodyPreview>
        <h3>Footer</h3>
        <BodyPreview data-testid="footer-preview-subject" title="Footer" html={footerPreviewContent}></BodyPreview>
      </>
    );
  };

  const previewByType = {
    main: <PdfPreview />,
    'footer/header': <HeaderFooterPreview />,
    'Variable assignments': <PdfPreview />,
  };

  return <PreviewContainer>{previewByType[channel]}</PreviewContainer>;
};
