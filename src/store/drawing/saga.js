import axios from "axios";
import {
  all,
  call,
  put,
  takeLatest,
  takeEvery,
  fork,
} from "redux-saga/effects";
import {
  GetDrawingSuccess,
  UpdateViewVisibilitySuccess,
  GetTrbModelSuccess,
} from "./action";
import instance from "../../interceptors/axios";

function* getDrawingSaga(action) {
  const getCommentUrl = `/comments?objectId=${action.payload.id}&objectType=FOLDER`;
  const commentResponse = yield call(instance.get, getCommentUrl);
  const comments = commentResponse.data.map((x) => {
    const comment = JSON.parse(x.description);
    return comment;
  });
  const grouped = comments.reduce((acc, comment) => {
    const key = comment.name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(comment);
    acc[key].sort((a, b) => a.index - b.index);
    return acc;
  }, {});
  const views = Object.values(grouped).map((group) => {
    const bs = group.map((item) => item.comment);
    const viewObjs = JSON.parse(bs.join(""));
    return {
      show: false,
      key: viewObjs.name,
      ...viewObjs,
    };
  });
  console.log(views);
  yield put(
    GetDrawingSuccess({
      views: views,
    }),
  );
}

function* updateViewVisibilitySaga(action) {
  yield put(
    UpdateViewVisibilitySuccess({
      ...action.payload,
    }),
  );
}
function* getTrbModelSaga(action) {
  yield put(GetTrbModelSuccess(action.payload));
}

function* drawingSaga() {
  yield takeEvery("GET_DRAWING_REQUEST", getDrawingSaga);
  yield takeEvery("UPDATE_VIEW_VISIBILITY_REQUEST", updateViewVisibilitySaga);
  yield takeEvery("GET_TRB_MODEL_REQUEST", getTrbModelSaga);
}
export default drawingSaga;
