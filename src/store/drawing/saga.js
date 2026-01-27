import axios from "axios";
import {
  all,
  call,
  put,
  takeLatest,
  takeEvery,
  fork,
} from "redux-saga/effects";
import { GetDrawingSuccess } from "./action";
import instance from "../../interceptors/axios";

function* getDrawingSaga(action) {
  const getCommentUrl = `/comments?objectId=${action.payload.id}&objectType=FOLDER`;
  const commentResponse = yield call(instance.get, getCommentUrl);
  console.log(getCommentUrl.data);
  const statuses = commentResponse.data.map((x) => {
    
  });
  yield put(
    GetDrawingSuccess({
      statuses: statuses,
    }),
  );
}

function* drawingSaga() {
  yield takeEvery("GET_DRAWING_REQUEST", getDrawingSaga);
}
export default drawingSaga;
