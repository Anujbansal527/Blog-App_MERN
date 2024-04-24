

import React from 'react'
import Page404 from "../images/404.png"
import logo from "../images/logo.png";
import { Link } from 'react-router-dom'
import SEO from '../Common/SEO';


const PageNotFound = () => {
  return (
    <>
    <SEO  page_title={"Blog App - 404 Not Found"} />
      <section className='h-cover relative p-10 flex flex-col items-center gap-20 text-center'>
        <img src={Page404} alt="404 Error" className='select-none border-2 border-grey w-72 aspect-square object-cover rounded'/>
        <h1 className='text-4xl font-gelasio leading-7'>Page Not Found</h1>
        <p className='text-dark-grey text-xl leading-7 -mt-8'>The Page You Are Looking For Does Not Exists. Head Back To The <Link to={"/"} className='text-black underline'> Home Page</Link></p>
    
        <div className='mt-auto'>
            <img src={logo} alt='logo' className='h-20 object-contain block mx-auto select-none'/>
            <p className='mt-5 text-dark-grey'>Read Millions Of Stories Around The World.</p>
        </div>
    
    </section>
    </>
    
  )
}

export default PageNotFound