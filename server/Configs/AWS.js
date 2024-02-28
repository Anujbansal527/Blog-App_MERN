


import aws from "aws-sdk";
import { nanoid } from "nanoid";

const s3 = new aws.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECERETE_ACCESS_KEY
})

export const genrateUploadURL = async() => {

    const date = new Date();

    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise(
        'putObject', {
            Bucket: "blog-web-app-mern",
            Key: imageName ,
            Expires: 1000,
            ContentType : "image/jpeg"
        }
    )
}