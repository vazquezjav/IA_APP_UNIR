const express = require('express');
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', flightRoutes);
app.use('/api', authRoutes);

module.exports = app;
