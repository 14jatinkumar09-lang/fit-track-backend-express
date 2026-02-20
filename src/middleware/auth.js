import dotenv from 'dotenv'
dotenv.config() ;
import jwt from 'jsonwebtoken' ;


export const auth = async(req,res,next)=>{
    // console.log(req) ;
    const token = req.cookies.token ;
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImdpbmlAZ21haWwuY29tIiwicGFzc3dvcmQiOiJnaW5pQDIwMDUiLCJpYXQiOjE3NzA4ODk4OTQsImV4cCI6MTc3MDg4OTg5Nn0.5drUWdmEpd2fYVYOboFPWuqLCrSYRVBGTY0pSnUKF2Q";
    if(!token) {
        return res.status(401).json({
            msg : "unauthorized , please login again to continue"
        })
    }
try {
    const payload = jwt.verify( token , process.env.JWT_KEY) ;
    req._id = payload._id ;
    req.email = payload.email ;
    // console.log("payload :" , payload) ;
    next() ;
    
} catch (error) {
    console.log(error)
    res.json({
        msg : "token expired login again to continue" ,
    })
}

}
