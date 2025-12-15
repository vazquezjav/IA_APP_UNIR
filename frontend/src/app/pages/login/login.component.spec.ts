import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let messageServiceSpy: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
        const routerMock = jasmine.createSpyObj('Router', ['navigate']);
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, BrowserAnimationsModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerMock },
                { provide: MessageService, useValue: messageSpy }
            ]
        }).compileComponents();

        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call login and navigate on success', () => {
        authServiceSpy.login.and.returnValue(of({ token: '123' }));
        component.loginData = { email: 'test@test.com', password: 'password' };

        component.onLogin();

        expect(authServiceSpy.login).toHaveBeenCalledWith(component.loginData);
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show error on login failure', () => {
        authServiceSpy.login.and.returnValue(throwError(() => new Error('Error')));
        component.loginData = { email: 'test@test.com', password: 'wrong' };

        component.onLogin();

        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    });

    it('should call register and switch tab on success', () => {
        authServiceSpy.register.and.returnValue(of({}));
        component.registerData = { name: 'Test', email: 'test@test.com', password: 'pass' };

        component.onRegister();

        expect(authServiceSpy.register).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(component.activeTab).toBe('0');
    });
});
