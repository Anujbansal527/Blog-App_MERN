import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../Components/inpage-navigation.component";
import LoadMore from "../Components/load-more.component";
import NoDataMessage from "../Components/nodata.component";
import Loader from "../Components/loader.component";
import BlogPost from "../Components/blog-post.component";
import axios from "axios";
import { filterPaginationData } from "../Common/filter-pagination-data";
import AnimationWrapper from "../Common/page-animation";
import UserCard from "../Components/usercard.component";
import SEO from "../Common/SEO";

const SearchPage = () => {

    let [blogs,setBlogs] = useState(null)

    let [users,setUsers] = useState(null)

    let { query } = useParams();

    const searchBlogs = ({ page = 1, create_new_arr = false}) => {

        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/search-blogs`,{query,page})
        .then(  async ({ data }) => {

            let formateData = await filterPaginationData({ 
              state: blogs,
              data: data.blogs,
              page,
              counteRoute: "/search-blog-count",
              data_to_send:{ query },
              create_new_arr
             })

            setBlogs(formateData);
          })
          .catch((error) => {
            console.log(error);
          });
    }

    const fetchUsers = () => {
        axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/search-users`,{query})
        .then(({data:{users}})=> {

            setUsers( users );
        })
    }
    useEffect(()=>{
        resetState();
        searchBlogs( {page:1 , create_new_arr:true} )
        fetchUsers()
    },[query])

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }

    const UserCardWrapper = () => {
        return(
            <>
                {
                    users == null 
                    ? <Loader/>
                    :   users.length 
                            ? users.map((users,i) => {
                                return <AnimationWrapper key={i} transition={{duration:1 , delay:i*0.08}}>
                                        <UserCard user={users} />
                                </AnimationWrapper>
                            })
                            :<NoDataMessage message={"No User Found"}/>
                }
            </>
            )
    }
    

  return (
    <section className="h-cover flex justify-center gap-10">
        <SEO  page_title={`Search ${query}`} />
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results from " ${query}"`, "Account Matched"]}
          defaultHidden={["Account Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <BlogPost
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </AnimationWrapper>
                );
              })
            ) : (
              <>
                <NoDataMessage message={"No Blogs Published"} />
              </>
            )}
            <LoadMore
              state={blogs}
              fetchDataFun={ searchBlogs }
            /> 
          </>

          <UserCardWrapper/>

        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
            
            <h1 className="font-medium text-xl mb-8"> User Related Search <i className="fi fi-rr-user mt-1"></i></h1>
            <UserCardWrapper/>

      </div>
    </section>
  );
};

export default SearchPage;
