import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState("");

  let { _id: user_id } = blog_author;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let {
    notfications,
    notfications: { results },
    setNotifications,
  } = notificationData;

  const Comments = () => {

    if (!comment.length) {
      return toast.error("Write Something To Leave Comment");
    }

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/v1/auth/add-comment`,
        { _id, blog_author:user_id, comment, replying_To: replyingTo,notification_id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )

      .then(({ data }) => {
        
        setIsReplying(false); 
        results[index].reply= { comment , _id:data._id} 
        setNotifications({...notfications,results})
        
    })

      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder="Leave a Comment"
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>

      <button className="btn-dark mt-5 px-10 " onClick={Comments}>
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
