// firebase.js
const firebaseConfig = {
  apiKey: "",
  authDomain: "minichatsuporte.firebaseapp.com",
  databaseURL: "https://minichatsuporte-default-rtdb.firebaseio.com",
  projectId: "minichatsuporte",
  storageBucket: "minichatsuporte.firebasestorage.app",
  messagingSenderId: "900586532915",
  appId: "1:900586532915:web:f1183e60efb8248e72f346",
  measurementId: "G-S04X7G0RHK"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// Fim do firebase.js
