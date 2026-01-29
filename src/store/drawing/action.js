import * as actionType from "./actionTypes";

export function GetDrawingRequest(payload) {
  return {
    type: actionType.GET_DRAWING_REQUEST,
    payload: payload,
  };
}
export function GetDrawingSuccess(payload) {
  return {
    type: actionType.GET_DRAWING_SUCCESS,
    payload: payload,
  };
}
export function UpdateViewVisibilityRequest(payload) {
  return {
    type: actionType.UPDATE_VIEW_VISIBILITY_REQUEST,
    payload: payload,
  };
}
export function UpdateViewVisibilitySuccess(payload) {
  return {
    type: actionType.UPDATE_VIEW_VISIBILITY_SUCCESS,
    payload: payload,
  };
}
export function GetTrbModelRequest(payload) {
  return {
    type: actionType.GET_TRB_MODEL_REQUEST,
    payload: payload,
  };
}
export function GetTrbModelSuccess(payload) {
  return {
    type: actionType.GET_TRB_MODEL_SUCCESS,
    payload: payload,
  };
}
