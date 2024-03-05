import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../Common/page-animation";
import InPageNavigation, { ActiveTab } from "../Components/inpage-navigation.component";
import Loader from "../Components/loader.component";
import BlogPost from "../Components/blog-post.component";
import TrendingBlogs from "../Components/nobanner-blog-post.component";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  let [trend, setTrend] = useState(null);
  let [pageState,setPageState] = useState("home")

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
  ];

  const fetchLatestBlog = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/latest-blogs`)
      .then(({ data }) => {
        //console.log(data.blogs)
        setBlogs(data.blogs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

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
    let category = e.target.innerText.toLowerCase()

    setBlogs(null);

    if(pageState == category ){
      setPageState("home");
      return
    }
    setPageState(category)
  }

  useEffect(() => {

    ActiveTab.current.click()

    if(pageState == "home"){
      fetchLatestBlog();
    }

    if(TrendingBlogs){
      fetchTrendingBlog();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => {
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
              )}
            </>

            <>
              {trend == null ? (
                <Loader />
              ) : (
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
                {categories.map((category, i) => {
                  return (
                    <button onClick={loadBlogByCategory} className={`tag  ${ pageState == category ? " bg-black text-white " : " "}` } key={i}>
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
