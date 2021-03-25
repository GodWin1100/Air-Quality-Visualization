import firebase from 'firebase/app';

// Add the Firebase products that you want to use
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmoUrjYrMEuIeqkp5WjG-slLHKwRkh7O0",
  authDomain: "deepblue-aqv.firebaseapp.com",
  projectId: "deepblue-aqv",
  storageBucket: "deepblue-aqv.appspot.com",
  messagingSenderId: "935017759812",
  appId: "1:935017759812:web:c758e09ce2ad5b7ef26811",
  measurementId: "G-3KVGE9ZKM8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export default firebase