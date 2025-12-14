import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login successfully and store user', () => {
        const mockResponse = {
            message: 'Login exitoso',
            user: { id: '1', name: 'Test', email: 'test@test.com', role: 'user' }
        };

        service.login({ email: 'test@test.com', password: 'password' }).subscribe(res => {
            expect(res).toEqual(mockResponse);
            expect(localStorage.getItem('user')).toBeTruthy();
        });

        const req = httpMock.expectOne('http://localhost:3000/api/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should register successfully', () => {
        const mockResponse = { message: 'Usuario registrado exitosamente' };

        service.register({ name: 'Test', email: 'test@test.com', password: 'password' }).subscribe(res => {
            expect(res).toEqual(mockResponse);
        });

        const req = httpMock.expectOne('http://localhost:3000/api/register');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should logout and clear storage', () => {
        localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
        service.logout();
        expect(localStorage.getItem('user')).toBeNull();
    });
});
