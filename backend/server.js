const app = require('./app');
const connectDB = require('./config/db');

const PORT = 3000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
