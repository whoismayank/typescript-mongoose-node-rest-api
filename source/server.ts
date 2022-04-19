import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import mongoose from 'mongoose';
import bookRoutes from './routes/book';

const NAMESPACE = 'SERVER';
const app = express();

//connect database

mongoose.connect(config.mongo.url, config.mongo.options).then((result) => {
    logging.info(NAMESPACE, "connected to mongoose database!!");
}).catch((error) => {
    logging.error(NAMESPACE, error.message, error)
})


// Log the request
app.use(async (req,res,next)=>{
    /* logging the request */
    await logging.info(NAMESPACE, `METHOD: [${req.method}] -IP: [${req.socket.remoteAddress}]`)
    /* log the response */
    res.on('finish', async () => {
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    })
    next();
});

// Parse the body of the request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//   Rules of our API
app.use(async (req, res, next) => {
    try {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
    } catch (error) {}
    next();
})

//Routes {Main coding starts from here}
app.use('/api/books', bookRoutes);

// Error handling
app.use(async (req, res) => {
   const error = new Error('Not found');
   await res.status(404).json({
        message: error.message
    })
})


const httpServer = http.createServer(app);
httpServer.listen(config.server.port, () => {
    logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`)
    }
);
