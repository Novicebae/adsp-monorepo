import { put, select, call } from 'redux-saga/effects';
import { ErrorNotification } from '@store/notifications/actions';
import { SagaIterator } from '@redux-saga/core';
import {
  CreateFileSpaceSucceededService,
  CreateFileSpaceFailedService,
  FetchFilesSuccessService,
  UploadFileSuccessService,
  FetchFileTypeSucceededService,
  DeleteFileTypeSucceededService,
  CreateFileTypeSucceededService,
  UpdateFileTypeSucceededService,
  DeleteFileSuccessService,
  FetchFileDocsSucceededService,
} from './actions';

import { FileApi } from './api';
import FormData from 'form-data';

export function* uploadFile(file) {
  const state = yield select();
  const token = state.session.credentials.token;
  const api = yield new FileApi(state.config, token);

  const recordId = `${state.tenant.realm}-${file.payload.data.file.name}`;

  const formData = new FormData();
  formData.append('file', file.payload.data.file);
  formData.append('type', file.payload.data.type);
  formData.append('filename', file.payload.data.file.name);
  formData.append('recordId', recordId);

  try {
    const uploadFile = yield api.uploadFile(formData);
    //const uploadFile = yield call(api.uploadFile, formData);
    console.log(uploadFile);
    yield put(UploadFileSuccessService(uploadFile));
  } catch (e) {
    yield put(ErrorNotification({ message: e.message }));
  }
}

export function* fetchFiles() {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = new FileApi(state.config, token);

    const files = yield api.fetchFiles();
    yield put(FetchFilesSuccessService({ data: files.results }));
  } catch (e) {
    yield put(ErrorNotification({ message: e.message }));
  }
}

export function* deleteFile(file) {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = yield new FileApi(state.config, token);
    const files = yield api.deleteFile(file.payload.data);
    yield put(DeleteFileSuccessService(files));
  } catch (e) {
    yield put(ErrorNotification({ message: e.message }));
  }
}

export function* downloadFile(file) {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = yield new FileApi(state.config, token);
    const files = yield api.downloadFiles(file.payload.data.id, token);
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([files]));
    element.download = file.payload.data.filename;
    document.body.appendChild(element);
    element.click();
  } catch (e) {
    yield put(ErrorNotification({ message: e.message }));
  }
}

export function* enableFileService() {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = yield new FileApi(state.config, token);
    const enableFile = yield api.enableFileService();
    yield put(CreateFileSpaceSucceededService({ data: enableFile }));
  } catch (e) {
    yield put(CreateFileSpaceFailedService(e.message));
  }
}

export function* fetchSpace() {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = yield new FileApi(state.config, token);
    const enableFile = yield api.fetchSpace();
    yield put(CreateFileSpaceSucceededService({ data: enableFile }));
  } catch (e) {
    yield put(CreateFileSpaceFailedService(e.message));
  }
}

export function* fetchFileTypes() {
  const state = yield select();
  try {
    const token = state.session.credentials?.token;
    const api = yield new FileApi(state.config, token);
    const fileTypeInfo = yield api.fetchFileType();
    yield put(FetchFileTypeSucceededService({ data: fileTypeInfo }));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.message} - fetchFileTypes` }));
  }
}

export function* deleteFileTypes(fileType) {
  const state = yield select();
  try {
    const token = state.session?.credentials?.token;
    const api = yield new FileApi(state.config, token);

    yield api.deleteFileType(fileType.payload.fileInfo.id);

    yield put(DeleteFileTypeSucceededService(fileType.payload.fileInfo));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.response.data} - deleteFileTypes` }));
  }
}

export function* createFileType(fileType) {
  const state = yield select();
  const token = state.session.credentials.token;
  const api = yield new FileApi(state.config, token);

  try {
    const fileTypeInfo = yield api.createFileType(fileType.payload.fileInfo);
    yield put(CreateFileTypeSucceededService({ data: fileTypeInfo }));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.message} - createFileType` }));
  }
}

export function* updateFileType(fileType) {
  const state = yield select();
  const token = state.session.credentials.token;
  const api = yield new FileApi(state.config, token);

  try {
    const fileTypeInfo = yield api.updateFileType(fileType.payload.fileInfo);
    yield put(UpdateFileTypeSucceededService({ data: fileTypeInfo }));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.message} - updateFileType` }));
  }
}

export function* fetchFileDocs() {
  const state = yield select();
  const token = state.session.credentials.token;
  const api = yield new FileApi(state.config, token);
  try {
    const fileDocs = yield api.fetchFileServiceDoc();
    yield put(FetchFileDocsSucceededService(fileDocs));
  } catch (e) {
    yield put(ErrorNotification({ message: `${e.message} - fetchFileDoc` }));
  }
}
