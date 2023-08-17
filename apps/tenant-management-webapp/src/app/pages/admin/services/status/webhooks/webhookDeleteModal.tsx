import React from 'react';
import { GoAModal } from '@abgov/react-components-new';
import { GoAButton, GoAButtonGroup } from '@abgov/react-components-new';
import { useDispatch } from 'react-redux';
import { DeleteWebhookService } from '@store/status/actions';
import { Webhooks } from '@store/status/models';

interface WebhookDeleteModalProps {
  onCancel: () => void;
  webhook: Webhooks;
}

export const WebhookDeleteModal = ({ onCancel, webhook }: WebhookDeleteModalProps): JSX.Element => {
  const dispatch = useDispatch();

  return (
    <GoAModal
      testId="webhook-delete-modal"
      open={true}
      heading="Delete webhook"
      width="640px"
      actions={
        <GoAButtonGroup alignment="end">
          <GoAButton type="secondary" testId="webhook-delete-modal-delete-cancel" onClick={onCancel}>
            Cancel
          </GoAButton>
          <GoAButton
            type="primary"
            variant="destructive"
            testId="webhook-delete-modal-delete-btn"
            onClick={() => {
              dispatch(DeleteWebhookService(webhook));
              onCancel();
            }}
          >
            Delete
          </GoAButton>
        </GoAButtonGroup>
      }
    >
      <p>
        Are you sure you wish to delete #<b>{`${webhook?.name}?`}</b>
      </p>
    </GoAModal>
  );
};
