const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

//My Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

//DB CONNECTION
mongoose.connect(process.env.DATABASE).then(() => {
  console.log('DB CONNECTED');
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);

// PORT
const port = process.env.PORT || 8000;

// Starting a server
app.listen(port, () => {
  console.log(`Server is up and running on port:${port}`);
});
