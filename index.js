import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mogoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import ConnectDB from './utils/database.js';
import {
    eventsRouter,
    userRouter,
    faqRouter,
    supportRouter,
    reviewRouter,
    announcementRouter,
    membershipRouter,
} from './routes/index.js';

const app = express();
const port = process.env.PORT || 8000;
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 200,
    message:
        'Too many requests from this IP, please try again after 10 minutes',
});

//websecurity
app.use(helmet());
app.use(mogoSanitize());
app.use('/api', limiter);
app.use(hpp());

//express middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'device-remeber-token',
            'Access-Control-Allow-Origin',
            'Origin',
            'Accept',
        ],
    })
);

if (process.env.NODE_ENV === 'development') {
}
app.use(morgan('dev'));

//error handling
app.use((error, req, res, next) => {
    console.log(error.stack);
    res.status(error.status || 500).json({
        status: error.status || 500,
        error: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
});
//routes
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/faq', faqRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/membership', membershipRouter);
app.use('/api/v1/announcement', announcementRouter);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the Backend of the job portal application API ',
        version: '1.0.0',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        dbStatus:
            mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        FRONTEND_URL: process.env.FRONTEND_URL,
    });
});
app.use((req, res) => {
    res.status(404).json({
        status: 404,
        error: 'The route you were trying to access was Not Found',
    });
});

ConnectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(
                `Server is running on port ${port} and the enviornment is ${process.env.NODE_ENV} mode`
            );
        });
    })
    .catch((error) => {
        console.log('Error occured: ', error);
        process.exit(1);
    });
