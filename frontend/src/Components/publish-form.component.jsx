import React, { useContext } from "react";
import AnimationWrapper from "../Common/page-animation";
import toast, { Toaster } from "react-hot-toast";
import { EditorContext } from "../Pages/editor.pages";
import Tag from "./tags.component";

const PublishForm = () => {
  let characterLimit = 200;
  let tagLimit = 10;

  let {
    blog: { banner, title, tags, des },
    setEditorState,
    blog,
    setBlog,
  } = useContext(EditorContext);

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

            <button className="btn-dark px-8">
                  Publish
            </button>

          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
