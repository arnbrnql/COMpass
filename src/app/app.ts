import { Component, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';

import { MainLayout } from './shared/components/main-layout/main-layout';

@Component({
  selector: 'app-root',
  imports: [MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('compass');
}

