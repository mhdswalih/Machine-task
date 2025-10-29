import dotenv from 'dotenv';
import cors from 'cors'
import express from 'express';
import { connectDB } from './config/db';
import adminRouters from './routes/adminRoutes';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json())

app.use('/api/admin',adminRouters)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
  });
