import React, { useContext } from "react";
import { EditorContext } from "../Pages/editor.pages";

const Tag = ({ tag,tagIndex }) => {

    let { blog,setBlog,blog: {tags}} = useContext(EditorContext);

    const TagDelete = () => {
        tags = tags.filter((t) => t !== tag);
        setBlog({...blog , tags: tags});
    }

    const addEditable = (e) =>{
        e.target.setAttribute("contenteditable", true);
        e.target.focus();
    }

    const tagEdit = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188){

            e.preventDefault();

            let currTag = e.target.innerText;

            tags[tagIndex] = currTag;

            setBlog({ ...blog , tags });
            //console.log(tags)

            e.target.setAttribute( "contenteditable" , false );
        }
    }


  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
      <p className="outline-none"  onKeyDown={tagEdit} onClick={addEditable}>
        {tag}
      </p>
      <button 
        onClick={TagDelete}
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2">
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
