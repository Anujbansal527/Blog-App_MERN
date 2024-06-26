import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../Common/page-animation";
import InPageNavigation, {
  ActiveTab,
} from "../Components/inpage-navigation.component";
import Loader from "../Components/loader.component";
import BlogPost from "../Components/blog-post.component";
import TrendingBlogs from "../Components/nobanner-blog-post.component";
import NoDataMessage from "../Components/nodata.component";
import { filterPaginationData } from "../Common/filter-pagination-data";
import LoadMore from "../Components/load-more.component";
import SEO from "../Common/SEO";

const HomePage = () => {

  let [blogs, setBlogs] = useState(null);
  
  let [trend, setTrend] = useState(null);
  
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programing",
    "design",
    "lifehacks",
    "tech",
    "culture",
    "food",
    "travel",
    "health",
    "sports",
    "nature",
    "Art"
  ];

  const fetchLatestBlog = ({ page = 1 }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/latest-blogs`, {  page })
      .then(  async ({ data }) => {

        let formateData = await filterPaginationData({ 
          state: blogs,
          data: data.blogs,
          page,
          counteRoute: "/all-latest-blog-count"
         })
        setBlogs(formateData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const FetchBlogByCategory = ( { page = 1 } ) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/search-blogs`,{tag:pageState , page})
      .then( async ({ data }) => {
        let formateData = await filterPaginationData({ 
          state: blogs,
          data: data.blogs,
          page,
          counteRoute: "/search-blog-count",
          data_to_send:{tag:pageState}
         })
        setBlogs(formateData);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const fetchTrendingBlog = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/trending-blogs`)
      .then(({ data }) => {
        //console.log(data.blogs)
        setTrend(data.blogs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState == category) {
        
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  useEffect(() => {
    ActiveTab.current.click();

    if (pageState == "home") {
      fetchLatestBlog( {page:1} );
    }
    else{
      FetchBlogByCategory( {page:1} )
    }

    if (TrendingBlogs) {
      fetchTrendingBlog();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
        <SEO  page_title={" Home "} />
    
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {
              blogs == null ? (
                <Loader />
              ) : 
            
              blogs.results.length ? 
              (
                  blogs.results.map((blog,i) => {
                    return (
                      <AnimationWrapper transition={{duration:1,delay: i*0.1}} key={i}>
                        <BlogPost
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    )
                  })
                ) 
                : 
                (
                <>
                <NoDataMessage message={"No Blogs Published"} />
                </>
              )
              }
              <LoadMore  state={blogs} fetchDataFun={ ( pageState == "home" ? fetchLatestBlog : FetchBlogByCategory) }/>
            </>

            <>
              {trend == null ? (
                <Loader />
              ) : (
                trend.length ? 
                  trend.map((blog, i) => {
                    return (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <TrendingBlogs blog={blog} index={i} />
                      </AnimationWrapper>
                    );
                  })
                  :
                  <NoDataMessage message={"No Trending Blogs"} />
              )}
            </>
          </InPageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div className="">
              <h1 className="font-medium text-ml mb-8">
                Stories From All Interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {
                  categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogByCategory}
                      className={`tag  ${
                        pageState == category ? " bg-black text-white " : " "
                      }`}
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up" />
              </h1>
              {trend == null ? (
                <Loader />
              ) : 
                (trend.length ?
              
                trend.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <TrendingBlogs blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
                :
                <NoDataMessage message={"No Trending Blogs"} />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;