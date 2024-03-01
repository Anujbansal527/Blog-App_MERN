import React, { useContext } from "react";
import AnimationWrapper from "../Common/page-animation";
import toast, { Toaster } from "react-hot-toast";
import { EditorContext } from "../Pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm = () => {

  let characterLimit = 200;
  let tagLimit = 10;

  let {userAuth: { access_token }} = useContext(UserContext)

  let {
    blog: { banner, title, tags, des, content },
    setEditorState,
    blog,
    setBlog,
  } = useContext(EditorContext);

  let navigate = useNavigate();

  const CloseBtn = () => {
    setEditorState("editor");
  };

  const BlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const BlogDesChange = (e) => {
    let input = e.target;

    setBlog({ ...blog, des: input.value });
  };

  const TitleKeyDown = (e) => {
    console.log(e);

    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const KeyDown = (e) =>{
    if(e.keyCode == 13 || e.keyCode == 188){
      e.preventDefault();

      let tag = e.target.value

      if(tags.length < tagLimit){
        if(!tags.includes(tag) && tag.length){
          setBlog({...blog , tags:[...tags, tag]})
        }
      }
      else{
        toast.error(`You Can Add Max ${tagLimit}`)
      }

      e.target.value="";
  }
  }

  const PublishBtn = (e) => {

    if(e.target.className.includes( "disable")) {
      return
    };

    if(!title.length){
      return toast.error( "Title is required" );
    }

    if(!des.length){
      return toast.error("Description is required");
    }

    if(!tags.length){
      return toast.error("Enter At least 1 tag")
    }

    let loading = toast.loading('Publishing .........')
  
    e.target.classList.add("disable")

    let blogObj = {
      title,banner,des,tags,content,draft:false
    }

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/create-blog`,
      blogObj,
      {headers:{Authorization:`Bearer ${access_token}`}}
    )
    .then(()=>{
        e.target.classList.remove("disable")
        toast.dismiss(loading)
        toast.success("Your Blog has been published successfully")

        setTimeout(()=>{
          navigate("/")
        },500)
    })
    .catch(({response})=>{

      e.target.classList.remove("disable")
       toast.dismiss(loading)

       return toast.error(response.data.error)
    });

  }

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols- py-16 lg:gap-4">
        <Toaster />
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={CloseBtn}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>

          <div className="border-grey lg:border-1 lg:pl-1">
            <p className="text-dark-grey mb-2 mt-9">Blog title</p>
            <input
              type="text"
              placeholder="Blog Title"
              defaultValue={title}
              className="input-box pl-4 "
              onChange={BlogTitleChange}
            />

            <p className="text-dark-grey mb-2 mt-9">
              Short description About Your Blog
            </p>

            <textarea
              maxLength={characterLimit}
              defaultValue={des}
              className="h-40 resize-none leading-7 input-box pl-4 "
              onChange={BlogDesChange}
              onKeyDown={TitleKeyDown}
            ></textarea>

            <p className="mt-1 text-dark-grey text-sm text-right ">
              {characterLimit - des.length} characters left
            </p>

            <p className="text-dark-grey mb-2 mt-9">
              Topics - (Helps is Searching and Ranking Your Blog Post)
            </p>

            <div className="relative input-box pl-2 py-2 pb-4">
              <input
                type="text"
                placeholder="Topic"
                className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                onKeyDown={KeyDown}
              />
              {
                tags.map((tag, i) => {
                  return <Tag tag={tag} tagIndex={i} key={i} />;
                })
              }
            </div>

            <p className="mt-1 mb-4 text-dark-grey text-right">
                {
                  tagLimit - tags.length
                } Tags Left
            </p>

            <button 
                className="btn-dark px-8"
                onClick={PublishBtn}  
            >
                  Publish
            </button>

          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
