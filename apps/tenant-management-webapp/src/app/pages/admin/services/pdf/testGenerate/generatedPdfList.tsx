import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadFileService } from '@store/file/actions';
import { updatePdfResponse } from '@store/pdf/action';
import DataTable from '@components/DataTable';
import { RootState } from '@store/index';
import { GoAIconButton } from '@abgov/react-components/experimental';
import { GoASkeletonGridColumnContent } from '@abgov/react-components';
import CheckmarkCircle from '@components/icons/CheckmarkCircle';
import CloseCircle from '@components/icons/CloseCircle';
import InformationCircle from '@components/icons/InformationCircle';
import { streamPdfSocket } from '@store/pdf/action';
import { FileTableStyles } from '../styled-components';

interface GeneratedPdfListProps {
  templateId: string;
}

const GeneratedPdfList = ({ templateId }: GeneratedPdfListProps): JSX.Element => {
  const dispatch = useDispatch();
  const fileList = useSelector((state: RootState) => state.fileService.fileList);
  const onDownloadFile = async (file) => {
    dispatch(DownloadFileService(file));
  };

  const socketChannel = useSelector((state: RootState) => {
    return state?.pdf.socketChannel;
  });

  useEffect(() => {
    if (!socketChannel || socketChannel.connected === false) dispatch(streamPdfSocket(false));
  }, [socketChannel]);

  useEffect(() => {
    dispatch(updatePdfResponse({ fileList: fileList }));
  }, [fileList]);

  const jobList = useSelector((state: RootState) => state.pdf.jobs);

  const statusGenerator = {
    queued: 'Queued',
    'pdf-generation-queued': 'Queued',
    'pdf-generated': 'Generated',
    'pdf-generation-failed': 'Failed',
  };
  const iconGenerator = {
    queued: <InformationCircle size="medium" />,
    'pdf-generation-queued': <InformationCircle size="medium" />,
    'pdf-generated': <CheckmarkCircle size="medium" />,
    'pdf-generation-failed': <CloseCircle size="medium" />,
  };

  const renderFileTable = () => {
    return (
      <FileTableStyles>
        <DataTable id="files-information">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Size (KB)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobList.map((job, key) => {
              const file = fileList.find((file) => file.recordId === job.id && file.filename.indexOf(templateId) > -1);
              const status = file?.filename ? 'pdf-generated' : job.status;
              return (
                <>
                  {file && (
                    <tr key={job.id}>
                      <td>{job.filename}</td>
                      {/* Use ceil here to make sure people will allocate enough resources */}
                      <td>
                        <div className="flex-horizontal mt-2">
                          <div className="mt-1">{iconGenerator[status]}</div>
                          <div className="flex">{statusGenerator[status]}</div>
                        </div>
                      </td>
                      <td>
                        {file?.size ? (
                          Math.ceil(file.size / 1024)
                        ) : (
                          <div>
                            {job.fileWasGenerated ? (
                              'Deleted'
                            ) : (
                              <GoASkeletonGridColumnContent key={job.id} rows={1}></GoASkeletonGridColumnContent>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {file?.filename ? (
                          <GoAIconButton
                            disabled={!file?.size}
                            data-testid="download-icon"
                            size="medium"
                            type="download"
                            onClick={() => onDownloadFile(file)}
                          />
                        ) : (
                          <div>
                            {!job.fileWasGenerated && (
                              <GoASkeletonGridColumnContent key={job.id} rows={1}></GoASkeletonGridColumnContent>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </DataTable>
      </FileTableStyles>
    );
  };

  return <>{renderFileTable()}</>;
};

export default GeneratedPdfList;
