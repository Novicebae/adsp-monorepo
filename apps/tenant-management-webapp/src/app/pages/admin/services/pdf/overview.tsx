import React, { FunctionComponent, useEffect } from 'react';
import { GoAButton } from '@abgov/react-components-new';
import { PdfMetrics } from './metrics';
import { useDispatch } from 'react-redux';
import { fetchPdfMetrics } from '@store/pdf/action';
import { OverviewLayout } from '@components/Overview';
import { useNavigate } from 'react-router-dom-6';

interface PdfOverviewProps {
  setOpenAddTemplate: (val: boolean) => void;
}

export const PdfOverview: FunctionComponent<PdfOverviewProps> = ({ setOpenAddTemplate }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    setOpenAddTemplate(false);
    dispatch(fetchPdfMetrics());
  }, []);

  const navigate = useNavigate();
  const description =
    'The PDF service provides PDF operations like generating new PDFs from templates. It runs operations as asynchronous jobs and uploads the output PDF files to the file service.';
  return (
    <OverviewLayout
      testId="pdf-service-overview"
      description={description}
      addButton={
        <>
          <GoAButton
            testId="add-templates"
            onClick={() => {
              navigate('/admin/services/pdf?templates=true');
              setOpenAddTemplate(true);
            }}
          >
            Add template
          </GoAButton>
        </>
      }
      extra={<PdfMetrics />}
    />
  );
};
