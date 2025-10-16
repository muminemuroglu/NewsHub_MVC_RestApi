import mongoose from "mongoose";


const url= 'mongodb://localhost:27017/MongoConnect';
const options={
    dbName:'newhub'
}
export const connectDB = async () => {
    try {
        await mongoose.connect(url, options)
        console.log("Connection Success")
    } catch (error) {
        console.error("Connection Error :" + error)
    }
}