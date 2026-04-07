// Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGkNWTSGzk8qG-7-gAiHGt9NOKJ61NnwU",
  authDomain: "cacada-37e2e.firebaseapp.com",
  databaseURL: "https://cacada-37e2e-default-rtdb.firebaseio.com",
  projectId: "cacada-37e2e",
  storageBucket: "cacada-37e2e.firebasestorage.app",
  messagingSenderId: "101749836292",
  appId: "1:101749836292:web:55fb0f09af506ad674c351"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Banco de dados
const db = firebase.database();