import React, { useEffect, useState } from 'react';
import { RootState } from '@store/index';
import { useDispatch, useSelector } from 'react-redux';
import { getTaskQueues, deleteTaskQueue } from '@store/task/action';
import { PageIndicator } from '@components/Indicator';
import { defaultTaskQueue } from '@store/task/model';
import { DeleteModal } from '@components/DeleteModal';
import { renderNoItem } from '@components/NoItem';
import { QueueListTable } from './queueTable';

export const QueueList = () => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskQueue, setTaskQueue] = useState(defaultTaskQueue);
  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  const taskQueues = useSelector((state: RootState) => {
    return Object.entries(state?.task?.queues)
      .sort((template1, template2) => {
        return template1[1].name.localeCompare(template2[1].name);
      })
      .reduce((tempObj, [taskDefinitionId, taskDefinitionData]) => {
        tempObj[taskDefinitionId] = taskDefinitionData;
        return tempObj;
      }, {});
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTaskQueues());
  }, []);

  return (
    <section>
      <PageIndicator />
      {!indicator.show && Object.keys(taskQueues).length === 0 && renderNoItem('task queues')}
      {!indicator.show && Object.keys(taskQueues).length > 0 && (
        <QueueListTable
          taskQueues={taskQueues}
          onDelete={(currentTemplate) => {
            setShowDeleteConfirmation(true);
            setTaskQueue(currentTemplate);
          }}
        />
      )}
      <DeleteModal
        isOpen={showDeleteConfirmation}
        title="Delete task queue"
        content={
          <div>
            Are you sure you wish to delete <b>{`${taskQueue?.name}?`}</b>
          </div>
        }
        onCancel={() => setShowDeleteConfirmation(false)}
        onDelete={() => {
          setShowDeleteConfirmation(false);
          dispatch(deleteTaskQueue(taskQueue));
        }}
      />
    </section>
  );
};

export default QueueList;
