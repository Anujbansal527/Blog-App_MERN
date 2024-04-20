import express from "express"
import { AddComment, DeleteComment, GetReplies, GoogleAuth, TrendingBlogs, UpdateProfile, allLatestBlogsCount, authSignin, authSignup, changePassword, createBlog, getBlogComment, getBlogs, imgURLUpload, isLiked, latestBlog, likeBlog, searchBlogCount, searchBlogs, searchUser, updateProfileImg, userProfile } from "../Controller/authController.js";
import { verifyToken } from "../MiddleWare/verifyToken.js";
const router = express.Router();


//signup
router.route("/signup").post(authSignup);

//signin
router.route("/signin").post(authSignin);

//google auth route
router.route("/google-auth").post(GoogleAuth);

//uploading image 
router.route("/get-upload-url").get(imgURLUpload);

//create blog
router.route("/create-blog").post(verifyToken,createBlog);

//latets blog route
router.route("/latest-blogs").post(latestBlog);

//trending blog route
router.route('/trending-blogs').get(TrendingBlogs);

//serch blog
router.route("/search-blogs").post(searchBlogs);

// blog latetst
router.route("/all-latest-blog-count").post(allLatestBlogsCount);

// search-blog-count
router.route("/search-blog-count").post(searchBlogCount);

//search-users
router.route("/search-users").post(searchUser)

//user profile
router.route("/get-profile").post(userProfile);

//get-blog
router.route("/get-blog").post(getBlogs);

//like route
router.route("/like-blog").post(verifyToken,likeBlog);

//isliked
router.route("/isliked").post(verifyToken,isLiked)

//add-comment
router.route("/add-comment").post(verifyToken,AddComment) 

//get-blog-comments
router.route("/get-blog-comments").post(getBlogComment)

//get-replies
router.route("/get-replies").post(GetReplies)

//delete-comment
router.route("/delete-comment").post(verifyToken,DeleteComment)

//change-password
router.route("/change-password").post(verifyToken,changePassword)

//update-profile-img
router.route("/update-profile-img").post(verifyToken,updateProfileImg)

//update-profile
router.route("/update-profile").post(verifyToken,UpdateProfile)

export default router;  