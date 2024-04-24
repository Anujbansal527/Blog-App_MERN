


import React from 'react'
import { Helmet } from "react-helmet"


const SEO = ({  page_title:title}) => {
 
    let description = "Empower your blogging journey with our MERN (MongoDB, Express.js, React, Node.js) app. Seamlessly create, manage, and share captivating content with ease. From dynamic React-based interfaces to robust backend support with Node.js and MongoDB, our app streamlines your blogging experience. Elevate your online presence and engage your audience like never before with our feature-rich MERN blog app."
    
    let keywords = "Blogging platform , Content management , Blog management ,Blogging application ,Blogging tips, Content creation , Writing advice, Blogging strategies ,SEO techniques ,Blog promotion ,Blogging community ,Creative writing ,Blogging insights ,Engaging content ,Audience engagement ,Blog monetization ,Social media promotion ,Blogging inspiration ,Blogging resources"
    
    let author = "ANUJ BANSAL - anujbansal527@gmail.com"
    
    return (
    <Helmet>
        <meta charSet="utf-8"/>
          <meta name='description' content={description}/>
          <meta name='keyword' content={keywords} />
          <meta name='author' content={author}/>
          <title>{`Blog App -> ${title}`}</title>
      </Helmet>
  )
}

export default SEO