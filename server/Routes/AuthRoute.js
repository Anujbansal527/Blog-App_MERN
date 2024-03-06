import express from "express"
import { GoogleAuth, TrendingBlogs, allLatestBlogsCount, authSignin, authSignup, createBlog, imgURLUpload, latestBlog, searchBlogCount, searchBlogs, searchUser } from "../Controller/authController.js";
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


export default router;  