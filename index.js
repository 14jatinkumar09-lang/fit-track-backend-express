import { connectDb } from "./src/db/db.connection.js";
import {auth} from './src/middleware/auth.js' ;
import dotenv from 'dotenv'
dotenv.config();
// import mongoose from "mongoose";
import z, { email } from 'zod'
import cors from 'cors'
import { User } from './src/models/user.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
connectDb();


/////////////////////////////////
import express from 'express';
import mongoose from "mongoose";
const app = express();
/////////////////////////////////
app.use(cors({
    origin : `${process.env.ORIGIN_URL} ` || "http://localhost:5173/" ,
    credentials: true ,
    sameSite : "none" ,
})) ;
app.use(express.json())
app.use(cookieParser()) ;


app.post("/signup", async (req, res) => {
    const body = req.body;
    const zodType = z.object({
        userName: z.string(),
        password: z.string(),
        email: z.string().email()
    });
    console.log(body)

    const validate = await z.safeParse(zodType, body);

    if (!validate.success) {
        return res.status(402).json({
            msg: "Wrong Input types",
            error: validate
        })
    }
    const userExist = await User.findOne({ email: body.email }).select("email");
    if (userExist) {
        return res.status(403).json({
            msg: "email already in used",
        });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const token = await jwt.sign(body, process.env.JWT_KEY);

    const user = await User.insertOne({ userName: body.userName, email: body.email, password: hashedPassword, });

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,              // MUST be true in production
        sameSite: "none",          // allow cross-domain cookies
        // maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });


    if (user) {
        return res.status(200).json({
            msg: "signup successful",
            user: user,
            token: token
        })
    }
    else {
        return res.json({
            msg: "something wemt wrong , please try again"
        })
    }
})



app.post("/login", async (req, res) => {

    const body = req.body;

    const zodType = z.object({
        email: z.string(),
        password: z.string(),
    });



    const validate = await z.safeParse(zodType, body);

    if (!validate.success) {
        return res.status(402).json({
            msg: "Wrong Input types",
            error: validate
        })
    }

    const user = await User.findOne({ email: body.email }).select("userName _id email password ");
    if (!user) {
        console.log(user , "up")
        return res.status(401).json({
            msg: "Invalid Email / Password"
        })
    }

    const isValid = await bcrypt.compare(body.password, user.password);
    if (!isValid) {
        console.log(user)
        return res.status(401).json({
            msg: "Invalid Email / Password",
        })
    }

    const token = jwt.sign(body, process.env.JWT_KEY);

    res.cookie("token", token, {
        httpOnly: "true" ,
        secure: true,              // MUST be true in production
        sameSite: "none",          // allow cross-domain cookies
        
    }); 
    // console.table(res.cookie) ;

    res.json({
        msg: "login successful",
        user: user,
        token: token
    })

})



app.post('/addFoodIntake',auth, async (req, res) => {
    let body = req.body;
    if(!body.foodName) {
        console.log("empty Body ") ;
        const user = await User.findOne({email:req.email}).select("foodIntake , activities") ;
        return res.status(201).json({
            user ,
        })
    }
    body = {
        ...body, time: Date().toString() ,deleted : false
    }

    const zodType = z.object({
        foodType: z.string(),
        foodName: z.string(),
        kcal: z.number(),
        time: z.string(),
    });
    const validate = z.safeParse(zodType, body);
    if (!validate.success) {
        return res.json({
            msg: "wrong inputs try again ",
            validate
        })
    }
    console.log("passed zod")
    // console.log(body);

    const payload = await User.findOneAndUpdate({email:req.email}, { $push: { foodIntake: body } }, { new : true }).select("foodIntake") ;
    console.log(payload) ;
    if (!payload) {
        return res.status(400).json({
            msg: "something went wrong",
            user: payload,
        })
    }
    return res.status(200).json({
        msg:'added' , 
        user : payload
    })
console.log("sent")




})



app.post('/addActivity', auth , async (req, res) => {
    let body = req.body;
    body = {
        ...body, time: Date().toString() , deleted : false
    }

    const zodType = z.object({
        activityName: z.string(),
        activityTime: z.number(),
        kcalBurned: z.number(),
        time: z.string()
    });

    const validate = z.safeParse(zodType, body);
    if (!validate.success) {
        return res.json({
            msg: "wrong inputs try again ",
            validate
        })
    }
    
    const payload = await User.findOneAndUpdate({email:req.email}, { $push: { activities: body } }, { new : true }).select("activities")
    // console.log(payload);

    if (payload) {
        return res.json({
            msg: "added",
            user: payload,
        })
    }
    return res.status(402).json({
        msg : "something went"
    })





})



// app.post('/editProfile', auth , async (req, res) => {
//     const body = req.body;
    
// console.log("body" , body) ;
//     const user = await User.findOneAndUpdate({email : req.email} , {$set: body } , { new: true })  ;
//     console.log('user' , user) ;
//     return res.json({
//         msg: "profile edit successful ",
//         user: user,
//     })



// })


app.post('/deleteItems' , auth , async(req,res)=>{
    const body = req.body ;
    const id = new mongoose.Types.ObjectId(body._id) ;
    if(body.foodType ) {

        const payload = await User.updateOne({email : req.email} , {$set : {"foodIntake.$[e].deleted" : true}} ,{arrayFilters : [ {"e._id" : id} ]}) ;
        console.log(payload) ;
        return res.status(201).json({
            msg  : "foodlog deleted" ,
            payload : payload ,
        })

    }


    const payload = await User.updateOne({email:req.email} , { $set : {"activities.$[e].deleted" : true} }, {arrayFilters : [ {"e._id" : id} ]}) ;
    console.log(payload) ;
    return res.status(201).json({
        msg : "activity deleted" ,
        payload 
    })


})



app.get("/details" , auth , async(req,res) => {
    const payload = await User.findOne({email : req.email}).select("userName email bodyDetails") ;
    return res.status(200).json({
        msg : "success" ,
        payload 
    })
})

app.post("/editDetails",auth , async(req,res)=>{
    const body = req.body ;
    try {
        await User.findOneAndUpdate({email : req.email} , { userName  :body.userName } ) ;
        const payload = await User.findOneAndUpdate({email : req.email} , { bodyDetails : body } , {new : true} )
        return res.status(201).json({
            msg : "success" ,
            payload 
        })
    } catch (error) {
        return res.status(201).json({
            msg : "request failed" ,
            payload : error , 
        })
    }
})



app.get("/logout" , auth , async(req,res) => {
    res.clearCookie("token" , {
        httpOnly: true,
        secure: true,              // MUST be true in production
        sameSite: "none",          // allow cross-domain cookies
    }) ;
    return res.status(200).json({
        msg : "logout successful"
    })
}
 )          


app.listen(3000)