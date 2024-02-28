import { GoogleAuthProvider , getAuth, signInWithPopup } from "firebase/auth"

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY, 
  authDomain: "blog-app-react-js.firebaseapp.com",
  projectId: "blog-app-react-js",
  storageBucket: "blog-app-react-js.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//google auth provider
const provider = new GoogleAuthProvider();

//authentication
const auth = getAuth();

export const authWithGoogle = async() =>{
    
    let user = null;

    await signInWithPopup(auth,provider)
    .then((result)=>{
        user = result.user
    })
    .catch((error)=>{
        console.log("Error in Auth with google : ", error);
    })

    return user;
} 