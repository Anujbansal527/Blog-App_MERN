import express from "express"
import { GoogleAuth, authSignin, authSignup, createBlog, imgURLUpload, latestBlog } from "../Controller/authController.js";
import { verifyToken } from "../MiddleWare/verifyToken.js";
const router = express.Router();


//signup
router.route("/signup").post(authSignup);

//signin
router.route("/signin").post(authSignin);

//google auth route
router.route("/google-auth").post(GoogleAuth);

//uploading image 
router.route("/get-upload-url").get(imgURLUpload)

//create blog
router.route("/create-blog").post(verifyToken,createBlog)

//latets blog route
router.route("/latest-blogs").get(latestBlog);


export default router;  