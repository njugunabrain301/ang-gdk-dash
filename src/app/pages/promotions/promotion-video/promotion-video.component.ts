import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionsService } from '../../../services/promotions.service';
import { SafePipe } from '../../../pipes/safe.pipe';
import { FilterByPipe } from '../../../pipes/filter-by.pipe';

@Component({
  selector: 'app-promotion-video',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    SafePipe,
    FilterByPipe,
  ],
  templateUrl: './promotion-video.component.html',
  styleUrls: ['./promotion-video.component.scss'],
})
export class PromotionVideoComponent {
  @Input() promotions: any[] = [];
  @Output() promotionsChange = new EventEmitter<any[]>();

  link: string = '';
  adding: boolean = false;
  deleting: string = '';

  constructor(
    private promotionsService: PromotionsService,
    private snackBar: MatSnackBar
  ) {}

  async setLinkHandler() {
    if (this.adding) return;
    if (!this.link) {
      this.showError('Please provide a link to the video');
      return;
    }
    if (!this.link.startsWith('https://www.youtube.com/embed/')) {
      this.showError('Please provide a valid YouTube link');
      return;
    }

    this.adding = true;
    const videos = this.promotions.filter((p) => p.type === 'video');

    try {
      // Delete existing video if any
      if (videos.length >= 1) {
        const deleteRes = await this.promotionsService
          .deletePromotion(videos[0]._id)
          .toPromise();
        if (deleteRes?.success) {
          this.promotions = deleteRes.data;
        }
      }

      // Add new video
      const addRes = await this.promotionsService
        .addPromotion({
          type: 'video',
          content: this.link,
        })
        .toPromise();

      if (addRes?.success) {
        this.showSuccess('Promotion video successfully set');
        this.promotionsChange.emit(addRes.data);
      } else {
        this.showError('Unable to set promotion video');
      }
    } catch (error) {
      this.showError('Error setting promotion video');
    } finally {
      this.adding = false;
      this.link = '';
    }
  }

  async deleteVideo(id: string) {
    if (this.deleting) return;
    this.deleting = id;

    try {
      const res = await this.promotionsService.deletePromotion(id).toPromise();
      if (res?.success) {
        this.showSuccess('Video deleted successfully');
        this.promotionsChange.emit(res.data);
      } else {
        this.showError('Unable to delete video');
      }
    } catch (error) {
      this.showError('Error deleting video');
    } finally {
      this.deleting = '';
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
