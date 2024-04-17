

import React, { useContext } from 'react'
import { BlogContext } from '../Pages/blog.page'
import CommentField from './comment-field.component'
import axios from 'axios';
import AnimationWrapper from '../Common/page-animation';
import CommentCard from './comment-card.component';
import NoDataMessage from './nodata.component';

export const fetchComment = async ({ skip=0 , blog_id, setParentCountFun , comment_array = null }) =>{

    let res;

    await axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/get-blog-comments`,
    {blog_id,skip})
    .then(({data}) => {
        data.map(comment => {
            comment.childrenLevel = 0
        })

        setParentCountFun(preVal => preVal + data.length)

        if(comment_array == null){
            res = { results : data }
        }
        else{
            res = {results : [ ...comment_array , ...data ]}
        }
    })

    return res;
}


const CommentContainer = () => {
  
    let { blog ,blog:{_id,title,comments: {results:commentsArr}, activity : {total_parent_comments}}, cmntWrapper,setCmntWrapper,totalCommnetsLoaded,setTotalCommentsLoaded,setBlog } = useContext(BlogContext)
    
    const LoadMore = async() => {

        let newCommentArr = await fetchComment
        ({ skip:totalCommnetsLoaded , blog_id: _id,setParentCountFun:setTotalCommentsLoaded,comment_array:commentsArr })
    
        setBlog({...blog,  comments:newCommentArr});
    }

    return (
    <div className={`max-sm:full fixed ${cmntWrapper ? "top-0 sm:right-[0] " : "top-[100%] sm:right-[-100%]" } duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto  overflow-x-hidden`}>
    
        <div className='relative'>
            <h1 className='text-xl font-medium'>Comments</h1>
            <p className='text-lg mt-2 w-[70%] text-dark-grey line-clamp-1'>{title}</p>
            <button
            onClick={()=> setCmntWrapper(prev =>!prev)}
            className='absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey'
        >
            <i className='fi fi-br-cross text-2xl mt-1'></i>
        </button>
        </div>

        <hr className='border-grey my-8 w-[120%] -ml-10'/>

        <CommentField action={"Comment"}/>

        {
            
            commentsArr && commentsArr.length ? 
            commentsArr.map((comment,i)=>{
                return <AnimationWrapper key={i}>
                    <CommentCard index={i} leftVal={comment.childrenLevel*4} commentData={comment} />
                </AnimationWrapper>
            }):
            <NoDataMessage message={"There is no comment yet."} />
        }

        {
            total_parent_comments > totalCommnetsLoaded ? 
            <button 
            onClick={LoadMore}
            className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                Load More
            </button>
            : ""
        }

    </div>
  )
}

export default CommentContainer