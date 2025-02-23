import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="marketing-container">
      <div class="header">
        <h3>Marketing</h3>
      </div>
      <div class="content">Coming Soon</div>
    </div>
  `,
  styles: [
    `
      .marketing-container {
        padding: 24px;

        .header {
          h3 {
            margin-bottom: 16px;
          }
        }

        .content {
          padding: 16px 0;
        }
      }
    `,
  ],
})
export class MarketingComponent {}
