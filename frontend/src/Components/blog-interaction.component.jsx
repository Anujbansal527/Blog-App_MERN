

import React, { useContext, useEffect } from 'react'
import { BlogContext } from '../Pages/blog.page'
import { Link } from 'react-router-dom'
import { UserContext } from '../App'
import { Toaster,toast } from 'react-hot-toast' 
import axios from 'axios'

const BlogIntraction = () => {

    let {blog, blog:{_id,title, blog_id,activity,activity:{ total_likes,total_comments},author:{personal_info:{username:author_username}}},setBlog,isLike,setIsLike} = useContext(BlogContext)

    let { userAuth:{username,access_token} } = useContext(UserContext)

    useEffect(()=>{

        if(access_token){
            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/isliked`,
            {_id},{
            headers:{
                "Authorization": `Bearer ${access_token}`
            }
        })
        .then(({data:{result}})=>{
            setIsLike(Boolean(result))
        })
        .catch(error =>{
            console.log(error)
        })
        }

    },[])

    const liked = () => {

        if(access_token){
            setIsLike(preVal => !preVal)

            !isLike ? total_likes++ : total_likes--;

            setBlog({...blog,activity:{...activity , total_likes}})

            axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/like-blog`,
            {_id,isLike},{
            headers:{
                "Authorization": `Bearer ${access_token}`
            } 
            })
            .then(({data})=>{
                console.log(data)
            })
            .catch(error=>{
                console.log(error)
            })
        }

        else{
            toast.error("Please Login First")
        }
    }
  return (
    <>
        <Toaster/>
        <hr className='border-grey my-2'/>

        <div className='flex gap-6 justify-between'>
            
            <div className='flex gap-3 items-center'>
                
                    <button 
                    onClick={liked}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isLike ? "bg-red/20 text-red" : "bg-grey/80"}`}>
                        <i className={`fi ${isLike ? "fi-sr-heart" : "fi-rr-heart" }`}></i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_likes}</p>
                

                
                    <button className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80'>
                        <i className='fi fi-rr-comment-dots'></i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_comments}</p>
                
            </div>

            <div className='flex gap-6 items-center'>

                {
                    username == author_username ?
                    <Link to={`/editor/${blog_id}`} className='underline hover:text-purple'>Edit</Link> : "" 
                }

                <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}><i className='fi fi-brands-twitter text-xl hover:text-twitter'></i></Link>
            </div>


        </div>

            
        <hr className='border-grey my-2'/>

    </>
  )
}

export default BlogIntraction