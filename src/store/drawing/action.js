import * as actionType from './actionTypes'

export function GetDrawingRequest(payload){
    return{
        type:actionType.GET_DRAWING_REQUEST,
        payload:payload
    }
}
export function GetDrawingSuccess(payload){
    return{
        type:actionType.GET_DRAWING_SUCCESS,
        payload:payload
    }
}
