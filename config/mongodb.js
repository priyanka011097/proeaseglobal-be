import mongoose from "mongoose";
import dns from "node:dns";

// Some local networks' DNS resolvers refuse Atlas SRV lookups; force public DNS.
// Skip on Vercel (its runtime DNS is fine, and overriding it can break resolution).
if (!process.env.VERCEL) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectDB = async () => {

    mongoose.connection.on('connected',() => {
        console.log("DB Connected");
    })

    mongoose.connection.on('error',(err) => {
        console.log("DB connection error:", err.message);
    })

    const connectWithRetry = async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
        } catch (err) {
            console.log("Could not connect to MongoDB:", err.message)
            console.log("Server is still running; retrying in 10s. (Check your network/Atlas IP whitelist.)")
            setTimeout(connectWithRetry, 10000)
        }
    }

    await connectWithRetry()

}

export default connectDB;