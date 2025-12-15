import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let messageServiceSpy: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'isAdmin', 'getFlightsLastHour', 'getLoginHistory', 'updateProfile']);
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: MessageService, useValue: messageSpy }
            ]
        }).compileComponents();

        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load admin data if user is admin', () => {
        authServiceSpy.getUser.and.returnValue({ name: 'Admin' });
        authServiceSpy.isAdmin.and.returnValue(true);
        authServiceSpy.getFlightsLastHour.and.returnValue(of({ count: 10 }));
        authServiceSpy.getLoginHistory.and.returnValue(of([]));

        fixture.detectChanges(); // triggers ngOnInit

        expect(authServiceSpy.getFlightsLastHour).toHaveBeenCalled();
        expect(authServiceSpy.getLoginHistory).toHaveBeenCalled();
        expect(component.flightsLastHour).toBe(10);
    });

    it('should not load admin data if user is not admin', () => {
        authServiceSpy.getUser.and.returnValue({ name: 'User' });
        authServiceSpy.isAdmin.and.returnValue(false);

        fixture.detectChanges();

        expect(authServiceSpy.getFlightsLastHour).not.toHaveBeenCalled();
    });

    it('should open edit profile dialog', () => {
        component.user = { name: 'Test' };
        component.showEditProfile();
        expect(component.displayEditProfile).toBeTrue();
        expect(component.editData.name).toBe('Test');
    });

    it('should save profile changes', () => {
        authServiceSpy.updateProfile.and.returnValue(of({ user: { name: 'Updated' } }));
        component.editData = { name: 'Updated' };

        component.saveProfile();

        expect(authServiceSpy.updateProfile).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(component.user.name).toBe('Updated');
        expect(component.displayEditProfile).toBeFalse();
    });

    it('should handle file selection (valid size)', () => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        Object.defineProperty(mockFile, 'size', { value: 500 }); // 500 bytes
        const event = { target: { files: [mockFile] } };

        const readerSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL', 'onload']);
        spyOn(window, 'FileReader').and.returnValue(readerSpy);

        component.editData = {};
        component.onFileSelected(event);

        // Simulate reader onload
        const reader = (window.FileReader as any).calls.mostRecent().returnValue;
        reader.onload({ target: { result: 'base64string' } });

        expect(component.editData.photoUrl).toBe('base64string');
    });

    it('should reject large files', () => {
        const mockFile = new File([''], 'large.png', { type: 'image/png' });
        Object.defineProperty(mockFile, 'size', { value: 2000000 }); // 2MB
        const event = { target: { files: [mockFile] } };

        component.onFileSelected(event);

        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    });
});
