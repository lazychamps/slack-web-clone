import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCwg5gqHOkmCb6Ll_bwnL2PFEIiffmaGb8",
  authDomain: "lazy-slack.firebaseapp.com",
  databaseURL: "https://lazy-slack.firebaseio.com",
  projectId: "lazy-slack",
  storageBucket: "lazy-slack.appspot.com",
  messagingSenderId: "593367042643",
  appId: "1:593367042643:web:7f009affeb681cbe5c14a6",
  measurementId: "G-MM9QX2ELQR",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
