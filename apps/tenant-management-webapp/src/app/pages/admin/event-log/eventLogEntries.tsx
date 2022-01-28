import DataTable from '@components/DataTable';
import { RootState } from '@store/index';
import { EventLogEntry, EventSearchCriteria } from '@store/event/models';
import React, { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { GoAContextMenu, GoAContextMenuIcon } from '@components/ContextMenu';

interface CorrelationIndicatorProps {
  color: string;
}
const IndicatorDiv = styled.div`
  width: 12px;
  height: 12px;
  background: ${(props) => props.color};
  border-radius: 100%;
`;

const CorrelationIndicator: FunctionComponent<CorrelationIndicatorProps> = ({ color }) => {
  return color && <IndicatorDiv color={color} />;
};

interface EventLogEntryComponentProps {
  entry: EventLogEntry;
  correlationColors: Record<string, string>;
  addCorrelationColor: (id: string) => string;
  onSearchRelated: (correlationId: string) => void;
}

const EventLogEntryComponent: FunctionComponent<EventLogEntryComponentProps> = ({
  entry,
  correlationColors,
  addCorrelationColor,
  onSearchRelated,
}: EventLogEntryComponentProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <tr>
        <td headers="correlation">
          <CorrelationIndicator
            color={
              entry.correlationId &&
              (correlationColors[entry.correlationId] || addCorrelationColor(entry.correlationId))
            }
          />
        </td>
        <td headers="timestamp">
          <span>{entry.timestamp.toLocaleDateString()}</span>
          <span>{entry.timestamp.toLocaleTimeString()}</span>
        </td>
        <td headers="namespace">{entry.namespace}</td>
        <td headers="name">{entry.name}</td>
        <td headers="action">
          <GoAContextMenu>
            <GoAContextMenuIcon
              title="Toggle details"
              type={showDetails ? 'eye-off' : 'eye'}
              onClick={() => setShowDetails(!showDetails)}
              testId="toggle-details-visibility"
            />
            {entry.correlationId && (
              <GoAContextMenuIcon
                title="Search related"
                type="search-circle"
                onClick={() => onSearchRelated(entry.correlationId)}
                testId="search-related"
              />
            )}
          </GoAContextMenu>
        </td>
      </tr>
      {showDetails && (
        <tr>
          <td headers="correlation timestamp namespace name details" colSpan={5} className="event-details">
            <div>{JSON.stringify(entry.details, null, 2)}</div>
          </td>
        </tr>
      )}
    </>
  );
};

interface EventLogEntriesComponentProps {
  className?: string;
  onSearch: (criteria: EventSearchCriteria) => void;
}

const EventLogEntriesComponent: FunctionComponent<EventLogEntriesComponentProps> = ({ className, onSearch }) => {
  const entries = useSelector((state: RootState) => state.event.entries);
  const [colors, setColors] = useState({});

  return (
    <div className={className}>
      <DataTable>
        <thead>
          <tr>
            <th id="correlation"></th>
            <th id="timestamp">Timestamp</th>
            <th id="namespace">Namespace</th>
            <th id="name">Name</th>
            <th id="action">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <EventLogEntryComponent
              key={`${entry.timestamp}${entry.namespace}${entry.name}`}
              entry={entry}
              correlationColors={colors}
              addCorrelationColor={(id) => {
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                setColors({
                  ...colors,
                  [id]: randomColor,
                });
                return randomColor;
              }}
              onSearchRelated={(correlationId) => onSearch({ correlationId })}
            />
          ))}
        </tbody>
      </DataTable>
    </div>
  );
};

export const EventLogEntries = styled(EventLogEntriesComponent)`
  & .event-details {
    div {
      background: #f3f3f3;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 12px;
      line-height: 16px;
      padding: 16px;
    }
    padding: 0;
  }
  & span {
    margin-right: 8px;
  }
`;
