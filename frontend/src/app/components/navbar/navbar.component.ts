import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.updateMenu();
  }

  updateMenu() {
    this.items = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        routerLink: '/'
      },
      {
        label: 'En Vivo',
        icon: 'pi pi-map',
        routerLink: '/en-vivo'
      },
      {
        label: 'Equipo',
        icon: 'pi pi-users',
        routerLink: '/equipo'
      },
      {
        label: 'Admin',
        icon: 'pi pi-cog',
        routerLink: '/admin',
        visible: this.authService.isAdmin()
      }
    ];
  }
}
