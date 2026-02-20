import mongoose from 'mongoose' ;

export const connectDb = async()=>{
    try {
        const connect = await mongoose.connect(process.env.DB_STRING) ;
        console.log( connect.Connection , "connection : true") ;
    } catch (error) {
        console.log(error) ;
    } 
}