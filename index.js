require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user-routes');
const errorMiddleware = require('./middleware/error-middleware');
const app = express();
const PORT = process.env.PORT || 6000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
}));
app.use('/api', userRoutes);
app.use(errorMiddleware);

const start = async () => {
    try {
        mongoose
            .connect(process.env.BD_URL)
            .then(() => console.log('Connected to DB'))
            .catch((error) => console.log(`Connection error: ${error}`));
        app.listen(PORT, (error) => {
            error ? console.log(error) : console.log(`Server opened in PORT: ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();