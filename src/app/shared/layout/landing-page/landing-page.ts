import { Component } from '@angular/core';
import { Login } from '../../../features/auth/login/login';

@Component({
  selector: 'app-landing-page',
  imports: [Login],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {
  currentYear: number = new Date().getFullYear();
}
