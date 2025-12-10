const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const flightRoutes = require('./routes/flightRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', flightRoutes);
app.use('/api', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
