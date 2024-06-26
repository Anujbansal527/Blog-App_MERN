import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import Jwt from "jsonwebtoken";

//firebase
import { getAuth } from "firebase-admin/auth";

import User from "../Models/User.js";
import Blog from "../Models/Blog.js";
import Notifications from "../Models/Notifications.js";

import { genrateUploadURL } from "../Configs/AWS.js";
import Comments from "../Models/Comments.js";

//genrating user name
const generateUsername = async (email) => {
  //creating username
  let username = email.split("@")[0];

  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((data) => {
    return data;
  });

  //this will add unique 5 character and merge with username
  isUsernameNotUnique ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

//formating user data to send to frontend
const FormateUserData = (user) => {
  //creating access token
  const accessToken = Jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return {
    access_token: accessToken,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

//signup
export const authSignup = (req, res) => {
  try {
    //fetching data from frontend

    let { fullname, email, password } = req.body;

    //regx validation for email and password

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    //validations
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Full name must be at least 3 characters" });
    }
    if (!email.length) {
      return res.status(403).json({ error: "Enter Email" });
    }
    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Email is Invalid" });
    }
    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password Should be 6 to 20 Character long with a numeric , ! lowercase , 1 uppercase letter",
      });
    }

    //password hashing
    bcrypt.hash(password, 10, async (error, hashPassword) => {
      //creating unique user
      let username = await generateUsername(email);

      //creating user data
      let user = new User({
        personal_info: {
          fullname: fullname,
          email: email,
          username: username,
          password: hashPassword,
        },
      });

      //saving user
      user
        .save()
        .then((data) => {
          //calling function of formate data
          return res.status(200).json(FormateUserData(data));
        })
        .catch((error) => {
          //duplicasy error
          if (error.code == 11000) {
            return res.status(409).json({ error: "User already exists." });
          }

          return res.status(500).json({ error: error.message });
        });

      console.log(hashPassword);
    });
  } catch (error) {
    console.log(error);
  }
};

//singin
export const authSignin = (req, res) => {
  try {
    //fetch data from frontend
    let { email, password } = req.body;

    //finding udr from our data base
    User.findOne({ "personal_info.email": email })
      .then((user) => {
        //check user exist or not
        if (!user) {
          return res.status(403).json({ error: "Email not Found" });
        }
        //decrypting the password and compare the password
        bcrypt.compare(
          password,
          user.personal_info.password,
          (error, result) => {
            if (error) {
              return res
                .status(403)
                .json({ error: "Error occured while login please try again" });
            }

            if (!result) {
              return res
                .status(403)
                .json({ error: "Email or Password in Incorrect" });
            } else {
              return res.status(200).json(FormateUserData(user));
            }
          }
        );
      })

      .catch((error) => {
        console.log(error);
        return res.status(500), json({ error: error.message });
      });
  } catch (error) {
    console.log(error);
  }
};

//google auth
export const GoogleAuth = async (req, res) => {
  try {
    let { access_token } = req.body;

    getAuth()
      .verifyIdToken(access_token)
      .then(async (decodedUser) => {
        let { email, name, picture } = decodedUser;

        // console.log(decodedUser);

        picture = picture.replace("s96-c", "s384-c");

        let user = await User.findOne({ "personal_info.email": email })
          .select(
            "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
          )
          .then((data) => {
            return data || null;
          })
          .catch((error) => {
            return res.status(500).json({ error: error.message });
          });

        if (user) {
          //login
          if (!user.google_auth) {
            return res.status(403).json({
              error:
                "This Email was Signed Up Without Google Please log in with password to access the account",
            });
          }
        } else {
          //singin
          let username = await generateUsername(email);

          user = new User({
            personal_info: {
              fullname: name,
              email,
              profile_img: picture,
              username,
            },
            google_auth: true,
          });

          await user
            .save()
            .then((data) => {
              user = data;
            })
            .catch((error) => {
              return res.status(500).json({ error: error.message });
            });
        }

        return res.status(200).json(FormateUserData(user));
      })
      .catch((error) => {
        return res.status(500).json({
          error:
            "Failed to authenticate you with google. Try with other Google Account",
        });
      });
  } catch (error) {
    console.log(error);
  }
};

//creating blog

//image url
export const imgURLUpload = (req, res) => {
  genrateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    });
};

