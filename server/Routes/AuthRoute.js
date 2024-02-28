import express from "express"
import { GoogleAuth, authSignin, authSignup } from "../Controller/authController.js";
const router = express.Router();


//signup
router.route("/signup").post(authSignup);

//signin
router.route("/signin").post(authSignin);

//google auth route
router.route("/google-auth").post(GoogleAuth);

export default router;