import { SagaIterator } from '@redux-saga/core';
import { UpdateIndicator } from '@store/session/actions';
import { RootState } from '../index';
import { select, call, put, takeEvery } from 'redux-saga/effects';
import { ErrorNotification } from '@store/notifications/actions';
import {
  UpdateFormDefinitionsAction,
  getFormDefinitionsSuccess,
  updateFormDefinitionSuccess,
  FETCH_FORM_DEFINITIONS_ACTION,
  UPDATE_FORM_DEFINITION_ACTION,
  DELETE_FORM_DEFINITION_ACTION,
  DeleteFormDefinitionAction,
  deleteFormById,
} from './action';

import { getAccessToken } from '@store/tenant/sagas';
import { fetchFormDefinitionsApi, updateFormDefinitionApi, deleteFormDefinitionApi } from './api';

export function* fetchFormDefinitions(): SagaIterator {
  yield put(
    UpdateIndicator({
      show: true,
      message: 'Loading Definition...',
    })
  );

  const configBaseUrl: string = yield select(
    (state: RootState) => state.config.serviceUrls?.configurationServiceApiUrl
  );
  const token: string = yield call(getAccessToken);
  if (configBaseUrl && token) {
    try {
      const url = `${configBaseUrl}/configuration/v2/configuration/platform/form-service/latest`;
      const Definitions = yield call(fetchFormDefinitionsApi, token, url);
      yield put(getFormDefinitionsSuccess(Definitions));
      yield put(
        UpdateIndicator({
          show: false,
        })
      );
    } catch (err) {
      yield put(ErrorNotification({ error: err }));
      yield put(
        UpdateIndicator({
          show: false,
        })
      );
    }
  }
}

export function* updateFormDefinition({ definition }: UpdateFormDefinitionsAction): SagaIterator {
  const baseUrl: string = yield select((state: RootState) => state.config.serviceUrls?.configurationServiceApiUrl);
  const token: string = yield call(getAccessToken);

  if (baseUrl && token) {
    try {
      const { latest } = yield call(updateFormDefinitionApi, token, baseUrl, definition);

      yield put(
        updateFormDefinitionSuccess({
          ...latest.configuration,
        })
      );
    } catch (err) {
      yield put(ErrorNotification({ error: err }));
    }
  }
}

export function* deleteFormDefinition({ definition }: DeleteFormDefinitionAction): SagaIterator {
  const baseUrl: string = yield select((state: RootState) => state.config.serviceUrls?.configurationServiceApiUrl);
  const token: string = yield call(getAccessToken);

  if (baseUrl && token) {
    try {
      yield call(deleteFormDefinitionApi, token, baseUrl, definition.id);
      yield put(deleteFormById(definition.id));
    } catch (err) {
      yield put(ErrorNotification({ error: err }));
    }
  }
}

export function* watchFormSagas(): Generator {
  yield takeEvery(FETCH_FORM_DEFINITIONS_ACTION, fetchFormDefinitions);
  yield takeEvery(UPDATE_FORM_DEFINITION_ACTION, updateFormDefinition);
  yield takeEvery(DELETE_FORM_DEFINITION_ACTION, deleteFormDefinition);
}
