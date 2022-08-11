import DataTable from '@components/DataTable';
import React, { useState } from 'react';
import { GoACheckbox } from '@abgov/react-components';
import { DataTableWrapper } from './styled-components';

interface ClientRoleTableProps {
  roles: string[];
  roleSelectFunc: (roles: string[], type: string) => void;
  readRoles: string[];
  updateRoles: string[];
  anonymousRead?: boolean;
  clientId: string;
}

export const ClientRoleTable = (props: ClientRoleTableProps): JSX.Element => {
  const [readRoles, setReadRoles] = useState(props.readRoles);
  const [updateRoles, setUpdateRoles] = useState(props.updateRoles);

  return (
    <DataTableWrapper>
      <DataTable noScroll={true}>
        <thead>
          <tr>
            <th id="file-type-roles" className="role-name">
              {props.clientId ? props.clientId + ' roles' : 'Roles'}
            </th>
            <th id="read-role-action" className="role">
              Read
            </th>
            <th id="write-role-action" className="role">
              Modify
            </th>
          </tr>
        </thead>

        <tbody>
          {props.roles?.map((role): JSX.Element => {
            const compositeRole = props.clientId ? `${props.clientId}:${role}` : role;
            return (
              <tr key={`file-type-row-${role}`}>
                <td className="role-name">{role}</td>
                <td className="role">
                  <GoACheckbox
                    name={`file-type-read-role-checkbox-${role}`}
                    key={`file-type-read-role-checkbox-${compositeRole}`}
                    checked={readRoles.includes(compositeRole)}
                    data-testid={`file-type-read-role-checkbox-${role}`}
                    disabled={props.anonymousRead}
                    onChange={() => {
                      if (readRoles.includes(compositeRole)) {
                        const newRoles = readRoles.filter((readRole) => {
                          return readRole !== compositeRole;
                        });
                        setReadRoles(newRoles);
                        props.roleSelectFunc(newRoles, 'read');
                      } else {
                        const newRoles = [...readRoles, compositeRole];
                        setReadRoles(newRoles);
                        props.roleSelectFunc(newRoles, 'read');
                      }
                    }}
                  />
                </td>
                <td className="role">
                  <GoACheckbox
                    name={`file-type-update-role-checkbox-${role}`}
                    key={`file-type-update-role-checkbox-${role}`}
                    checked={updateRoles.includes(compositeRole)}
                    data-testid={`file-type-update-role-checkbox-${role}`}
                    onChange={() => {
                      if (updateRoles.includes(compositeRole)) {
                        const newRoles = updateRoles.filter((updateRole) => {
                          return updateRole !== compositeRole;
                        });
                        setUpdateRoles(newRoles);
                        props.roleSelectFunc(newRoles, 'write');
                      } else {
                        const newRoles = [...updateRoles, compositeRole];
                        setUpdateRoles(newRoles);
                        props.roleSelectFunc(newRoles, 'write');
                      }
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
    </DataTableWrapper>
  );
};