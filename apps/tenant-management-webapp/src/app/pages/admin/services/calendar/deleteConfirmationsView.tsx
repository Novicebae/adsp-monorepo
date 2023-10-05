import React, { FunctionComponent, useEffect, useState } from 'react';
import { CalendarItem } from '@store/calendar/models';
import { GoABadge, GoAButton, GoAButtonGroup, GoAModal } from '@abgov/react-components-new';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '@components/DataTable';
import { TableDiv, OverFlowWrapTableCell } from './styled-components';
import { DeleteModal } from '@components/DeleteModal';
import { DeleteCalendar, FetchEventsByCalendar } from '@store/calendar/actions';
import { GoAContextMenuIcon } from '@components/ContextMenu';
import { RootState } from '@store/index';

import { selectSelectedCalendarEvents, selectSelectedCalendarNextEvents } from '@store/calendar/selectors';

interface calendarTableProps {
  calendarName;
}

export const DeleteConfirmationsView: FunctionComponent<calendarTableProps> = ({ calendarName }) => {
  const selectedEvents = useSelector((state: RootState) => selectSelectedCalendarEvents(state, calendarName));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showUnableToDeleteConfirmation, setShowUnableToDeleteConfirmation] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (selectedEvents?.length) {
      setShowUnableToDeleteConfirmation(true);
    } else {
      setShowDeleteConfirmation(true);
    }
  }, [selectedEvents]);

  // const onDelete = (calendar) => {
  //   dispatch(FetchEventsByCalendar(calendar.name));
  //   setSelectedDeleteCalendar(calendar);
  //   setTimeout(() => {
  //     if (calendarHasEvents) {
  //       setShowUnableToDeleteConfirmation(true);
  //     } else {
  //       setShowDeleteConfirmation(true);
  //     }
  //   }, 1000);
  // };

  // const calendarHasEvents = useSelector(
  //   (state: RootState) => state?.calendarService?.calendars[selectedDeleteCalendar?.name]?.selectedCalendarEvents
  // );

  return (
    <TableDiv key="calendar">
      <DeleteModal
        title="Delete calendar"
        isOpen={showDeleteConfirmation}
        onCancel={() => {
          setShowDeleteConfirmation(false);
        }}
        content={
          <div>
            <div>Delete {calendarName}?</div>
          </div>
        }
        onDelete={() => {
          setShowDeleteConfirmation(false);
          dispatch(DeleteCalendar(calendarName));
        }}
      />
      <GoAModal
        testId="file-type-delete-modal"
        open={showUnableToDeleteConfirmation}
        heading="Calendar current in use"
        actions={
          <GoAButtonGroup alignment="end">
            <GoAButton
              type="secondary"
              testId="file-type-delete-modal-cancel-btn"
              onClick={() => {
                setShowUnableToDeleteConfirmation(false);
              }}
            >
              Okay
            </GoAButton>
          </GoAButtonGroup>
        }
      >
        <p>
          You are unable to delete the calender type <b>{`${calendarName}`}</b> because there are events within the
          calendar type
        </p>
      </GoAModal>
      <br />
    </TableDiv>
  );
};
