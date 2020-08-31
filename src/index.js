import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";
import * as serviceWorker from "./serviceWorker";
import "semantic-ui-css/semantic.min.css";
import { setUser, clearUser } from "./actions/index";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import firebase from "../src/firebase";

import { createStore } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/rootReducer";
import { connect } from "react-redux";
import Spinner from "./components/common/Spinner";

const store = createStore(rootReducer, composeWithDevTools());

const Root = ({ setUser, history, isLoading, clearUser }) => {
  useEffect(() => {
    console.log("Rendering");
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        history.push("/");
      } else {
        history.push("/login");
        clearUser();
      }
    });
  }, [history, clearUser, setUser]);

  return isLoading ? (
    <Spinner />
  ) : (
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
};

const mapStateToProps = (state) => ({
  isLoading: state.userReducer.isLoading,
});

const RootWithRouter = withRouter(
  connect(mapStateToProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithRouter />
    </Router>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
