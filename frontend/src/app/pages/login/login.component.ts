import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';

import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TabsModule, InputTextModule, ButtonModule, PasswordModule, FloatLabelModule, CardModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  activeTab: string = '0'; // '0': Login, '1': Register, '2': Recover

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '' };
  recoverData = { email: '' };

  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Bienvenido', detail: 'Inicio de sesión exitoso' });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Credenciales inválidas' });
      }
    });
  }

  onRegister() {
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Registro Exitoso', detail: 'Ahora puedes iniciar sesión' });
        this.activeTab = '0'; // Switch to login
      }
    });
  }

  onRecover() {
    if (this.recoverData.email) {
      this.messageService.add({ severity: 'info', summary: 'Recuperación', detail: 'Se ha enviado un enlace a tu correo' });
      setTimeout(() => this.activeTab = '0', 2000);
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingresa tu correo' });
    }
  }
}
