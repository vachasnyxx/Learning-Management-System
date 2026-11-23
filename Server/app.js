import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import errorMiddlware from './middlewares/error.middleware.js';
import courseRoutes from './routes/course.Routes.js'
import miscRoutes from './routes/miscellanous.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import userRoutes from './routes/user.Routes.js'

config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://learning-management-system-roan.vercel.app',
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, server-to-server, mobile)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    })
  );

app.use(cookieParser());
// Prevent browsers from caching API responses (avoids stale course/lecture data)
app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(morgan('dev'));

app.use('/ping',function(_req,res){
    res.send('Pong');
})

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/course', courseRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1', miscRoutes);
app.all('*',(_req,res)=>{
    res.status(404).send('OOPS!!  404 page not found ')
})
app.use(errorMiddlware);

export default app;