


import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import logo from "../images/logo.png"
import AnimationWrapper from '../Common/page-animation'
import Banner from "../images/banner.png"
import { uploadImage } from '../Common/aws'
import toast, { Toaster } from "react-hot-toast"

const BlogEditor = () => {

    let blogBannerRef = useRef();

    const BannerUpload = (e) => {
        console.log(e)
        
        let img = e.target.files[0];

        if(img){

            let loadingToast = toast.loading("Uploading Image...");

            uploadImage(img)
            .then((url) =>
                {
                    if(url){

                        toast.dismiss(loadingToast)
                        toast.success("Image Uploaded Successfully!")
                        blogBannerRef.current.src = url
                    }
                })
            .catch((error)=>{
                toast.dismiss(loadingToast)
                return toast.error("Error Occured While Uploading Image!");
            })
        }
    }
  
  
    return (
    <>
        <nav className='navbar'>
            <Link to={"/"} className='flex-none w-10'>
                <img src={logo} />
            </Link>

            <p className='max-md:hidden text-black line-clamp-1 w-full ' >
                New Blog
            </p>

            <div className='flex gap-4 ml-auto'>
                <button className='btn-dark py-2'>
                    Publish
                </button>
                
                <button className='btn-lite py-2'>
                    Save Draft
                </button>
            </div>
        </nav>

        <Toaster/>
        <AnimationWrapper>
            <section>
                <div className='mx-auto max-w-[900px] w-full'>
                    <div className='relative aspect-video hover:opacity-80 bg-white border-4 border-grey '>
                        <label htmlFor='uploadBanner'>
                            <img 
                            ref={blogBannerRef}
                            src={Banner} 
                            alt='banner'
                            className='z-20'
                            />
                            <input 
                                id='uploadBanner'
                                type='file'
                                accept='.png,.jpg,.jpeg'
                                hidden    
                                onChange={BannerUpload}
                            />
                        </label>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    </>
  )
}

export default BlogEditor