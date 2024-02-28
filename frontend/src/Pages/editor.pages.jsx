


import React, { createContext, useContext, useState } from 'react'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom'
import BlogEditor from '../Components/blog-editor.component'
import PublishForm from '../Components/publish-form.component'

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags:[],
    des:'',
    author: {
        personal_info : { }
    }
}

export const EditorContext = createContext({});

const Editor = () => {

    const [blog,setBlog] = useState(blogStructure)

    const [editorState,setEditorState] = useState("editor")

    let { userAuth : {access_token} } = useContext(UserContext)
 
    return (
        <>
        <EditorContext.Provider value={ {blog , setBlog , editorState ,setEditorState}}>
            {
                access_token === null ? <Navigate to={"/singin"} />
                : editorState == "editor" ? <BlogEditor/> : <PublishForm/> 
            
            }
        </EditorContext.Provider>
        </>
  )
}

export default Editor