//create blog
export const createBlog = (req, res) => {
  let authorId = req.user;

  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!draft) {
    if (!des.length) {
      return res
        .status(400)
        .json({ error: "Please Provide Blog Description unser 200 Character" });
    }

    if (!banner.length) {
      return res.status(400).json({ error: "Please Provide Blog's Banner" });
    }

    if (!content.blocks.length) {
      return res.status(400).json({ error: "There Must Be Some Blog Content" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(400).json({ error: `Tags must be between 1 and 10` });
    }
  }

  if (!title.length) {
    return res.status(400).json({ error: "Title is required" });
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(() => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((error) => {
        return res.status(500).json({ error: error.message });
      });
  } else {
    let blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });

    blog
      .save()
      .then((blog) => {
        let incVal = draft ? 0 : 1;

        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(201).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: "Server Error, faild to update post number" });
          });
      })
      .catch((e) => {
        console.log("Error in saving the blog", e);
        return res
          .status(500)
          .json({ error: "Server Error, failed to save blog" });
      });
  }
};

///home page

//latest-blog
export const latestBlog = (req, res) => {
  let { page } = req.body;

  let maxLimit = 4;

  Blog.find({ draft: false })
    .populate(
      "author",
      " personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({blogs});
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

//trending blog
export const TrendingBlogs = (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      " personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

//search-blogs
export const searchBlogs = (req, res) => {
  let { tag, page, author, query, limit, eliminate_blog } = req.body;

  let findQuery;

  if (tag) {
    //"ne" stand for not equaL TO
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  let maxLimit = limit ? limit : 5;

  Blog.find(findQuery)
    .populate(
      "author",
      " personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

//pagination

//all-latest-blog-count
export const allLatestBlogsCount = (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    });
}; 

//search-blog-count
export const searchBlogCount = (req, res) => {
  let { tag, author, query } = req.body;

  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((error) => {
      console.log(error.message);
      return res.status(500).json({ error: "No result found" });
    });
};

//search-users
export const searchUser = (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.fullname personal_info.username personal_info.profile_img -_id"
    )
    .then((users) => {
      console.log(users);
      return res.status(200).json({ users });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error.message });
    });
};

//user profile
export const userProfile = (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error.message });
    });
};

//get-blog
export const getBlogs = (req, res) => {
  let { blog_id, draft, mode } = req.body;

  let incrementVal = mode != "edit" ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } }
      ).catch((error) => {
        return res.status(500).json({ error: error.message });
      });

      if (blog.draft && !draft) {
        return res.status(500).json({ error: "You Can Not Access Draft Blog" });
      }

      return res.status(200).json({ blog });
    })

    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

//like-blog
export const likeBlog = (req, res) => {
  let user_id = req.user;

  let { _id, isLike } = req.body;

  let incrementVal = !isLike ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  ).then((blog) => {
    if (!isLike) {
      let like = new Notifications({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id,
      });

      like.save().then((notification) => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      Notifications.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then((data) => {
          return res.status(200).json({ liked_by_user: false });
        })
        .catch((error) => {
          return res.status(500).json({ error: error.message });
        });
    }
  });
};

//isliked
export const isLiked = (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;

  Notifications.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

//add-comment
export const AddComment = (req, res) => {
  let user_id = req.user;

  let { _id, comment, blog_author, replying_To,notification_id } = req.body;

  if (!comment.length) {
    return res.status(403), json({ error: "Please enter a valid comment." });
  }

  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  if (replying_To) {
    commentObj.parent = replying_To;
    commentObj.isReply = true;
  }

  new Comments(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comment: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_To ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("New Comments Added");
    });

    let notificationObj = {
      type: replying_To ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };

    if (replying_To) {
      notificationObj.replied_on_comment = replying_To;

      await Comments.findOneAndUpdate(
        { _id: replying_To },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });

      if(notification_id){
        Notifications.findOneAndUpdate({_id:notification_id},{reply: commentFile._id})
        .then(notification => {console.log("Notification updates")})
      }

    }

    new Notifications(notificationObj)
      .save()
      .then((notification) => console.log("New Notification Created"));

    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  });
};

//get-blog-comments
export const getBlogComment = (req, res) => {
  let { blog_id, skip } = req.body;

  let maxLimit = 5;

  Comments.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({
      commentedAt: -1,
    })
    .then((comment) => {
      return res.status(200).json(comment);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error.message });
    });
};

//get-replies

