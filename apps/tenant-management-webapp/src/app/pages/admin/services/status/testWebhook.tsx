import React, { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TestWebhooks } from '../../../../store/status/actions';
import { Webhooks } from '../../../../store/status/models';
import DataTable from '@components/DataTable';
import { EventSearchCriteria } from '@store/event/models';
import { getEventLogEntries } from '@store/event/actions';
import { GoAButton, GoARadio } from '@abgov/react-components';
import { getEventDefinitions } from '@store/event/actions';

import { GoAPageLoader } from '@abgov/react-components';

import { renderNoItem } from '@components/NoItem';
import styled from 'styled-components';

import {
  GoAForm,
  GoAFormItem,
  GoAModal,
  GoAModalActions,
  GoAModalContent,
  GoAModalTitle,
} from '@abgov/react-components/experimental';

import { RootState } from '../../../../store/index';

interface Props {
  isOpen: boolean;
  title: string;
  testId: string;

  defaultWebhooks: Webhooks;
  onClose?: () => void;
}

export const TestWebhookModal: FC<Props> = ({ isOpen, title, onClose, testId, defaultWebhooks }: Props) => {
  const dispatch = useDispatch();

  const [showEntries, setShowEntries] = useState<boolean>(false);
  const [selectedStatusName, setSelectedStatusName] = useState<string>('monitored-service-down');

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  const webhook = defaultWebhooks;

  const initCriteria: EventSearchCriteria = {
    name: 'webhook-triggered',
    namespace: 'push-service',
    timestampMax: '',
    timestampMin: '',
    url: webhook.url,
    applications: webhook.targetId,
    value: webhook.targetId,
    top: 1,
  };

  const entries = useSelector((state: RootState) => state.event.entries);
  const testSuccess = useSelector((state: RootState) => state.serviceStatus.testSuccess);

  useEffect(() => {
    dispatch(getEventDefinitions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getEventLogEntries('', initCriteria));
    setShowEntries(true);
  }, [testSuccess]);

  useEffect(() => {
    setShowEntries(false);
  }, [isOpen]);

  const test = async (eventName: string) => {
    dispatch(TestWebhooks(webhook, eventName));
  };

  const definitions = useSelector((state: RootState) => state.event.results.map((r) => state.event.definitions[r]));

  const groupedDefinitions = definitions.reduce((acc, def) => {
    acc[def.namespace] = acc[def.namespace] || [];
    acc[def.namespace].push(def);
    return acc;
  }, {});
  let orderedGroupNames = Object.keys(groupedDefinitions).sort((prev, next): number => {
    if (groupedDefinitions[prev][0].isCore > groupedDefinitions[next][0].isCore) {
      return 1;
    }
    if (prev > next) {
      return 1;
    }
    return -1;
  });

  orderedGroupNames = [
    ...Object.keys(groupedDefinitions).filter((g) => g === 'status-service'),
    ...Object.keys(groupedDefinitions).filter((g) => g !== 'status-service'),
  ];

  return (
    <GoAModalStyle>
      <GoAModal isOpen={isOpen} testId={testId}>
        <GoAModalTitle>
          {title} - {webhook.name}
        </GoAModalTitle>
        <GoAModalContent>
          <GoAForm>
            <GoAFormItem>
              <label className="margin-bottom">Events</label>
              {!orderedGroupNames && renderNoItem('event definition')}

              <DataTable data-testid="events-definitions-table">
                {['monitored-service-down', 'monitored-service-up'].map((name) => {
                  return (
                    <GoARadio
                      key={`selectedStatusName-${name}`}
                      value={name}
                      testId="preferred-channel-email-opt"
                      checked={name === selectedStatusName}
                      onChange={() => setSelectedStatusName(name)}
                    >
                      {name}
                    </GoARadio>
                  );
                })}
              </DataTable>
            </GoAFormItem>

            <EntryDetail>
              {indicator.show ? (
                <div className="loading-border">
                  <GoAPageLoader visible={true} type="infinite" message={indicator.message} pagelock={true} />
                </div>
              ) : (
                showEntries &&
                (entries
                  ? JSON.stringify(entries[0], null, 2)
                  : 'No timely response from webhook test server - please try again')
              )}
            </EntryDetail>
          </GoAForm>
        </GoAModalContent>
        <GoAModalActions>
          <ButtonWrapper>
            <GoAButton buttonType="secondary" onClick={() => test(selectedStatusName)}>
              Test
            </GoAButton>

            <GoAButton
              buttonType="primary"
              onClick={() => {
                onClose();
              }}
            >
              Close
            </GoAButton>
          </ButtonWrapper>
        </GoAModalActions>
      </GoAModal>
    </GoAModalStyle>
  );
};

const GoAModalStyle = styled.div`
  .group-name {
    font-size: var(--fs-lg);
    font-weight: var(--fw-bold);
  }

  .margin-bottom {
    margin-bottom: 0.25rem;
  }

  .minute-button {
    border: 1px solid #666666;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    background: #f1f1f1;
    padding: 7px 12px 7px 12px;
    margin-left: -3px;
  }

  .loading-border {
    margin-top: 75px;
  }

  .progress-container--large {
    background: #f3f3f3;
  }
`;

export const IdField = styled.div`
  min-height: 1.6rem;
`;

export const HelpText = styled.div`
  font-size: var(--fs-sm);
  color: var(--color-gray-900);
  line-height: calc(var(--fs-sm) + 0.5rem);
  display: flex;
  display-direction: row;
  justify-content: space-between;
  margin-top: 2px;
`;

export const ErrorMsg = styled.div`
   {
    display: inline-flex;
    color: var(--color-red);
    pointer-events: none;
    gap: 0.25rem;
  }
`;

export const Events = styled.div`
   {
    display: flex;
  }
`;

export const ButtonWrapper = styled.div`
   {
    .goa-button {
      margin-left: 1.5rem;
    }
  }
`;

export const NoPaddingTd = styled.td`
  padding: 0px !important;
`;

export const EntryDetail = styled.div`
  background: #f3f3f3;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
  line-height: 12px;
  padding: 16px;
  margin-bottom: 4px;
  text-align: left;
  min-height: 320px;
`;
