import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileEdit } from '../../profile/profile-edit/profile-edit';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ProfileEdit],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  authService = inject(AuthService);
}
