import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

const initialState = {
  currentUser: null,
  isLoading: true,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        currentUser: action.payload.currentUser,
        isLoading: false,
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  userReducer,
});

export default rootReducer;