export const GetReplies = (req, res) => {
  let { _id, skip } = req.body;
  let maxLimit = 5;

  Comments.findOne({ _id })
    .populate({
      path: "children",
      options: {
        limit: maxLimit,
        skip: skip,
        sort: { commentedAt: -1 },
      },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.fullname personal_info.username",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then(doc => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((error) => {
      return res.status(500).json(error.message);
    });
};

//delete-comment
const deleteComments = (_id) => {
  Comments.findOneAndDelete({ _id })
  .then((comment) => {
    if (comment.parent) {
      Comments.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      )
        .then((data) => {
          console.log("comment delete from parent");
        })
        .catch((error) => console.log(error.message));
    }

    Notifications.findOneAndDelete({comment:_id})
    .then(notification => console.log("comment notification deleted"))

    Notifications.findOneAndUpdate({reply: _id},{$unset:{ reply: 1 }})
    .then(notification => console.log("reply notification deleted"))

    Blog.findOneAndUpdate({_id:comment.blog_id},{$pull : {comment:_id},$inc: { "activity.total_comments":-1}, "activity.total_parent_comments": comment.parent ? 0 : -1})
    .then(blog => {
      if(comment.children.length){
        comment.children.map(replies => {
          deleteComments(replies) 
        })
      }
    })

  })
  .catch(error=>{
    console.log(error.message)
  })
};

export const DeleteComment = (req, res) => {
  let user_id = req.user;

  let { _id } = req.body;

  Comments.findOne({ _id }).then((comment) => {

    if (user_id == comment.commented_by || user_id == comment.blog_author) {
      deleteComments(_id);

      return res.status(200).json({ status: "done" });
    } else {
      return res.status(403).json({ error: "You Can Not Delete This COmment" });
    }
  });
};
 
//change-password
export const changePassword = (req,res) => {

  let { currentPassword,newPassword} = req.body;

  if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
    return res.status(403).json({error :"Password Should be 6 to 20 Character long with a numeric , ! lowercase , 1 uppercase letter"})
}

User.findOne({_id:req.user})
.then((user)=> {
  if(user.google_auth){
    return res.status(403).json({error:"You Can't change account's password because you logged in through google "})
  }

  bcrypt.compare(currentPassword , user.personal_info.password, (err,result) => {
    if(err){
       return res.status(500).json({error:"Some Error Occured While Changing the Password ,Please try again later "})
    }
    if(!result){
      return res.status(403).json({error:"Invalid Current Password!"});
    }

    bcrypt.hash(newPassword,10).then((err,hash) => {
      User.findOneAndUpdate({_id:req.user},{"personal_info.password":hash})
      .then((u)=>{
        return res.status(200).json({status:"Password Changed"})
      })
      .catch(err => {
        return res.status(500).json({error:"Some error occured while saving new password , please try again latter"})
      })
    })
  })
})
.catch(err => {
  console.log(err)
  return res.status(500).json({error:"Server Error! Try Again Later."})
})
}


//update-profile-img
export const updateProfileImg = (req,res) => {
  
  let {url} = req.body;

  let id = req.user;

  User.findOneAndUpdate({_id:id} , {"personal_info.profile_img":url})
  .then((data) => {
    return res.status(200).json({profile_img:url})
  })
  .catch(error => {
    return res.status(500).json({error:error.message})
  })
}

//update-profile
export const UpdateProfile = (req,res) => {

  let {username,bio,social_links} = req.body;

  let bioLimit = 150;

  if(username.length < 3){
    return res.status(403).json({error:"Username Should Be Atleast 3 Letters long"})
  }

  if(bio.length > bioLimit){
    return res.status(403).json({error:`Bio Should Not Be More Than ${bioLimit} characters`})
  }

  let socialLinkArr = Object.keys(social_links);

  try{
    
    for(let i=0 ;i<socialLinkArr.length;i++){
      
      if(social_links[socialLinkArr[i]].length){
        
        let hostname = new URL(social_links[socialLinkArr[i]]).hostname;
        
        if(!hostname.includes(`${socialLinkArr[i]}.com`) && socialLinkArr[i] != 'website'){
          return res.status(403).json({error:`${socialLinkArr[i]} link is invalid. You Must enter a full link`})
        }
      }
    }
  }
  catch(error){
    return res.status(500).json({error:"You Must Provide Full social links with http(s) included"})
  }

  let UpdateObj = {
    "personal_info.username":username,
    "personal_info.bio":bio,
    social_links
  }

  User.findOneAndUpdate({ _id : req.user},UpdateObj,{runValidators:true})
  .then(()=>{
    return res.status(200).json({username})  
  })
  .catch(err=>{
    if(err.code == 11000){
      return res.status(409).json({error:"Username Is Already Taken"})
    }
    return res.status(500).json({error: err.message});
  })
}

