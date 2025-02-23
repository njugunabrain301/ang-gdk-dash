import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { PromotionsService } from '../../services/promotions.service';
import { PromotionTagsComponent } from './promotion-tags/promotion-tags.component';
import { PromotionVideoComponent } from './promotion-video/promotion-video.component';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    PromotionTagsComponent,
    PromotionVideoComponent,
  ],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.scss'],
})
export class PromotionsComponent implements OnInit {
  promotions: any[] = [];

  constructor(private promotionsService: PromotionsService) {}

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.promotionsService.getPromotions().subscribe({
      next: (response) => {
        if (response.success) {
          this.promotions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        // Handle error (you might want to add a notification service)
      },
    });
  }

  updatePromotions(updatedPromotions: any[]) {
    this.promotions = updatedPromotions;
  }
}
