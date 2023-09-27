import React, { useEffect, useState } from 'react';
import {
  GoAModal,
  GoAFormItem,
  GoAButton,
  GoAButtonGroup,
  GoAInput,
  GoATextArea,
  GoACheckbox,
  GoAInputDate,
  GoAInputTime,
  GoAGrid,
} from '@abgov/react-components-new';
import { selectAddModalEvent, selectSelectedCalendarEventNames } from '@store/calendar/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { useValidators } from '@lib/validation/useValidators';
import { isNotEmptyCheck, wordMaxLengthCheck, duplicateNameCheck, badCharsCheck } from '@lib/validation/checkInput';
import { ResetModalState } from '@store/session/actions';
import { CheckBoxWrapper } from '../styled-components';
import { CalendarEvent } from '@store/calendar/models';
import { CreateEventsByCalendar, UpdateEventsByCalendar } from '@store/calendar/actions';

interface EventAddEditModalProps {
  calendarName: string;
}
export const EventAddEditModal = ({ calendarName }: EventAddEditModalProps): JSX.Element => {
  const initCalendarEvent = useSelector((state) => selectAddModalEvent(state, calendarName));
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent>(null);
  const calendarEvents = useSelector((state) => selectSelectedCalendarEventNames(state, calendarName));
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  //eslint-disable-next-line
  const [isEndBeforeStart, setIsEndBeforeStart] = useState(false);

  const isEdit = !!calendarEvent?.id;
  if (isEdit) {
    const indexToRemove: number = calendarEvents.indexOf(calendarEvent.name);

    if (indexToRemove !== -1) {
      calendarEvents.splice(indexToRemove, 1);
    }
  }

  const { errors, validators } = useValidators(
    'name',
    'name',
    badCharsCheck,
    wordMaxLengthCheck(32, 'Name'),
    isNotEmptyCheck('name')
  )
    .add('duplicated', 'name', badCharsCheck, duplicateNameCheck(calendarEvents, 'Calendar Events'))
    .add('description', 'description', wordMaxLengthCheck(250, 'Description'))
    .add('start', 'start', isNotEmptyCheck('start'))
    .add('end', 'end', isNotEmptyCheck('end'))
    .build();
  // eslint-disable-next-line

  useEffect(() => {
    if (calendarEvent === null || calendarEvent?.name !== initCalendarEvent?.name) {
      setCalendarEvent(initCalendarEvent);
    }
    if (initCalendarEvent?.start) {
      setStartTime(getTimeString(initCalendarEvent?.start));
      setEndTime(getTimeString(initCalendarEvent?.end));
      setStartDate(initCalendarEvent?.start);
      setEndDate(initCalendarEvent?.end);
    }
  }, [initCalendarEvent]);
  // eslint-disable-next-line
  const getTimeString = (calendarDateString: string) => {
    const calendarDate = new Date(calendarDateString);
    return `${calendarDate.getHours()}:${calendarDate.getMinutes()}:${calendarDate.getSeconds()}`;
  };
  const setTimeString = (dateString, timeString) => {
    const dateDate = new Date(dateString);
    if (timeString) {
      dateDate.setHours(timeString.split(':')[0]);
      dateDate.setMinutes(timeString.split(':')[1]);
      dateDate.setSeconds(timeString.split(':')[2]);
    }
    return dateDate.toISOString();
  };
  const getEndDateValue = () => {
    if (calendarEvent?.isAllDay) {
      return new Date(calendarEvent?.start);
    }
    return calendarEvent?.end ? new Date(calendarEvent?.end) : new Date();
  };

  const modalTitle = `${isEdit ? 'Edit' : 'Add'} calendar event`;
  const dispatch = useDispatch();
  return (
    <GoAModal
      open={initCalendarEvent !== null}
      heading={modalTitle}
      actions={
        <GoAButtonGroup alignment="end">
          <GoAButton
            type="secondary"
            testId="calendar-modal-cancel"
            onClick={() => {
              dispatch(ResetModalState());
              validators.clear();
            }}
          >
            Cancel
          </GoAButton>
          <GoAButton
            type="primary"
            testId="calendar-modal-save"
            disabled={validators.haveErrors()}
            onClick={() => {
              if (new Date(calendarEvent.start) > new Date(calendarEvent.end)) {
                setIsEndBeforeStart(true);
                errors['end'] = 'End of event must be after start of event.';
                return;
              }
              const validations = {
                name: calendarEvent.name,
                end: calendarEvent.end,
              };
              validations['duplicated'] = calendarEvent.name;
              if (!validators.checkAll(validations)) {
                return;
              }

              if (calendarEvent.isAllDay) {
                const theDay = new Date(calendarEvent.start);
                const theDayStart = theDay.setHours(0, 0, 0, 0);
                const theDayEnd = theDay.setHours(23, 59, 59, 999);
                calendarEvent.start = new Date(theDayStart).toISOString();
                calendarEvent.end = new Date(theDayEnd).toISOString();
              }

              if (isEdit) {
                dispatch(UpdateEventsByCalendar(calendarName, calendarEvent.id.toString(), calendarEvent));
              } else {
                dispatch(CreateEventsByCalendar(calendarName, calendarEvent));
              }
              dispatch(ResetModalState());
              validators.clear();
              setIsEndBeforeStart(false);
            }}
          >
            Save
          </GoAButton>
        </GoAButtonGroup>
      }
    >
      <GoAFormItem error={errors?.['name']} label="Name">
        <GoAInput
          type="text"
          name="name"
          value={calendarEvent?.name}
          testId={`calendar-event-modal-name-input`}
          aria-label="name"
          width="100%"
          onChange={(name, value) => {
            const validations = {
              name: value,
            };
            validators.remove('name');
            validators.checkAll(validations);
            setCalendarEvent({ ...calendarEvent, name: value });
          }}
        />
      </GoAFormItem>
      <GoAFormItem error={errors?.['description']} label="Description">
        <GoATextArea
          name="description"
          value={calendarEvent?.description}
          testId={`calendar-event-modal-description-input`}
          aria-label="description"
          width="100%"
          onChange={(name, value) => {
            validators.remove('description');
            validators['description'].check(value);
            setCalendarEvent({ ...calendarEvent, description: value });
          }}
        />
      </GoAFormItem>
      <CheckBoxWrapper>
        <GoACheckbox
          name="isPublicCheckbox"
          checked={calendarEvent?.isPublic}
          text={'Is public '}
          onChange={(name, value) => {
            setCalendarEvent({ ...calendarEvent, isPublic: value });
          }}
        />
      </CheckBoxWrapper>
      <CheckBoxWrapper>
        <GoACheckbox
          name="isAllDayCheckbox"
          checked={calendarEvent?.isAllDay}
          text={'Is all day'}
          onChange={(name, value) => {
            setCalendarEvent({ ...calendarEvent, isAllDay: value });
          }}
        />
      </CheckBoxWrapper>
      <GoAGrid minChildWidth="25ch" gap="s">
        <GoAFormItem label="Start Date" error={errors?.['start']}>
          <GoAInputDate
            name="StartDate"
            value={calendarEvent?.start ? new Date(calendarEvent.start) : new Date()}
            width="100%"
            testId="calendar-event-modal-start-date-input"
            onChange={(name, value) => {
              validators.remove('start');
              validators['start'].check(value.toString());
              setStartDate(value.toLocaleString());
              setCalendarEvent({ ...calendarEvent, start: setTimeString(value.toLocaleString(), startTime) });
            }}
          />
        </GoAFormItem>
        <GoAFormItem label="Start Time">
          <GoAInputTime
            name="StartTime"
            value={startTime}
            step={1}
            width="100%"
            testId="calendar-event-modal-start-time-input"
            disabled={calendarEvent?.isAllDay}
            onChange={(name, value) => {
              setCalendarEvent({ ...calendarEvent, start: setTimeString(startDate, value) });
            }}
          />
        </GoAFormItem>
      </GoAGrid>

      <GoAGrid minChildWidth="25ch" gap="s">
        <GoAFormItem label="End Date" error={errors?.['end']}>
          <GoAInputDate
            name="endDate"
            value={getEndDateValue()}
            width="100%"
            testId="calendar-event-modal-end-date-input"
            onChange={(name, value) => {
              validators.remove('end');
              validators['end'].check(value.toString());
              setEndDate(value.toLocaleString());
              setCalendarEvent({ ...calendarEvent, end: setTimeString(value.toLocaleString(), endTime) });
            }}
          />
        </GoAFormItem>
        <GoAFormItem label="End time">
          <GoAInputTime
            name="endTime"
            value={endTime}
            step={1}
            width="100%"
            disabled={calendarEvent?.isAllDay}
            testId="calendar-event-modal-end-time-input"
            onChange={(name, value) => {
              setCalendarEvent({ ...calendarEvent, end: setTimeString(endDate, value) });
            }}
          />
        </GoAFormItem>
      </GoAGrid>
    </GoAModal>
  );
};