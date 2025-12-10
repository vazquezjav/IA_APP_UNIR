const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    callsign: String,
    country: String,
    lat: Number,
    lon: Number,
    heading: Number,
    type: { type: String, enum: ['commercial', 'military'] },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vuelo', FlightSchema);
