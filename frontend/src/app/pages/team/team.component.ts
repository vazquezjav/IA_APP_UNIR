import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, TextareaModule, ButtonModule, CardModule, AvatarModule, FloatLabelModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {
  contactData = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private messageService: MessageService) { }

  onSubmit() {
    console.log('Formulario enviado', this.contactData);
    this.messageService.add({ severity: 'success', summary: 'Mensaje Enviado', detail: 'Gracias por contactarnos. Te responderemos pronto.' });

    // Reset form
    this.contactData = { name: '', email: '', message: '' };
  }
}
