import { application } from 'express';
import { ActionTypes } from './actions';
import { Notices } from './models';

const initialState: Notices = {
  notices: [],
};

export default function noticeReducer(state: Notices = initialState, action: ActionTypes): Notices {
  switch (action.type) {
    case 'notice/SAVE_NOTICE_SUCCESS': {
      let alreadyExists = false;
      let notices = state.notices.map((n) => {
        if (n.id !== action.payload.id) {
          return n;
        } else {
          alreadyExists = true;
          return action.payload;
        }
      });
      if (!alreadyExists) {
        notices = [action.payload, ...notices];
      }
      return {
        ...state,
        notices: notices,
      };
    }

    case 'notice/GET_NOTICES_SUCCESS':
      return {
        ...state,
        notices: action.payload,
      };

    case 'notice/DELETE_NOTICE_SUCCESS': {
      const notices = state.notices.filter((n) => n.id !== action.payload.id);
      return {
        notices,
      };
    }

    default:
      return state;
  }
}
