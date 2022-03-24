import { ActionType } from './actions';
import { Session, SESSION_INIT } from './models';

export default function (state: Session = SESSION_INIT, action: ActionType): Session {
  switch (action.type) {
    case 'session/login/success':
      return {
        ...state,
        ...action.payload,
        credentials: {
          ...state.credentials,
          ...action.payload.credentials,
        },
      };
    case 'credential/refresh':
      return {
        ...state,
        credentials: {
          ...state.credentials,
          ...action.payload,
        },
      };

    case 'session/indicator':
      return {
        ...state,
        indicator: {
          ...action.payload,
        },
      };

    case 'session/logout':
      return SESSION_INIT;

    default:
      return state;
  }
}
