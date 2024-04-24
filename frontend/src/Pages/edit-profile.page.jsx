



import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../App'
import axios from 'axios';
import AnimationWrapper from '../Common/page-animation';
import Loader from '../Components/loader.component';
import { proData } from './profile.page';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../Components/imput.component';
import { uploadImage } from '../Common/aws';
import { storeInSession } from '../Common/session';
import SEO from '../Common/SEO';

const EditProfile = () => {
    
    let { userAuth , userAuth:{access_token} ,setUserAuth} = useContext(UserContext)

    let bioLimit = 150;

    const [profile,setProfile] = useState(proData);

    const [loading,setLoading] = useState(true)

    const [characterLeft,setCharacterLeft] = useState(bioLimit)

    const [updateProfile,setUpdateProfile] = useState(null)

    let profileImgEle = useRef();

    let editProfileForm = useRef();

    let { personal_info : {fullname , username: profile_username , profile_img , email ,bio } ,social_links } = profile

    useEffect(()=>{
         if(access_token){
            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/get-profile` , {
                username:userAuth.username
            })
            .then(({data})=>{
                setProfile(data)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
            })
         }
    },[access_token])

    const CharacterChange = (e) => {
        setCharacterLeft(bioLimit - e.target.value.length)
    }

    const ImagePreview = (e) => {
           let img = e.target.files[0] 
           profileImgEle.current.src = URL.createObjectURL(img) ;
           setUpdateProfile(img)
    }

    const imageUpload = (e) =>{
        e.preventDefault()

        if(updateProfile){

            let loadingToast = toast.loading("Uploading .......")

            e.target.setAttribute("disabled", true);

            uploadImage(updateProfile)

            .then(url=>{

                if(url){
                    
                axios
                .post( `${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/update-profile-img`,
                { url },
                { headers: { Authorization: `Bearer ${access_token}` } })
                .then(({data})=>{
                    let newUserAuth = { ...userAuth,profile_img:data.profile_img}

                    storeInSession("user",JSON.stringify(newUserAuth)) 
                
                    setUserAuth(newUserAuth)
                
                    toast.dismiss(loadingToast)
                
                    e.target.removeAttribute("disabled");
                
                    toast.success( "Successfully Uploaded !!!")
                })
                .catch(({response}) => {
                    
                    toast.dismiss(loadingToast)
                
                    e.target.removeAttribute("disabled");
                
                    toast.error(response.data.error)
                })

                }

            })
            .catch((error) => {
                console.log(error)
            })
        }
    }

    const SubmitHandel = (e) => {
        e.preventDefault()

        let form = new FormData(editProfileForm.current)
        let formData = {}

        for(let [key,value] of form.entries()){
            formData[key] = value
        }    

        let {username,bio,youtube,facebook,twitter,github,instagram,website} = formData;

        if(username.length < 3 ){
            return toast.error("Username Should Be At Least 3 Letters Long")
        }
        if(bio.length > bioLimit){
        return toast.error(`Bio Should Not Be More Than ${bioLimit} `)
    }

    let loadingToast = toast.loading( 'Updating Profile...')

    e.target.setAttribute("disabled",true)

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/update-profile`,
    {username,bio,social_links:{youtube,facebook,twitter,github,instagram,website}},
    { headers: { Authorization: `Bearer ${access_token}` } }
    )
    .then(({data})=>{
        if(userAuth.username != data.username){

            let newUserAuth = {...userAuth,username:data.username}

            storeInSession("user",JSON.stringify(newUserAuth) )
            setUserAuth(newUserAuth)
        }

        toast.dismiss(loadingToast)
        e.target.removeAttribute("disabled")
        toast.success('Profile Updated Successfully!')
    })
    .catch(({response})=>{
        toast.dismiss(loadingToast)
        e.target.removeAttribute("disabled")
        toast.error(response.data.error)
    })

}
  return (  
    <AnimationWrapper>
    <SEO  page_title={` ${profile_username}`} />
        {
            loading ? <Loader/> : 
            <form ref={editProfileForm}>
                <Toaster/>
                <h1 className='max-md:hidden'>Edit Profile</h1>

                <div className='flex flex-col lf:flex-row items-start py-10 gap-8 lg:gap-10'>

                    <div className='max-lg:center mb-5'>
                    <label htmlFor='uploadImg' id='profileImgLable' className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'>
                    <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer'>
                        Upload Image
                    </div>
                        <img src={profile_img} ref={profileImgEle}/>
                    </label>
                    <input type='file' id='uploadImg' accept='.jpeg, .png, .jpg' hidden onChange={ImagePreview}/>
                
                <button onClick={imageUpload} className='btn-light mt-5 max-lg:center lf:w-full px-10'>Upload</button>
                    </div>

                <div className='w-full'>

                    <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                        
                        <div>
                            <InputBox name={"fullname"} type={"text"} value={fullname} disable={true} icon={"fi-rr-user"} />
                        </div>

                        <div>
                            <InputBox name={"email"} type={"email"} value={email} disable={true} icon={"fi-rr-envelope"} />
                        </div>

                        <InputBox type={"text"} name={"username"} value={profile_username} placeholder={"Username"} icon={"fi-rr-at"} />

                        <p className='text-dark-grey -mt-3'>Username Will Use To Search User And Will Be Visible To All Users</p>

                        <textarea name='bio' maxLength={bioLimit} defaultValue={bio} className='imput-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5' placeholder='Bio' onChange={CharacterChange}></textarea>

                        <p className='mt-1 text-dark-grey'>{characterLeft} Characters left</p>

                        <p className='md:grid md:grid-cols-2 gap-x-6'>Add Your Social Handels Below</p>

                        <div className='md:grid :md:grid-cols-2 gap-x-6'>
                            {
                                Object.keys(social_links).map((key,i)=> {

                                    let link = social_links[key]

                                    return <InputBox  key={i} name={key} type={"text"} value={link} placeholder={"https://"}  icon={"fi " + (key != "website" ? " fi-brands-" + key : "fi-rr-globe")}/>
                                } )
                            }
                            </div>
                    </div>

                    <button className='btn-dark w-auto px-10' type='submit' onClick={SubmitHandel}>Update</button>
                    
                </div>

                </div>
            </form>

        }
    </AnimationWrapper>
  )
}

export default EditProfile