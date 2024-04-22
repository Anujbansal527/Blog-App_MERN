


import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../App'
import axios from 'axios'
import { filterPaginationData } from '../Common/filter-pagination-data'
import { Toaster } from 'react-hot-toast'
import InPageNavigation from '../Components/inpage-navigation.component'
import Loader from '../Components/loader.component'
import NoDataMessage from '../Components/nodata.component'
import AnimationWrapper from '../Common/page-animation'
import { ManageDraftBlog, ManagePublicBlog } from '../Components/manage-blogcard.component'
import LoadMore from '../Components/load-more.component'
import { useSearchParams } from 'react-router-dom'

const BlogsManage = () => {
    
    let { userAuth:{access_token} } = useContext(UserContext)

    const [blogs,setBlogs] = useState(null)
    const [drafts,setDrafts] = useState(null)
    const [query,setQuery] = useState('')
    
    let activeTab = useSearchParams()[0].get("tab")

    const getBLogs = ({page,draft,deleteDocCount = 0}) =>{
        
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/user-writen-blogs`,
    { page,draft, query, deleteDocCount },
    { headers: { Authorization: `Bearer ${access_token}` } 
    })
    .then( async ({data}) => {

        let formatedData = await filterPaginationData({
            state: draft ? drafts : blogs ,
            data: data.blogs,
            page,
            user:access_token,
            counteRoute: "/user-writen-blogs-count",
            data_to_send: {draft,query}
        })
        if(draft){
            setDrafts(formatedData)
        }
        else{
            setBlogs(formatedData)
        }
    })
    .catch((err)=>console.log(err))
    } 

    useEffect(() => {
        if(access_token){
            if(blogs == null){
                getBLogs({page:1 , draft : false})
            }
            if(drafts == null){
                getBLogs({page:1 ,draft:true})
            }
        }
    },[access_token,blogs , drafts , query])


    const SearchHandel = (e) => {
        let searchQuery = e.target.value;

        setQuery(searchQuery)
        if(e.keyCode == 13 && searchQuery.length ){
            setBlogs(null)
            setDrafts(null)
        }
      
    }

    const ChangeHandel = (e) => {
        if(!e.target.value.length){
            setQuery('')
            setBlogs(null)
            setDrafts(null)
        }
    }

return (
    <>
        <h1 className='max-md:hidden'>Manage Blogs</h1>
        <Toaster/>
        <div className='relative max-md:mt-5 md:mt-8 mb-10'>
            <input 
            type='serach'
            className='w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey' 
            placeholder='Search Blogs'
            onChange={ChangeHandel}
            onKeyDown={SearchHandel}
            /> 
            <i className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey'></i>
            
        </div>

        <InPageNavigation routes={["Published Blogs" , ["Drafts"]]} defaultActiveIndex={ activeTab != "draft" ? 0 : 1 }>
            {
                blogs == null ? <Loader /> :
                blogs.results.length ? 
                    <>
                        {
                            blogs.results.map((blog , i ) =>
                            {
                                return <AnimationWrapper key={i} transition={{delay: i * 0.04}}>
                                        <ManagePublicBlog blog={{...blog, index:i , setStatFun:setBlogs }} />
                                </AnimationWrapper>
                            })
                        }

                        <LoadMore state={blogs} fetchDataFun={getBLogs} additionslParam={{draft:false , deleteDocCount: blogs.deleteDocCount}} />
                    </>
                    :
                    <NoDataMessage message={"No Published Blogs"}/>
            }
            
            {
                drafts == null ? <Loader /> :
                drafts.results.length ? 
                    <>
                        {
                            drafts.results.map((blog , i ) =>
                            {
                                return <AnimationWrapper key={i} transition={{delay: i * 0.04}}>
                                        <ManageDraftBlog blog={{...blog, index:i , setStatFun:setDrafts }}  />
                                </AnimationWrapper>
                            })
                        }
                        <LoadMore state={drafts} fetchDataFun={getBLogs} additionslParam={{draft:true , deleteDocCount: drafts.deleteDocCount}} />

                    </>
                    :
                    <NoDataMessage message={"No Published Blogs"}/>
            }

        </InPageNavigation>
     </>
  )
}

export default BlogsManage