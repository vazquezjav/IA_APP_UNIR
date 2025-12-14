const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Backend Integration Tests', () => {
    beforeAll(async () => {
        // Connect to a TEST database
        const TEST_URI = 'mongodb://javier:Javier%2399@localhost:27017/vuelos_test?authSource=admin';
        await mongoose.connect(TEST_URI);
    });

    afterEach(async () => {
        // Clear database after each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Close connection
        await mongoose.connection.close();
    });

    describe('Auth Flow', () => {
        it('should register, login, and update profile', async () => {
            // 1. Register
            const registerRes = await request(app)
                .post('/api/register')
                .send({
                    name: 'Integration User',
                    email: 'integration@test.com',
                    password: 'password123'
                });

            expect(registerRes.statusCode).toBe(200);
            expect(registerRes.body.message).toBe('Usuario registrado exitosamente');

            // 2. Login
            const loginRes = await request(app)
                .post('/api/login')
                .send({
                    email: 'integration@test.com',
                    password: 'password123'
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.user).toHaveProperty('email', 'integration@test.com');
            const userId = loginRes.body.user.id;

            // 3. Update Profile
            const updateRes = await request(app)
                .put('/api/profile')
                .send({
                    id: userId,
                    name: 'Updated Name',
                    email: 'integration@test.com'
                });

            expect(updateRes.statusCode).toBe(200);
            expect(updateRes.body.user.name).toBe('Updated Name');

            // Verify in DB
            const userInDb = await User.findById(userId);
            expect(userInDb.name).toBe('Updated Name');
        });
    });
});
