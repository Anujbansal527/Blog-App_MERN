//to use common js syntex with module js
import { createRequire } from 'module';
// Create a require function
const require = createRequire(import.meta.url);

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

//server side firebase
import admin from "firebase-admin";
//importing json file using common js
const serviceAccountKey = require("./firebase-json.json");

//can use import serviceAccountKey from "./firebase-json.json" assert {type:"json"}


import Database from "./Configs/Database.js"
import authRoute from "./Routes/AuthRoute.js"
import { assert } from 'console';

const app = express();

//configure env
dotenv.config();

//port of the server
let PORT = process.env.PORT || 6000 ;

//middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'));


//establish firebase into serverside
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
})



//database connection
Database();

//routes
app.use("/api/v1/auth",authRoute);


app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})
