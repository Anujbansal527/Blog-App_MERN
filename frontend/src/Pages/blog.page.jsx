

import React, { createContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios';
import AnimationWrapper from '../Common/page-animation';
import Loader from '../Components/loader.component';
import { getDay } from '../Common/date';
import BlogIntraction from '../Components/blog-interaction.component';
import BlogPost from '../Components/blog-post.component';
import BlogContent from '../Components/blog-content.component';
import CommentContainer, { fetchComment } from '../Components/comments.component';

export const blogStructure = {
    title:'',
    des:'',
    content:[],
    author: { personal_info:{}},
    banner:'',
    publishedAt:''
}

//context hook for providing blog to other component
export const BlogContext = createContext({ });

const BlogPage = () => {

    let { blog_id } = useParams();

    const [blog, setBlog] = useState(blogStructure);

    const [similarBlogs,setSimilarBlogs] = useState(null);

    const [loading,setLoading] = useState(true);

    const [isLike,setIsLike] = useState(false);

    const [cmntWrapper,setCmntWrapper] = useState(true);

            //totalParentCommentsLoaded
    const [totalParentCommentsLoaded,setTotalCommentsLoaded] = useState(0);

    let { title,content,banner,author:{personal_info:{ fullname,username:author_username,profile_img}},publishedAt} = blog;

    const fetchBlog = () => {
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/get-blog`,
        { blog_id })
        .then(async({data : {blog}}) => {
            
            blog.comments = await fetchComment({blog_id:blog._id , setParentCountFun: setTotalCommentsLoaded })

            setBlog(blog)

            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/search-blogs`,
            {tag: blog.tags[0], limit:6, eliminate_blog: blog_id})
            .then(({data})=>{
                setSimilarBlogs(data.blogs)
            })

            setLoading(false)
        })
        .catch(error=>{
            console.log(error)
            setLoading(false)
        })
    }

    useEffect(()=>{
        resetState();
        fetchBlog();
    },[blog_id])

    const resetState = () => {
        setBlog(blogStructure)
        setSimilarBlogs(null)
        setIsLike(false)
        setCmntWrapper(false)
        setTotalCommentsLoaded(0)
        setLoading(true)
    }

  return (
    <AnimationWrapper>
    {
        loading ? <Loader/>
        :
        <BlogContext.Provider value={{blog,setBlog,isLike,setIsLike,cmntWrapper,setCmntWrapper,totalParentCommentsLoaded,setTotalCommentsLoaded}} >

        <CommentContainer/>

        <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
            <img src={banner} className='aspect-video' />

            <div className='mt-12'>
                <h2>{title}</h2>

                <div className='flex max-sm:flex-col justify-between my-8'>
                    <div className='flex gap-5 items-start'>
                        <img src={profile_img} className='w-12 h-12 rounded-full'/>
                        <p className='capitalize'>
                            {fullname}
                            <br/>
                            @
                            <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                        </p>
                    </div>
                    <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>Published On {getDay(publishedAt)}</p>
                </div>
            </div>

            <BlogIntraction/>

            <div className='my-12 font-gelasio blog-page-content'>
                {
                    content[0] ?.blocks.map((block,i)=>{
                        return(
                            <div key={i} className='my-4 md:my-8'>
                                <BlogContent block={block}/>
                            </div>
                        )
                    }) 
                }
            </div>

            <BlogIntraction/>

            {
                similarBlogs != null && similarBlogs.length ? 
                <>
                    <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>

                    {
                        similarBlogs.map((blog,i)=>{
                            let {author:{personal_info}}  = blog;
                            return(<AnimationWrapper key={i} transition={{duration:1,delay:i*0.08}}>
                                <BlogPost author={personal_info} content={blog} />
                            </AnimationWrapper>)
                        })
                    }

                </>
                : ""
            }

        </div>
        </BlogContext.Provider>
    }
    </AnimationWrapper>
  )
}

export default BlogPage