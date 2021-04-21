import {
  ActionTypes,
  FETCH_FILE_SPACE_SUCCESS,
  FILE_DELETE,
  FILE_UPLOAD_SUCCESSES,
  FILE_DISABLE,
  FILE_ENABLE,
  FILE_SETUP,
  FILE_SET_ACTIVE_TAB,
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
    case FILE_ENABLE:
      return {
        ...state,
        status: {
          ...state.status,
          isActive: true,
        },
      };

    case FILE_DISABLE:
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

    case FILE_SETUP:
      return {
        ...state,
        requirements: {
          ...state.requirements,
          setup: false,
        },
      };

    case FILE_DELETE:
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
    case FILE_UPLOAD_SUCCESSES:
      return {
        ...state,
        fileList: [...(state.fileList || []), action.payload.data],
      };
    case FILE_SET_ACTIVE_TAB:
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
