import * as type from './actionTypes';
const initialState = {
    payload: [],
    pending: false,
    error: null,
}
const reducers = (state = initialState, action) => {
    switch (action.type) {
        case type.GET_DRAWING_REQUEST:
            return {
                ...state,
                pending: true
            }
        case type.GET_DRAWING_SUCCESS:
            return {
                ...state,
                pending: false,
                payload: [
                    ...action.payload.statuses
                ]
            }
        case type.GET_DRAWING_FAILURE:
            return {
                ...state,
                pending: false,
                error: action.error
            }
        default:
            return { ...state }
    }
}
export default reducers