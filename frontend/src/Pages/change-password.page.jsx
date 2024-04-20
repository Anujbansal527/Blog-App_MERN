


import React, { useContext, useRef } from 'react'
import AnimationWrapper from '../Common/page-animation'
import InputBox from '../Components/imput.component'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { UserContext } from '../App'



const ChangePassword = () => {

    let { userAuth:{access_token}} = useContext(UserContext);

    let ChangePasswordForm = useRef()

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const SubmitBtn = (e) => {
        e.preventDefault();

        let form = new FormData(ChangePasswordForm.current)

        let formData = { };

        for(let [key,value] of form.entries()){
            formData[key]= value; 
        }

        let {currentPassword,newPassword} = formData;

        if(!currentPassword.length || !newPassword.length){
         return toast.error("Fill all the input")   
        }

        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
                return toast.error("Password Should be 6 to 20 Character long with a numeric , ! lowercase , 1 uppercase letter")
        }

        e.target.setAttribute("disabled",true)

        let loading = toast.loading('Updating Password...')

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/change-password`,
            formData,{
                headers:{
                   "Authorization" : `Bearer ${access_token}`
                }
            })
            .then(() => {
                toast.dismiss(loading)
                e.target.removeAttribute("disabled");
                return toast.success("Successfully Updated Password!")
            })
            .catch((response)=> {
                toast.dismiss(loading)
                e.target.removeAttribute("disabled");
                return toast.success(response.data.error)    
            })
    }

    return (
    <AnimationWrapper>
    <Toaster/>
        <form ref={ChangePasswordForm}>
            <h1 className='max-md:hidden'>Change Password</h1>

            <div className='py-10 w-full md:max-w-[400px]'>
                <InputBox name={"currentPassword"} type="password" className="profile=edit-input" placeholder={"Current Password"} icon="fi-rr-unlock"/>
                <InputBox name={"newPassword"} type={"password"} placeholder="New password" icon={"fi-rr-unlock"}/>
                <button onClick={SubmitBtn} className='btn-dark px-10' type='submit'>Change Password</button>
            </div>
        </form>
    </AnimationWrapper>
  )
}

export default ChangePassword