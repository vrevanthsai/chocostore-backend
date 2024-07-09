import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js'
import cors from 'cors';

// configure env
dotenv.config();

// database config-CONNECT
connectDB();

// rest object
const app= express();

// middleware
// cors setup
app.use(cors());
// morgan config
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/category", categoryRoutes );
app.use("/api/v1/product" , productRoutes)

// rest api
// home page
app.get("/",(req,res)=>{
    // res.send({
    //     message:"welcome to Ecommerce app",
    // });
    res.send("<h1>Welcome to Ecommerce app</h1>");
})

// PORT 
const PORT = process.env.PORT || 8080;
// run listen
app.listen(PORT,()=>{
    console.log(`Server running on ${process.env.DEV_MODE} mode on port at ${PORT}`);
});