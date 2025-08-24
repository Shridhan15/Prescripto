import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())

// ✅ Proper CORS setup
app.use(cors({
  origin: ["https://prescripto-frontend-29f1.onrender.com"],  // no trailing slash
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true
}))

// ✅ Ensure OPTIONS requests are handled (preflight)
app.options("*", cors())

// api routes
app.use("/api/admin", adminRouter)  // localhost:4000/api/admin/add-doctor
app.use("/api/doctor", doctorRouter)
app.use("/api/user", userRouter)

// root endpoint
app.get("/", (req, res) => {
  res.send("API WORKING")
})

// start server
app.listen(port, () => console.log("Server Started", port))
