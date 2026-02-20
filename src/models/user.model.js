import mongoose from "mongoose" ;
import { required } from "zod/mini";


const userSchema = mongoose.Schema({
    userName : {
        type : String ,
        required : true ,
    } ,
    password : {
        required : true , 
        type : String 
    } ,
    email : {
        required  : true ,
        unique : true ,
        type : String ,
    } ,
    bodyDetails : {
        
        type : {weight : Number ,
        height :Number ,
        goal : String ,
        caloriesIntakeTarget : Number , 
        caloriesBurnedTarget : Number, } ,
        default : {} 
        
    
    } ,
    foodIntake : [ {
        foodType : String ,
        foodName : String ,
        kcal : Number , 
        deleted : Boolean ,
        time :  Date
    } ] , 
    activities : [
        {
        activityName : String ,
        activityTime : Number ,
        kcalBurned : Number , 
        deleted : Boolean ,
        time :  String
    }
    ]
})


export const User =  mongoose.model("User" , userSchema ) ;