const request = require('supertest');
const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/User');

// Mock User model
jest.mock('../models/User');

const app = express();
app.use(express.json());
app.post('/register', authController.register);
app.post('/login', authController.login);

describe('Auth Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            User.findOne.mockResolvedValue(null); // No existing user
            User.prototype.save = jest.fn().mockResolvedValue({
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            });

            const res = await request(app)
                .post('/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Usuario registrado exitosamente');
        });

        it('should return 400 if user already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            const res = await request(app)
                .post('/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'El usuario ya existe');
        });
    });

    describe('POST /login', () => {
        it('should login successfully with correct credentials', async () => {
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
                loginHistory: [],
                save: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Login exitoso');
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });

        it('should return 401 with invalid credentials', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
        });
    });
});