//new-notification
export const newNotification = (req,res) => {

  let user_id  = req.user;

  Notifications.exists({notification_for : user_id , seen:false , user: {$ne:user_id}})
  .then(result => {
    if(result){
      return res.status(200).json({new_notification_available:true})
    }
    else{
      return res.status(200).json({new_notification_available:false})
    }
  })
  .catch(err=>{
    console.log(err.message)
    return res.status(500).json({error:err.message})
  })
}

//notifications
  export const notifications = (req,res) =>{

    let user_id = req.user;
  
    let {page , filter , deleteDocCount} = req.body;
  
    let maxLimit = 10;
  
    let findQuery = { notification_for:user_id , user:{$ne:user_id}}
  
    let skipDoc = (page-1)*maxLimit;
  
    if(filter != 'all'){
      findQuery.type = filter
    }
  
    if(deleteDocCount){
      skipDoc -= deleteDocCount
    }
  
    Notifications.find(findQuery)
    .skip(skipDoc)
    .limit(maxLimit)
    .populate("blog"," title blog_id")
    .populate("user","personal_info.fullname  personal_info.username personal_info.profile_img")
    .populate("comment","comment")
    .populate("replied_on_comment","comment")
    .populate("reply","comment")
    .sort({createdAt: -1})
    .select("createdAt type seen reply")
    .then(notifications => {
  
      Notifications.updateMany(findQuery,{seen:true})
      .skip()
      .limit(maxLimit)
      .then(() => {
        console.log('notification seen')
      })
  
      return res.status(200).json({notifications})
    })
    .catch(error => {
      console.log(error.message)
      return res.status(500).json({error:error.message})
    })
  }
  


//all-notification-count
export const allNotificationCount = (req,res) => {
  
  let user_id = req.user

  let{filter} =req.body
  
  let findQuery = {notification_for:user_id , user:{$ne:user_id}}

  if(filter != 'all'){
    findQuery.type = filter;
  }

  Notifications.countDocuments(findQuery)
  .then(count => {
    return res.status(200).json({totalDocs:count})
  })
  .catch(error => {
    return res.status(500).json({error:error.message})
  })
}

//user-writen-blogs
export const  getUserWrittenBlogs = (req,res) => {

  let user_id = req.user;

  let { page , draft , query , deleteDocCount} = req.body
  
  let maxLimit = 5;

  let skipDoc = (page-1) * maxLimit;

  if(deleteDocCount){
    skipDoc -= deleteDocCount;
  }

  Blog.find({author:user_id, draft , title:new RegExp(query,'i') })
  .skip(skipDoc)
  .limit(maxLimit)
  .sort({publishedAt:-1})
  .select("title banner publishedAt blog_id activity des draft -_id")
  .then(blogs => {
    console.log(blogs)
    return res.status(200).json({blogs});
  })
  .catch(err=>{
    console.log('Error in getting the data from database : ', err);
    return res.status(500).json({error:err.message})
  })
}

//user-writen-blogs-count
export const getUserWrittenBlogsCount = (req,res) => {
  let user_id = req.user;

  let{draft , query} =req.body
 
  Blog.countDocuments({author:user_id, draft , title:new RegExp(query,'i') })
  .then(count => {
    return res.status(200).json({totalDocs : count})
  })
  .catch(err => {
    console.log(err.message)
    return res.status(500).json({error:err.message});
  })
}

//delete-blog
export const deleteBlog = (req,res) => {
  let user_id = req.user
  let { blog_id} = req.body

  Blog.findOneAndDelete({blog_id})
  .then(blog => {
    Notifications.deleteMany({blog:blog_id._id}).then(data => console.log("Notification deleted"))
    Comments.deleteMany({blog:blog_id._id}).then(data => console.log("Comments deleted"))
    User.findOneAndUpdate({_id:user_id}, {$pull : {blog:blog._id} , $inc: {"account_info.total_posts":-1} } )
    .then(user => console.log("Blog Deleted"))
    return res.status(200).json({status:"Done"})
  })
  .catch(error => {
    return res.status(500).json({error:error.message})
  })
}


