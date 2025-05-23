import mongoose from "mongoose";

const connectedDB = async ()=>{

   mongoose.connection.on('connected',()=>{
    console.log("database connected")
   })

    await mongoose.connect(`${process.env.MONGODB_URL}/imagify`);
}

export default connectedDB