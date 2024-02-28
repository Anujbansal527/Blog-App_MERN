import mongoose from "mongoose";
import  Color  from "colors";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () =>{
    try {   
        const conn = await mongoose.connect(process.env.DB_URL)
        console.log(`Connected to Mongodb Database ${conn.connection.host}`.bgMagenta.white)
    } catch (error) {
        console.log(`error occured  while connecting to the database ${error}`.bgRed.white);
    }
}

export default connectDB;