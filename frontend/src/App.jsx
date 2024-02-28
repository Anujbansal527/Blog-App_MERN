import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/navbar.component";
import UserAuthForm from "./Pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./Common/session";
import Editor from "./Pages/editor.pages";


//creating context 
export const UserContext = createContext({})

const App = () => {

    //state to save session details 
    const [userAuth,setUserAuth] = useState({});

    useEffect(()=>{

        //fetching user session details
        let userInSession = lookInSession("user");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({access_token:null})
    },[])

    return (
       <UserContext.Provider value={{userAuth,setUserAuth}}>
         <Routes>
            <Route path="/editor" element={<Editor/>}/>

            <Route path="/" element={<Navbar />}>
                <Route path="singin" element={<UserAuthForm type ="sign-in"/>} />
                <Route path="singup" element={<UserAuthForm type ="sign-up"/>} />
            </Route> 
        </Routes>
       </UserContext.Provider>
    )
}

export default App;