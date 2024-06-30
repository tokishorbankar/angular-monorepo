import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainNavComponent } from './components/main-nav/main-nav.component';

@Component({
  selector: 'lib-shared-ui',
  standalone: true,
  imports: [CommonModule, MainNavComponent],
  templateUrl: './shared-ui.component.html',
  styleUrl: './shared-ui.component.css',
})
export class SharedUiComponent {}
