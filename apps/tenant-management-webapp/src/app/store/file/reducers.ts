import {
  ActionTypes,
  FETCH_FILE_SPACE_SUCCESS,
  FETCH_FILE_LIST_SUCCESSES,
  FILE_UPLOAD_SUCCESSES,
  DELETE_FILE_SUCCESSES,
  DOWNLOAD_FILE_SUCCESSES,
  TERMINATE_FILE_SERVICE,
  DISABLE_FILE_SERVICE,
  ENABLE_FILE_SERVICE,
  SETUP_FILE_SERVICE,
  SET_FILE_SERVICE_ACTIVE_TAB,
  CREATE_FILE_SPACE_SUCCEEDED,
  CREATE_FILE_SPACE_FAILED,
  FETCH_FILE_TYPE_SUCCEEDED,
  DELETE_FILE_TYPE_SUCCEEDED,
  UPDATE_FILE_TYPE_SUCCEEDED,
  CREATE_FILE_TYPE_SUCCEEDED,
} from './actions';
import { FILE_INIT, FileService } from './models';

function removeSpecifiedFileType(fileTypes, fileType) {
  const index = fileTypes.findIndex(({ id }) => id === fileType.id);
  const newFileTypes = fileTypes;
  newFileTypes.splice(index, 1);
  return newFileTypes;
}

function updateSpecifiedFileType(fileTypes, fileType) {
  const index = fileTypes.findIndex(({ id }) => id === fileType.id);
  const newFileTypes = fileTypes;
  newFileTypes[index] = fileType;
  return newFileTypes;
}

export default function (state = FILE_INIT, action: ActionTypes): FileService {
  switch (action.type) {
    case ENABLE_FILE_SERVICE:
      return {
        ...state,
        status: {
          ...state.status,
          isActive: true,
        },
      };

    case DISABLE_FILE_SERVICE:
      return {
        ...state,
        status: {
          ...state.status,
          isActive: true,
        },
        states: {
          ...state.states,
          activeTab: 'overall-view',
        },
      };

    case SETUP_FILE_SERVICE:
      return {
        ...state,
        requirements: {
          ...state.requirements,
          setup: false,
        },
      };

    case TERMINATE_FILE_SERVICE:
      return {
        ...state,
        requirements: {
          ...state.requirements,
          setup: true,
        },
        states: {
          ...state.states,
          activeTab: 'overall-view',
        },
      };
    case FILE_UPLOAD_SUCCESSES: // add file to fileList
      return {
        ...state,
        // fileList: [...(state.fileList || []), action.payload.data],
      };
    case DELETE_FILE_SUCCESSES:
      return {
        ...state, // remove delete file from reducer
      };
    case DOWNLOAD_FILE_SUCCESSES:
      return {
        ...state, // do nothing with reducer
      };
    case FETCH_FILE_LIST_SUCCESSES:
      return {
        ...state,
        fileList: action.payload.results.data,
      };
    case SET_FILE_SERVICE_ACTIVE_TAB:
      return {
        ...state,
        states: {
          ...state.states,
          activeTab: action.payload.activeTab,
        },
      };

    case FETCH_FILE_SPACE_SUCCESS:
      return {
        ...state,
        spaces: [action.payload.spaceInfo.data],
      };

    case CREATE_FILE_SPACE_SUCCEEDED: {
      return {
        ...state,
        space: action.payload.fileInfo.data,
      };
    }

    case CREATE_FILE_SPACE_FAILED: {
      const _status = state.status;
      _status.isActive = false;

      return {
        ...state,
        space: null,
        status: _status,
      };
    }

    case FETCH_FILE_TYPE_SUCCEEDED:
      return {
        ...state,
        fileTypes: action.payload.fileInfo.data,
      };

    case DELETE_FILE_TYPE_SUCCEEDED:
      return {
        ...state,
        fileTypes: removeSpecifiedFileType(state.fileTypes, action.payload.fileInfo),
      };

    case UPDATE_FILE_TYPE_SUCCEEDED:
      return {
        ...state,
        fileTypes: updateSpecifiedFileType(state.fileTypes, action.payload.fileInfo.data),
      };

    case CREATE_FILE_TYPE_SUCCEEDED:
      return {
        ...state,
        fileTypes: [...(state.fileTypes || []), action.payload.fileInfo.data],
      };

    default:
      return state;
  }
}
