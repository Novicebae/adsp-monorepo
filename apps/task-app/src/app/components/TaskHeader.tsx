import { GoABadge, GoAButton, GoADivider } from '@abgov/react-components-new';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Task } from '../state';

interface TaskHeaderProps {
  className?: string;
  open: Task;
  isLive: boolean;
  onClickTasks: () => void;
  namespace?: string;
  name?: string;
}

const TaskHeaderComponent: FunctionComponent<TaskHeaderProps> = ({
  className,
  open,
  isLive,
  namespace,
  name,
  onClickTasks,
}) => {
  return (
    <React.Fragment>
      <div className={className}>
        {open ? (
          <>
            <GoAButton type="tertiary" size="compact" onClick={onClickTasks}>
              Tasks
            </GoAButton>
            <span>/</span>
            <span>{open?.name}</span>
          </>
        ) : (
          <span>{`Tasks ${namespace ? `(${namespace}:${name})` : ''}`}</span>
        )}
        <span>
          {isLive ? (
            <GoABadge mt="m" mb="s" type="success" content="Live" />
          ) : (
            <GoABadge mt="m" mb="s" type="information" content="Not live" />
          )}
        </span>
      </div>
      <GoADivider />
    </React.Fragment>
  );
};

export const TaskHeader = styled(TaskHeaderComponent)`
  height: 55px;
  background: white;
  z-index: 1;
  > span {
    margin: auto 0 auto 0;
  }
  > :first-child {
    margin: auto 0 auto 5px;
  }

  > span:first-child {
    margin-left: 14px;
  }

  > :last-child {
    margin-left: var(--goa-space-xl);
  }
`;
