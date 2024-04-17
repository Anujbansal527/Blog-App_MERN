


import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import toast, { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { BlogContext } from '../Pages/blog.page'

const CommentField = ({action,index = undefined,replyingTo = undefined, setReplying}) => {

    let { blog, blog: {_id,  author : { _id : blog_author }, comments , comments:{results : commentArr }, activity , activity:{ total_comments,total_parent_comments } } , setBlog ,setTotalCommentsLoaded} = useContext(BlogContext)

    let { userAuth: {access_token,username,fullname,profile_img} } = useContext(UserContext) 

    const [comment, setComment ] = useState('')

    const Comments = () => {
        
        if(!access_token){
            return toast.error("Login First to leave a Comment")
        }    

        if(!comment.length){
          return toast.error("Write Something To Leave Comment")
        }

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/add-comment`,
        { _id , blog_author , comment , replying_To:replyingTo } ,
        { headers: { Authorization: `Bearer ${access_token}` } })

        .then(({data}) => {
            
          setComment("")
          
          data.commented_by = { personal_info : {username, profile_img,fullname}}

          let newCommentArr;

          if(replyingTo){

            commentArr[index].children.push(data._id)
            
            data.childrenLevel = commentArr[index].childrenLevel +1 
            
            data.parentIndex = index;

            commentArr[index].isReplyLoaded = true ; 

            commentArr.splice(index + 1 , 0 , data);

            newCommentArr = commentArr

            setReplying(false)

          }else{
              data.childrenLevel = 0 ;
              newCommentArr = [data , ...commentArr]
          }

          let parentCommentIncVal = replyingTo ? 0 :  1

          setBlog({
            ...blog,
            comments:{ 
              ...comments , 
              results:newCommentArr , 
              activity:{
                ...activity, 
                total_comments: total_comments + 1 ,total_parent_comments:total_parent_comments + parentCommentIncVal
                      }
                    }
                  })
           
                  //setTotalParentCommentsLoaded
          setTotalCommentsLoaded(prevVal => prevVal + parentCommentIncVal)
            

          })

        .catch((error)=> {
          console.log(error)
        })
    }

  return (
    <>
        <Toaster/>
        <textarea onChange={(e)=> setComment(e.target.value)} value={comment} placeholder='Leave a Comment' className='input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto'>
        </textarea>

        <button className='btn-dark mt-5 px-10 ' onClick={Comments}>{action}</button>
    </>
  )
}

export default CommentField