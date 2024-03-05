


import React, { useEffect, useState } from 'react'
import axios from "axios";
import AnimationWrapper from '../Common/page-animation'
import InPageNavigation from '../Components/inpage-navigation.component'
import Loader from '../Components/loader.component';
import BlogPost from '../Components/blog-post.component';
import TrendingBlogs from '../Components/nobanner-blog-post.component';

const HomePage = () => {

  let [blogs,setBlogs] = useState(null)
  let [trend,setTrend] = useState(null)

  const fetchLatestBlog = () => {
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/latest-blogs`)
      .then(({ data }) =>{
          //console.log(data.blogs)
          setBlogs(data.blogs);
      })
      .catch(error => {
        console.log(error)
      })
  }

  const fetchTrendingBlog = () => {
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/trending-blogs`)
      .then(({ data }) =>{
          //console.log(data.blogs)
          setTrend(data.blogs);
      })
      .catch(error => {
        console.log(error)
      })
  }

  useEffect(()=>{
    fetchLatestBlog()
    fetchTrendingBlog()
  },[])

  return (
    <AnimationWrapper>
        <section className='h-cover flex justify-center gap-10'>

            <div className='w-full'>

                <InPageNavigation routes={ [ "home" , "trending blogs"]}  defaultHidden = {["trending blogs"]}>

                  <>
                    {
                      blogs == null 
                      ? <Loader/>
                      : blogs.map((blog,i) => {
                        return <AnimationWrapper transition={{duration:1, delay:i*0.1}} key={i}>
                          <BlogPost content = {blog} author={blog.author.personal_info}/>
                        </AnimationWrapper>
                      }) 

                    }
                  </>

                    <>
                    {
                      trend == null 
                      ? <Loader/>
                      : trend.map((blog,i) => {
                        return <AnimationWrapper transition={{duration:1, delay:i*0.1}} key={i}>
                          <TrendingBlogs blog={blog} index ={i}/>
                        </AnimationWrapper>
                      })                       
                    }
                  </>
                
                </InPageNavigation>

            </div>


            <div>

            </div>
        </section>
    </AnimationWrapper>
  )
}

export default HomePage