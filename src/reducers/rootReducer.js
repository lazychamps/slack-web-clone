import { combineReducers } from "redux";
import { userReducer } from "./userReducer";
import { channelReducer } from "./channelReducer";

const rootReducer = combineReducers({
  userReducer,
  channelReducer,
});

export default rootReducer;
