import {
  ActionTypes,
  DELETE_APPLICATION_SUCCESS_ACTION,
  FETCH_SERVICE_STATUS_APPS_SUCCESS_ACTION,
  FETCH_SERVICE_STATUS_APP_HEALTH_SUCCESS_ACTION,
  FETCH_STATUS_METRICS_SUCCESS_ACTION,
  SAVE_APPLICATION_SUCCESS_ACTION,
  SET_APPLICATION_SUCCESS_STATUS_ACTION,
  TOGGLE_APPLICATION_SUCCESS_STATUS_ACTION,
  UPDATE_FORM_DATA_ACTION,
  FETCH_STATUS_CONFIGURATION_SUCCEEDED,
  UPDATE_STATUS_CONTACT_INFORMATION,
} from './actions';
import { ServiceStatus } from './models';

const initialState: ServiceStatus = {
  applications: [],
  endpointHealth: {},
  currentFormData: {
    name: '',
    tenantId: '',
    enabled: false,
    description: '',
    endpoint: { url: '', status: 'offline' },
  },
  metrics: {},
  contact: {
    contactEmail: null,
  },
};

const compareIds = (a: { _id?: string }, b: { _id?: string }): number => (a._id <= b._id ? 1 : -1);

export default function statusReducer(state: ServiceStatus = initialState, action: ActionTypes): ServiceStatus {
  switch (action.type) {
    case FETCH_SERVICE_STATUS_APPS_SUCCESS_ACTION:
      return {
        ...state,
        applications: action.payload.sort(compareIds),
      };

    case FETCH_SERVICE_STATUS_APP_HEALTH_SUCCESS_ACTION:
      return {
        ...state,
        endpointHealth: {
          ...state.endpointHealth,
          [action.payload.applicationId]: { url: action.payload.url, entries: action.payload.entries || [] },
        },
      };
    case DELETE_APPLICATION_SUCCESS_ACTION:
      return {
        ...state,
        applications: [...state.applications.filter((app) => app._id !== action.payload)].sort(compareIds),
      };
    case SAVE_APPLICATION_SUCCESS_ACTION:
    case SET_APPLICATION_SUCCESS_STATUS_ACTION: {
      const index = state.applications.findIndex((app) => {
        return app._id === action.payload._id;
      });
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
      return { ...state };
    }
    case TOGGLE_APPLICATION_SUCCESS_STATUS_ACTION:
      return {
        ...state,
        applications: state.applications
          .map((app) =>
            app._id !== action.payload._id
              ? { ...app }
              : { ...app, enabled: action.payload.enabled, internalStatus: action.payload.internalStatus }
          )
          .sort(compareIds),
      };

    case UPDATE_FORM_DATA_ACTION:
      return {
        ...state,
        currentFormData: action.payload,
      };
    case FETCH_STATUS_METRICS_SUCCESS_ACTION:
      return {
        ...state,
        metrics: action.metrics,
      };
    case FETCH_STATUS_CONFIGURATION_SUCCEEDED:
      return {
        ...state,
        contact: action.payload?.contact,
      };
    case UPDATE_STATUS_CONTACT_INFORMATION:
      return {
        ...state,
        contact: action.payload,
      };
    default:
      return state;
  }
}
