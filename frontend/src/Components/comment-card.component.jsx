


import React, { useContext, useState } from 'react'
import { getDay } from '../Common/date'
import { UserContext } from '../App'
import toast, { Toaster } from 'react-hot-toast'
import CommentField from './comment-field.component'
import { BlogContext } from '../Pages/blog.page'
import axios from 'axios'

const CommentCard = ({index , leftVal , commentData}) => {
    
    let {   commented_by : { personal_info :{ profile_img , fullname , username: commented_by_username } },commentedAt,comment , _id , children} = commentData

    let { blog, blog : { activity,activity : {total_parent_comments},comments,comments:{results:commentsArr } , author : {personal_info : {username : blog_author}}} ,setBlog,totalParentCommentsLoaded,setTotalCommentsLoaded} = useContext(BlogContext)

    let { userAuth:{ access_token , username } } = useContext(UserContext);

    const [isReply,setReply] = useState(false);

    const ReplyClick = () =>{
        if(!access_token){
          return toast.error("Login First To reply this Comment")
        }

        setReply(prev => !prev)
    }

    const getParentIndex = () => {
      let startingPoint = index - 1;

      try{
        while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel){
          startingPoint--;
      }
    }catch(error){
      startingPoint = undefined
    }
    return startingPoint
  }
    const removeCommentCard = (startingPoint,isDelete = false) => {
      if(commentsArr[startingPoint]){

        while(commentsArr[startingPoint].childrenLevel > commentData.childrenLevel){
          commentsArr.splice(startingPoint,1)

          if(!commentsArr[startingPoint]){
            break;
          }
        }

        if(isDelete == true){
          let parentIndex = getParentIndex();

          if(parentIndex != undefined){
            commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(
              child => child != _id)
              
              if(commentsArr[parentIndex].children.length){
                commentsArr[parentIndex].isReplyLoaded= false
              }
          }
        }

        commentsArr.splice(index,1)
      }

      if(commentData.childrenLevel == 0 && isDelete)
      {
        setTotalCommentsLoaded(prev => prev - 1)
      }

      setBlog( { ...blog , comments:{ results:commentsArr},activity:{...activity,total_parent_comments:total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0 ) }})
    }

    const HideReplies =()=>{
      commentData.isReplyLoaded = false;
      removeCommentCard(index+1)
    }

    const LoadReplies = ({skip = 0 , currentIndex = index}) => {

      //there will be n problem occured
      if(commentsArr[currentIndex].children.length){

        HideReplies();

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/get-replies`,
      {_id : commentsArr[currentIndex]._id , skip })
      .then(({data:{replies}})=>{

        commentsArr[currentIndex].isReplyLoaded = true;

        for(let i=0 ; i<replies.length ;i++){

          replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel+1;

          commentsArr.splice(currentIndex + 1 + i + skip , 0  , replies[i]);
        }

        setBlog({...blog , comments : {...comments , results : commentsArr}})
      })
      .catch(error => {
        console.log(error)
      })
      }
    }

    const DeleteComment = (e) => {
      e.target.setAttribute("disabled",true)

      axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/delete-comment`,{_id},
        { headers: { Authorization: `Bearer ${access_token}` } 
      })
      .then(()=>{
        e.target.removeAttribute('disabled');
        removeCommentCard(index+1,true)
      })
      .catch(error => {
        console.log(error.message)
      })
    }

    const LoadMoreRepliesButton = () => {

      let parentIndex = getParentIndex();

      let Btn = <button onClick={()=>LoadReplies({skip: index - parentIndex, currentIndex:parentIndex })} className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>Load More Replies</button>

      if(commentsArr[index + 1] ){
        if(commentsArr[index+1].childrenLevel < commentsArr[index].childrenLevel){
          if((index- parentIndex) < commentsArr[parentIndex].children.length){
            return Btn;
          }
        }
      }
      else{
        if(parentIndex){
          if((index- parentIndex) < commentsArr[parentIndex].children.length){
            return Btn;
          }
        }
      }

    }

  return (
    <>
        <Toaster/>
    <div className='w-full' style={{ padding:`${leftVal * 10 }px` }}>

        <div className='my-5 p-6 rounded-md border border-grey'>
            
            <div className='flex gap-3 items-center mb-8'>
                <img src={profile_img} className='w-6 h-6 rounded-full'/>
                <p className='line-clamp-1'>{fullname} @{commented_by_username}</p>
                <p className='min-w-fit'>{getDay(commentedAt)}</p>
            </div>

            <p className='font-gelasio text-xl ml-3'>{comment}</p>

            <div className='flex gap-5 items-center mt-5'>
                
                {
                  commentData.isReplyLoaded ?
                  <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2' onClick={HideReplies} >
                    <i className='fi fi-rs-comment-dots'></i> Hide Reply
                  </button>
                  : 
                  <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2' onClick={LoadReplies} >
                    <i className='fi fi-rs-comment-dots'></i> {children.length} Reply
                  </button>
                }

                <button className='underline' onClick={ReplyClick}>Reply</button>

                {
                  username == commented_by_username || username == blog_author ?
                   <button className='p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center' onClick={DeleteComment}><i className='fi fi-rs-trash pointer-events-none'></i>Delete</button>:""
                }

            </div>

              {
                  isReply ? 
                    <div className='mt-8'>
                      <CommentField action={"reply"} index = {index} replyingTo = {_id} setReplying = {setReply}/>
                    </div> : ""
              } 
            
        </div>

        <LoadMoreRepliesButton />
    </div>
    </>
  )
}

export default CommentCard