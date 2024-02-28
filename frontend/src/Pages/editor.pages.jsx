


import React, { useContext, useState } from 'react'
import { UserContext } from '../App'
import { Navigate } from 'react-router-dom'
import BlogEditor from '../Components/blog-editor.component'
import PublishForm from '../Components/publish-form.component'

const Editor = () => {

    let { userAuth : {access_token} } = useContext(UserContext)
 
    const [editorState,setEditorState] = useState("editor")

    return (
        <>
            {
                access_token === null ? <Navigate to={"/singin"} />
                : editorState == "editor" ? <BlogEditor/> : <PublishForm/> 
            
            }
        </>
  )
}

export default Editor