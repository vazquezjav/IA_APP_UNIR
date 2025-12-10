const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// External API Routes (with DB persistence)
router.get('/flights', flightController.getFlights);
router.get('/military-flights', flightController.getMilitaryFlights);

// Stats & Reports
router.get('/stats/last-hour', flightController.getFlightsLastHour);
router.get('/report/excel', flightController.generateReport);

// DB CRUD Routes
router.post('/db/flights', flightController.createFlight);
router.get('/db/flights', flightController.getAllFlights);
router.put('/db/flights/:id', flightController.updateFlight);
router.delete('/db/flights/:id', flightController.deleteFlight);

module.exports = router;
