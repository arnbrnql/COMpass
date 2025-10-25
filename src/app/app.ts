import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Navbar from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import NotificationToast from './shared/components/notification-toast/notification-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('COMpass');
}

