import { Route, Routes } from "react-router-dom";
import Navbar from "./Components/navbar.component";
import UserAuthForm from "./Pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./Common/session";
import Editor from "./Pages/editor.pages";
import HomePage from "./Pages/home.page";
import SearchPage from "./Pages/search.page";
import PageNotFound from "./Pages/404.page";
import ProfilePage from "./Pages/profile.page";
import BlogPage from "./Pages/blog.page";
import SideNavBar from "./Components/sidenavbar.component";
import EditProfile from "./Pages/edit-profile.page";
import ChangePassword from "./Pages/change-password.page";
import Notification from "./Pages/notifications.page";


//creating context 
export const UserContext = createContext({})

const App = () => {
`
    //state to save session details `
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
            <Route path="/editor/:blog_id" element={<Editor/>}/>

            <Route path="/" element={<Navbar />}>
                <Route index element={<HomePage/>}/>
                <Route path="dashboard" element={<SideNavBar/>}>
                    <Route path="notification" element={<Notification/>}/>
                </Route>
                <Route path="settings" element={<SideNavBar/>}>
                    <Route path="edit-profile" element={<EditProfile/>}/>
                    <Route path="change-password" element={<ChangePassword/>}/>
                </Route>
                <Route path="singin" element={<UserAuthForm type ="sign-in"/>} />
                <Route path="singup" element={<UserAuthForm type ="sign-up"/>} />
                <Route path="search/:query" element={ <SearchPage /> }/>
                <Route path="user/:id" element={<ProfilePage/>}/>
                <Route path="blog/:blog_id" element={<BlogPage/>} />
                <Route path="*" element={<PageNotFound/>}/>
            </Route> 
        </Routes>
       </UserContext.Provider>
    )
}

export default App;