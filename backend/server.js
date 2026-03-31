import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import houseRoutes from './routes/houseRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import debitRoutes from './routes/debitRoutes.js';
import religiousRoutes from './routes/religiousRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import bankRoutes from './routes/bankRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
// import './cron/maintenanceCron.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Configure MongoDB URI (default locally for dev)
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sds_group:SDS%401247@sds.rq78b1s.mongodb.net/sds_database?retryWrites=true&w=majority';

mongoose.connect(mongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Use routes
app.use('/api/houses', houseRoutes);
app.use('/api/maintenances', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/debits', debitRoutes);
app.use('/api/religious', religiousRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req,res)=>
    {
        res.send("Backend running!")
    })
