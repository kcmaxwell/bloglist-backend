const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

const app = express();

const mongoUrl = process.env.NODE_ENV === 'test'
  ? config.TEST_MONGODB_URI
  : config.MONGODB_URI;

mongoose.set('strictQuery', false);
mongoose
  .connect(mongoUrl)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogRouter);
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
