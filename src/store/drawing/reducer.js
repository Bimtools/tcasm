import * as type from "./actionTypes";
const initialState = {
  payload: [],
  trbModels: [],
  pending: false,
  error: null,
};
const reducers = (state = initialState, action) => {
  switch (action.type) {
    case type.GET_DRAWING_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case type.GET_DRAWING_SUCCESS:
      return {
        ...state,
        pending: false,
        payload: [...action.payload.views],
      };
    case type.GET_DRAWING_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.error,
      };
    case type.UPDATE_VIEW_VISIBILITY_REQUEST:
      return {
        ...state,
        pending: true,
      };
    case type.UPDATE_VIEW_VISIBILITY_SUCCESS:
      const updatedViews = state.payload.map((view) => {
        if (view.key === action.payload.name) {
          return {
            ...view,
            show: action.payload.show,
          };
        } else {
          return view;
        }
      });
      return {
        ...state,
        pending: false,
        payload: updatedViews,
      };
    case type.UPDATE_VIEW_VISIBILITY_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.error,
      };
    case type.GET_TRB_MODEL_REQUEST:
      return {
        ...state,
        pending: false,
      };
    case type.GET_TRB_MODEL_SUCCESS:
      console.log(action.payload);
      return {
        ...state,
        pending: false,
        trbModels: action.payload,
      };
    default:
      return { ...state };
  }
};
export default reducers;
