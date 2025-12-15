const flightController = require('../controllers/flightController');
const Flight = require('../models/Flight');
const axios = require('axios');
const httpMocks = require('node-mocks-http');

const mockWorkbook = {
    addWorksheet: jest.fn().mockReturnValue({
        columns: [],
        addRow: jest.fn()
    }),
    xlsx: {
        write: jest.fn().mockResolvedValue()
    }
};

jest.mock('exceljs', () => {
    return {
        Workbook: jest.fn(() => mockWorkbook)
    };
});

jest.mock('../models/Flight');
jest.mock('axios');

describe('Flight Controller', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    describe('getFlights', () => {
        it('should fetch flights from API and save to DB', async () => {
            const mockApiData = {
                states: [
                    ['callsign1', 'USA', 0, 0, 0, 0, 10, 20, 0, 0, 180]
                ]
            };
            axios.get.mockResolvedValue({ data: mockApiData });
            Flight.bulkWrite.mockResolvedValue({});

            await flightController.getFlights(req, res);

            expect(axios.get).toHaveBeenCalledWith('https://opensky-network.org/api/states/all');
            expect(Flight.bulkWrite).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockApiData);
        });

        it('should handle API errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            axios.get.mockRejectedValue(new Error('API Error'));

            await flightController.getFlights(req, res);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res._getData())).toEqual({ error: 'Error al obtener datos de vuelos' });
            consoleSpy.mockRestore();
        });
    });

    describe('getMilitaryFlights', () => {
        it('should fetch military flights and save to DB', async () => {
            const mockApiData = {
                ac: [
                    { flight: 'MIL1', lat: 10, lon: 20, track: 180 }
                ]
            };
            axios.get.mockResolvedValue({ data: mockApiData });
            Flight.bulkWrite.mockResolvedValue({});

            await flightController.getMilitaryFlights(req, res);

            expect(axios.get).toHaveBeenCalledWith('https://api.adsb.lol/v2/mil');
            expect(Flight.bulkWrite).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockApiData);
        });
    });

    describe('getFlightsLastHour', () => {
        it('should return count of flights updated in last hour', async () => {
            Flight.countDocuments.mockResolvedValue(50);

            await flightController.getFlightsLastHour(req, res);

            expect(Flight.countDocuments).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ count: 50 });
        });
    });

    describe('generateReport', () => {
        it('should generate excel report', async () => {
            const mockFlights = [{ callsign: 'TEST', country: 'USA' }];
            Flight.find.mockResolvedValue(mockFlights);

            res.setHeader = jest.fn();
            res.end = jest.fn();

            await flightController.generateReport(req, res);

            expect(Flight.find).toHaveBeenCalled();
            expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Vuelos Actuales');
            expect(mockWorkbook.xlsx.write).toHaveBeenCalledWith(res);
            expect(res.end).toHaveBeenCalled();
        });
    });

    describe('CRUD Operations', () => {
        it('should create a flight', async () => {
            req.body = { callsign: 'NEW', country: 'USA' };
            // Mock constructor to return data with save method
            Flight.mockImplementation((data) => ({
                ...data,
                save: jest.fn().mockResolvedValue(data)
            }));

            await flightController.createFlight(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(req.body);
        });

        it('should get all flights', async () => {
            const mockFlights = [{ callsign: 'F1' }, { callsign: 'F2' }];
            Flight.find.mockResolvedValue(mockFlights);

            await flightController.getAllFlights(req, res);

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(mockFlights);
        });

        it('should update a flight', async () => {
            req.params.id = '123';
            req.body = { callsign: 'UPDATED' };
            Flight.findByIdAndUpdate.mockResolvedValue(req.body);

            await flightController.updateFlight(req, res);

            expect(Flight.findByIdAndUpdate).toHaveBeenCalledWith('123', req.body, { new: true });
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual(req.body);
        });

        it('should delete a flight', async () => {
            req.params.id = '123';
            Flight.findByIdAndDelete.mockResolvedValue({});

            await flightController.deleteFlight(req, res);

            expect(Flight.findByIdAndDelete).toHaveBeenCalledWith('123');
            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res._getData())).toEqual({ message: 'Vuelo eliminado' });
        });
    });
});
