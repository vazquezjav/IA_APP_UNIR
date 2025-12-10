import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, TableModule, AvatarModule, DialogModule, InputTextModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    user: any;
    isAdmin: boolean = false;

    // Admin Data
    flightsLastHour: number = 0;
    loginHistory: any[] = [];

    // Edit Profile Data
    displayEditProfile: boolean = false;
    editData: any = {};

    constructor(private authService: AuthService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.isAdmin = this.authService.isAdmin();

        if (this.isAdmin) {
            this.loadAdminData();
        }
    }

    loadAdminData() {
        this.authService.getFlightsLastHour().subscribe(data => {
            this.flightsLastHour = data.count;
        });

        this.authService.getLoginHistory().subscribe(data => {
            this.loginHistory = data;
        });
    }

    downloadReport() {
        this.authService.downloadReport();
    }

    showEditProfile() {
        this.editData = { ...this.user }; // Clone user data
        this.displayEditProfile = true;
    }

    saveProfile() {
        this.authService.updateProfile(this.editData).subscribe({
            next: (res) => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado' });
                this.user = res.user; // Update local user
                this.displayEditProfile = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el perfil' });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1048576) { // 1MB limit
                this.messageService.add({ severity: 'warn', summary: 'Archivo muy grande', detail: 'La imagen debe ser menor a 1MB' });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.editData.photoUrl = e.target.result; // Base64 string
            };
            reader.readAsDataURL(file);
        }
    }
}
