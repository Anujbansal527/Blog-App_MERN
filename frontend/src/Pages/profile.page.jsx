import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../Common/page-animation";
import Loader from "../Components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../Components/about.component";
import { filterPaginationData } from "../Common/filter-pagination-data";
import BlogPost from "../Components/blog-post.component";
import NoDataMessage from "../Components/nodata.component";
import LoadMore from "../Components/load-more.component";
import InPageNavigation from "../Components/inpage-navigation.component";
import PageNotFound from "./404.page";

export const proData = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_blogs: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(proData);

  let [loading , setLoading] = useState(true);

  let [blogs ,setBlogs] = useState(null)

  let [ profileLoaded, setProfileLoaded] = useState("")

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  let { userAuth : {username} } = useContext(UserContext);
console.log(username)
  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/get-profile`, {
        username: profileId,
      })
      .then(({ data: user }) => {
        if(user != null) {
        setProfile(user);
        }
        setProfileLoaded(profileId)
        getBlogs({user_id: user._id})
        setLoading(false)
      })
      .catch((error) => {
        console.log(error.message);
        setLoading(false)
      });
  };

  const getBlogs = ({ page = 1 , user_id }) => {

    user_id = user_id == undefined ? blogs.user_id : user_id;

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/search-blogs`,{
      author: user_id,
      page
    })
    .then( async ({ data }) => {

      let formatedDate = await filterPaginationData({
        state:blogs,
         data:data.blogs,
         page,
         counteRoute: "/search-blog-count",
         data_to_send: { author: user_id }
      })

      formatedDate.user_id = user_id;
      setBlogs(formatedDate);

    })
  }

  useEffect(() => {
    if(profileId != profileLoaded)
    {
      setBlogs(null)
    }

    if(blogs == null)
    {
    resetState();
    fetchUserProfile();
    }
  }, [profileId,blogs]);

  const resetState = () =>{
    setProfile(proData)
    setLoading(true)
    setProfileLoaded("")
  }

  return (
    <AnimationWrapper>
        {
            loading ? 
            <Loader/> :
            profile_username.length 
            ? 
            <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:pl-10">
                    <img src={profile_img} alt="profile" className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"/>
                    <h1 className="text-2xl font-medium">@{profile_username}</h1>
                    <p className="text-xl capitalize h-6">{fullname}</p>
                    <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads </p>

                    <div className="flex gap-4 mt-2">
                        {
                            profileId == username ? 
                            <Link to={"/settings/edit-profile"} className="btn-light rounded-md">Edit Profile</Link>
                            :
                            ""
                        }
                    </div>

                    <AboutUser className="max-md:hidden" bio={bio} social_links={social_links}  joinedAt={joinedAt}/>

                </div>

                <div className="max-md:mt-12 w-full">
                        
                <InPageNavigation
            routes={[ "Blogs Published", "About"]}
            defaultHidden={["About"]}
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
              <LoadMore  state={blogs} fetchDataFun={ getBlogs }/>
            </>

              <AboutUser  bio={bio} social_links={social_links} joinedAt={joinedAt} />
           
          </InPageNavigation>

                </div>

            </section>
            : <PageNotFound/>
        } 
    </AnimationWrapper>
  );
};

export default ProfilePage;
