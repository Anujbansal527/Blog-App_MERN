import React, { useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../images/logo.png";
import AnimationWrapper from "../Common/page-animation";
import Banner from "../images/banner.png";
import { uploadImage } from "../Common/aws";
import toast, { Toaster } from "react-hot-toast";
import { EditorContext } from "../Pages/editor.pages";
import EditorJs from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
  let blogBannerRef = useRef();

  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    editorState,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { blog_id } =  useParams();

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJs({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content ,
          tools: tools,
          placeholder: "Let's create a beautiful story...",
        })
      );
    } 
  }, []);

  const BannerUpload = (e) => {
    console.log(e);

    let img = e.target.files[0];

    if (img) {
      let loadingToast = toast.loading("Uploading Image...");

      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Image Uploaded Successfully!");
            //blogBannerRef.current.src = url;
            setBlog({ ...blog, banner: url });
          }
        })
        .catch((error) => {
          toast.dismiss(loadingToast);
          return toast.error("Error Occured While Uploading Image!");
        });
    }
  };

  const TitleKeyDown = (e) => {

    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const TitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const ErrorHandel = (e) => {
    let img = e.target;

    img.src = Banner;
  };

  const PublishBlog = () => {
    if (!banner.length) {
      return toast.error("Please upload an blog image!");
    }

    if (!title.length) {
      return toast.error("Title is empty");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          console.log(data);
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write Something !");
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const SaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Title is required");
    }

    let loading = toast.loading("Saving Draft .........");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      
      textEditor
      .save()
      .then((content) => {
        
        let blogObj = {
          title,
          banner,
          des,
          tags,
          content,
          draft: true,
        };

        axios
          .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/create-blog`,
            {...blogObj, id:blog_id } ,
            { headers: { Authorization: `Bearer ${access_token}` } }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loading);
            toast.success("Your Blog has been Saved successfully");

            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loading);

            return toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to={"/"} className="flex-none w-10">
          <img src={logo} />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full ">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={PublishBlog}>
            Publish
          </button>

          <button className="btn-light py-2" onClick={SaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full border-dark-grey pl-[100px] pr-[100px] pt-[20px]">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey ">
              <label htmlFor="uploadBanner">
                <img
                  ref={blogBannerRef}
                  src={banner}
                  alt="banner"
                  className="z-20"
                  onError={ErrorHandel}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  hidden
                  onChange={BannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={TitleKeyDown}
              onChange={TitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div className="font-gelasio" id="textEditor"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
