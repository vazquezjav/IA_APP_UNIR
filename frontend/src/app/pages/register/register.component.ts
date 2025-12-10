import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = {
    name: '',
    email: '',
    password: ''
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.register(this.userData).subscribe({
      next: (res) => {
        console.log('Registro exitoso', res);
        alert('Registro exitoso. Por favor inicia sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error.error || 'Error al registrarse';
      }
    });
  }
}
