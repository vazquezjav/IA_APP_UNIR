import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
    users: any[] = [];

    constructor(private http: HttpClient, private authService: AuthService) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
            next: (data) => this.users = data,
            // Error handled by global interceptor
        });
    }

    logout() {
        this.authService.logout();
    }

    getSeverity(role: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
        return role === 'admin' ? 'info' : 'secondary';
    }
}
