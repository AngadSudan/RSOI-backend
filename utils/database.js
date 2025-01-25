import mongoose from 'mongoose';
import 'dotenv/config';
const MAX_RETRY = 5;
const RETRY_INTERVAL = 5000;

class databaseConnection {
    constructor() {
        this.retryCount = 0;
        this.isconnected = false;

        mongoose.set('strictQuery', true);

        mongoose.connection.on('connected', () => {
            console.log('MONGODB Connected Successfully !');
            this.isconnected = true;
        });
        mongoose.connection.on('error', (err) => {
            console.log('MONGODB Connection Error: ', err);
            this.isconnected = false;
        });
        mongoose.connection.on('disconnected', async () => {
            console.log('MONGODB Disconnected !');
            this.isconnected = false;
            await this.handleConnectionError();
        });

        process.on('SIGTERM', this.handleAppTermination.bind(this));
    }
    async connectDB() {
        try {
            if (!process.env.MONGODB_URL) {
                throw new Error('MONGO_URL not found in .env file');
            }

            const connectionOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 4,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            };

            if (process.env.NODE_ENV === 'development') {
                mongoose.set('debug', true);
            }

            await mongoose.connect(process.env.MONGODB_URL, connectionOptions);
            this.retryCount = 0;
        } catch (error) {
            console.error('error in db connect occured' + error.message);
            await this.handleConnectionError();
        }
    }
    async handleConnectionError() {
        if (this.retryCount < MAX_RETRY) {
            this.retryCount++;
            console.log(
                `Retrying to connect to MongoDB in ${RETRY_INTERVAL / 1000} seconds...`
            );

            await new Promise((resolve) =>
                setTimeout(() => {
                    resolve;
                }, RETRY_INTERVAL)
            );

            return this.connectDB();
        } else {
            console.error('Max retry limit reached for db connection');
            process.exit(1);
        }
    }
    async handleDisconnect() {
        if (!this.isconnected) {
            console.log('Attempting to reconnect');
            await this.connectDB();
        }
    }
    async handleAppTermination() {
        try {
            await mongoose.connection.close();
            console.log(
                'Mongoose default connection disconnected through app termination'
            );
            process.exit(0);
        } catch (error) {
            console.error('Error in closing db connection' + error.message);
            process.exit(1);
        }
    }
    getConnectionStatus() {
        return {
            isConnected: this.isconnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };
    }
}

const dbConnection = new databaseConnection();

export default dbConnection.connectDB.bind(dbConnection);
export const getdbStatus = dbConnection.getConnectionStatus.bind(dbConnection);
