import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { fetchDirectory } from '@store/directory/actions';
import { Service, defaultService } from '@store/directory/models';
import { PageIndicator } from '@components/Indicator';
import { renderNoItem } from '@components/NoItem';
import { GoAButton } from '@abgov/react-components';
import { DeleteModal } from '@components/DeleteModal';
import { DirectoryModal } from './directoryModal';
import { deleteEntry } from '@store/directory/actions';
import { ServiceTableComponent } from './serviceList';
import { toKebabName } from '@lib/kebabName';
import styled from 'styled-components';

export const DirectoryService: FunctionComponent = () => {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState('');
  const [editEntry, setEditEntry] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Service>(defaultService);

  useEffect(() => {
    dispatch(fetchDirectory());
  }, []);

  const coreTenant = 'Platform';
  const tenantName = useSelector((state: RootState) => state.tenant?.name);
  const { directory } = useSelector((state: RootState) => state.directory);

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  const reset = () => {
    setEditEntry(false);
    setSelectedEntry(defaultService);
  };

  const onEdit = (service) => {
    setSelectedEntry(service);
    setModalType('edit');
    setEditEntry(true);
  };
  const onDelete = (service) => {
    setShowDeleteConfirmation(true);
    setSelectedEntry(service);
  };

  const onQuickAdd = (service) => {
    setSelectedEntry(service);
    setModalType('quickAdd');
    setEditEntry(true);
  };
  return (
    <>
      {indicator.show && <PageIndicator />}
      {!indicator.show && !directory && renderNoItem('directory')}
      {!indicator.show && directory && (
        <div>
          <p>Add your own entry so they can be found using the directory.</p>

          {tenantName !== coreTenant && (
            <>
              <NameDiv>{tenantName}</NameDiv>
              <GoAButton
                data-testid="add-directory-btn"
                onClick={() => {
                  defaultService.namespace = toKebabName(tenantName);
                  setSelectedEntry(defaultService);
                  setModalType('new');
                  setEditEntry(true);
                }}
              >
                Add entry
              </GoAButton>

              <ServiceTableComponent
                namespace={tenantName}
                directory={directory}
                isCore={false}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickAdd={onQuickAdd}
              />
            </>
          )}
          <NameDiv>{coreTenant}</NameDiv>
          <ServiceTableComponent
            namespace={coreTenant.toLowerCase()}
            directory={directory}
            isCore={true}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickAdd={onQuickAdd}
          />
        </div>
      )}
      {/* Delete confirmation */}
      {showDeleteConfirmation && (
        <DeleteModal
          isOpen={showDeleteConfirmation}
          title="Delete entry"
          content={`Delete ${
            selectedEntry?.api ? `${selectedEntry?.service}:${selectedEntry?.api}` : selectedEntry.service
          }?`}
          onCancel={() => setShowDeleteConfirmation(false)}
          onDelete={() => {
            setShowDeleteConfirmation(false);
            dispatch(deleteEntry(selectedEntry));
          }}
        />
      )}
      {editEntry && (
        <DirectoryModal
          open={true}
          entry={selectedEntry}
          type={modalType}
          onCancel={() => {
            reset();
          }}
        />
      )}
    </>
  );
};
const NameDiv = styled.div`
  margin-top: 1rem;
  text-transform: capitalize;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  padding-left: 0.4rem;
  padding-bottom: 0.5rem;
`;
