import jwt from "jsonwebtoken";



export const verifyToken = (req,res,next) => {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(token == null ){ 
        return res.Status(401).json({"error":"No Access Token"})
    }

    jwt.verify(token , process.env.JWT_SECRET, (error, user)=>{

        if( error ) {
            return  res.status(403).send({"error": 'Failed to authenticate token.' });
        }

        req.user = user.id
        next()
    })
    
}