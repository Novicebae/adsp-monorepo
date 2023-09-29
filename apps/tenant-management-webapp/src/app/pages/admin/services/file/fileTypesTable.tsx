import React, { useState } from 'react';
import DataTable from '@components/DataTable';
import { Role } from '@store/tenant/models';
import { GoAContextMenu, GoAContextMenuIcon } from '@components/ContextMenu';
import styled from 'styled-components';
import { GoABadge, GoAButtonGroup, GoAModal, GoAButton } from '@abgov/react-components-new';
import { FileTypeItem } from '@store/file/models';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DeleteModal } from '@components/DeleteModal';
import { useDispatch } from 'react-redux';
import { DeleteFileTypeService } from '@store/file/actions';

interface FileTypeRowProps extends FileTypeItem {
  editId: string;
  editable?: boolean;
  roles?: Role[];
  onEdit?: () => void;
  onDelete?: () => void;
}

interface FileTypeTableProps {
  roles;
  fileTypes;
  coreFileTypes;
}

const FileTypeTableRow = ({
  id,
  name,
  readRoles,
  updateRoles,
  anonymousRead,
  rules,
  onEdit,
  onDelete,
}: FileTypeRowProps): JSX.Element => {
  return (
    <tr key={id}>
      <td>{name}</td>
      <td className="readRolesCol">
        {anonymousRead === false &&
          readRoles.map((role): JSX.Element => {
            return (
              <div key={`read-roles-${role}`}>
                <GoABadge key={`read-roles-${role}`} type="information" content={role} />
              </div>
            );
          })}
        {anonymousRead === true && 'public'}
      </td>
      <td className="updateRolesCol">
        {updateRoles.map((role): JSX.Element => {
          return <GoABadge key={`update-roles-${id}-${role}`} type="information" content={role} />;
        })}
      </td>
      <td>{rules?.retention?.active ? rules?.retention?.deleteInDays : 'N/A'}</td>
      <td className="actionCol">
        <GoAContextMenu>
          <GoAContextMenuIcon
            type="create"
            title="Edit"
            testId={`file-type-row-edit-btn-${id}`}
            onClick={() => {
              onEdit();
            }}
          />
          <GoAContextMenuIcon
            testId={`file-type-row-delete-btn-${id}`}
            title="Delete"
            type="trash"
            onClick={() => {
              onDelete();
            }}
          />
        </GoAContextMenu>
      </td>
    </tr>
  );
};

const CoreFileTypeTableRow = ({
  id,
  name,
  readRoles,
  updateRoles,
  anonymousRead,
  rules,
  onEdit,
  onDelete,
}: FileTypeRowProps): JSX.Element => {
  return (
    <tr key={id}>
      <td>{name}</td>
      <td className="readRolesCol">
        {anonymousRead === false &&
          readRoles.map((role): JSX.Element => {
            return (
              <div key={`read-roles-${role}`}>
                <GoABadge key={`read-roles-${role}`} type="information" content={role} />
              </div>
            );
          })}
        {anonymousRead === true && 'public'}
      </td>
      <td className="updateRolesCol">
        {updateRoles?.map((role): JSX.Element => {
          return <GoABadge key={`update-roles-${id}-${role}`} type="information" content={role} />;
        })}
      </td>
      <td>{rules?.retention?.active ? rules?.retention?.deleteInDays : 'N/A'}</td>
    </tr>
  );
};

export const FileTypeTable = ({ roles, fileTypes, coreFileTypes }: FileTypeTableProps): JSX.Element => {
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteFileType = fileTypes.find((x) => x && x.id === deleteId);
  const { url } = useRouteMatch();
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <div>
      {fileTypes && fileTypes.length > 0 && (
        <TableLayout>
          <DataTable data-testid="file-types-table">
            <thead data-testid="file-types-table-header" id="file-types-table-header">
              <tr>
                <th id="name" data-testid="file-types-table-header-name">
                  Name
                </th>
                <th id="read-roles">Read roles</th>
                <th id="write-roles">Modify roles</th>
                <th id="retention-policy">Retention period</th>
                <th className="actionsCol" id="actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {fileTypes?.map((fileType) => {
                const rowProps = {
                  ...fileType,
                  editId,
                };
                return (
                  <FileTypeTableRow
                    key={`file-type-row-${fileType?.id}`}
                    {...rowProps}
                    onEdit={() => {
                      history.push(`${url}/edit/${fileType?.id}`);
                      setEditId(fileType?.id);
                    }}
                    onDelete={() => {
                      setDeleteId(fileType?.id);
                    }}
                  />
                );
              })}
            </tbody>
          </DataTable>
        </TableLayout>
      )}
      {coreFileTypes && coreFileTypes.length > 0 && (
        <div>
          <h4>Core file types</h4>
          <TableLayout>
            <DataTable data-testid="file-types-table">
              <thead data-testid="file-types-table-header" id="file-types-table-core-header">
                <tr>
                  <th id="name-core" data-testid="file-types-table-header-name">
                    Name
                  </th>
                  <th id="read-roles-core">Read roles</th>
                  <th id="write-roles-core">Modify roles</th>
                  <th id="retention-policy-core">Retention period</th>
                </tr>
              </thead>
              <tbody>
                {coreFileTypes?.map((coreFileType) => {
                  const rowProps = {
                    ...coreFileType,
                    editId,
                  };
                  return (
                    <CoreFileTypeTableRow
                      key={`file-type-row-${coreFileType?.id}`}
                      {...rowProps}
                      onEdit={() => {
                        setEditId(coreFileType?.id);
                      }}
                      onDelete={() => {
                        setDeleteId(coreFileType?.id);
                      }}
                    />
                  );
                })}
              </tbody>
            </DataTable>
          </TableLayout>
        </div>
      )}
      <DeleteModal
        title="Delete file type"
        isOpen={deleteId && deleteFileType?.hasFile === false}
        content={
          <>
            <p>
              Delete the file type <b>{`${deleteFileType?.name}`}</b> cannot be undone.
            </p>
            <p>
              <b>Are you sure you want to continue?</b>
            </p>
          </>
        }
        onCancel={() => {
          setDeleteId(null);
        }}
        onDelete={() => {
          dispatch(DeleteFileTypeService(deleteFileType));
          setDeleteId(null);
        }}
      />
      <GoAModal
        testId="file-type-delete-modal"
        open={deleteId && deleteFileType?.hasFile === true}
        heading="File type current in use"
        actions={
          <GoAButtonGroup alignment="end">
            <GoAButton
              type="secondary"
              testId="file-type-delete-modal-cancel-btn"
              onClick={() => {
                setDeleteId(null);
              }}
            >
              Okay
            </GoAButton>
          </GoAButtonGroup>
        }
      >
        <p>
          You are unable to delete the file type <b>{`${deleteFileType?.name}`}</b> because there are files within the
          file type
        </p>
      </GoAModal>
    </div>
  );
};

const TableLayout = styled.div`
  margin-top: 1em;
  table,
  th,
  td {
    .anonymousCol {
      width: 15%;
    }
    .actionsCol {
      width: 15%;
    }
    .readRolesCol {
      width: 35%;
    }
    .updateRolesCol {
      width: 35%;
    }
  }
`;
