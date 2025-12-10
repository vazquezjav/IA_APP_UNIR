const axios = require('axios');
const Flight = require('../models/Flight');

// --- External API Integration with DB Persistence ---

// Get live flights from OpenSky Network and save to DB
exports.getFlights = async (req, res) => {
    try {
        const response = await axios.get('https://opensky-network.org/api/states/all');
        const data = response.data;

        // Save/Update in DB (Upsert)
        // Limiting to first 100 to avoid overwhelming DB in this demo
        const flightsToSave = (data.states || []).slice(0, 100).map(f => ({
            callsign: (f[1] || 'N/A').trim(),
            country: f[2] || 'Unknown',
            lat: f[6],
            lon: f[5],
            heading: f[10] || 0,
            type: 'commercial',
            lastUpdated: new Date()
        }));

        const operations = flightsToSave.map(flight => ({
            updateOne: {
                filter: { callsign: flight.callsign },
                update: { $set: flight },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Flight.bulkWrite(operations);
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching flight data:', error.message);
        res.status(500).json({ error: 'Error al obtener datos de vuelos' });
    }
};

// Get military flights from ADSB.lol and save to DB
exports.getMilitaryFlights = async (req, res) => {
    try {
        const response = await axios.get('https://api.adsb.lol/v2/mil');
        const data = response.data;

        const flightsToSave = (data.ac || []).map(f => ({
            callsign: (f.flight || f.r || 'MIL').trim(),
            country: 'Military',
            lat: f.lat,
            lon: f.lon,
            heading: f.track || 0,
            type: 'military',
            lastUpdated: new Date()
        }));

        const operations = flightsToSave.map(flight => ({
            updateOne: {
                filter: { callsign: flight.callsign },
                update: { $set: flight },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Flight.bulkWrite(operations);
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching military flight data:', error.message);
        res.status(500).json({ error: 'Error al obtener datos de vuelos militares' });
    }
};

// --- Stats & Reporting ---

// Get flights updated in the last hour
exports.getFlightsLastHour = async (req, res) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const count = await Flight.countDocuments({ lastUpdated: { $gte: oneHourAgo } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate Excel Report
const ExcelJS = require('exceljs');

exports.generateReport = async (req, res) => {
    try {
        const flights = await Flight.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vuelos Actuales');

        worksheet.columns = [
            { header: 'Callsign', key: 'callsign', width: 15 },
            { header: 'País', key: 'country', width: 20 },
            { header: 'Tipo', key: 'type', width: 15 },
            { header: 'Latitud', key: 'lat', width: 15 },
            { header: 'Longitud', key: 'lon', width: 15 },
            { header: 'Rumbo', key: 'heading', width: 10 },
            { header: 'Última Actualización', key: 'lastUpdated', width: 25 }
        ];

        flights.forEach(flight => {
            worksheet.addRow(flight);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_vuelos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
};

// --- CRUD Operations ---

// Create Flight
exports.createFlight = async (req, res) => {
    try {
        const newFlight = new Flight(req.body);
        await newFlight.save();
        res.json(newFlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Flights from DB
exports.getAllFlights = async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Flight
exports.updateFlight = async (req, res) => {
    try {
        const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedFlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Flight
exports.deleteFlight = async (req, res) => {
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vuelo eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
