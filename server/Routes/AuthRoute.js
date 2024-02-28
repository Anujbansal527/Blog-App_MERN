import express from "express"
import { GoogleAuth, authSignin, authSignup, imgURLUpload } from "../Controller/authController.js";
const router = express.Router();


//signup
router.route("/signup").post(authSignup);

//signin
router.route("/signin").post(authSignin);

//google auth route
router.route("/google-auth").post(GoogleAuth);

//uploading image 
router.route("/get-upload-url").get(imgURLUpload)

export default router;