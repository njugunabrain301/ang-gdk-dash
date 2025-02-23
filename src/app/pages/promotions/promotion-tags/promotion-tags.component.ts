import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PromotionsService } from '../../../services/promotions.service';
import { FilterByPipe } from '../../../pipes/filter-by.pipe';

@Component({
  selector: 'app-promotion-tags',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FilterByPipe,
  ],
  templateUrl: './promotion-tags.component.html',
  styleUrls: ['./promotion-tags.component.scss'],
})
export class PromotionTagsComponent {
  @Input() promotions: any[] = [];
  @Output() promotionsChange = new EventEmitter<any[]>();

  tag: string = '';
  addingTag: boolean = false;
  deleting: string = '';

  constructor(
    private promotionsService: PromotionsService,
    private snackBar: MatSnackBar
  ) {}

  async addTag() {
    if (this.addingTag) return;
    if (!this.tag) {
      this.showError('Please provide some content for the promotion tag');
      return;
    }

    const tags = this.promotions.filter((p) => p.type === 'tag');
    if (tags.length >= 2) {
      this.showError('You cannot add more than two tags');
      return;
    }

    this.addingTag = true;
    try {
      const res = await this.promotionsService
        .addPromotion({
          type: 'tag',
          content: this.tag,
        })
        .toPromise();

      if (res?.success) {
        this.showSuccess('Promotion tag successfully added');
        this.promotionsChange.emit(res.data);
      } else {
        this.showError('Unable to add tag');
      }
    } catch (error) {
      this.showError('Error adding tag');
    } finally {
      this.addingTag = false;
      this.tag = '';
    }
  }

  async deleteTag(id: string) {
    if (this.deleting) return;
    this.deleting = id;

    try {
      const res = await this.promotionsService.deletePromotion(id).toPromise();
      if (res?.success) {
        this.showSuccess('Tag deleted successfully');
        this.promotionsChange.emit(res.data);
      } else {
        this.showError('Unable to delete tag');
      }
    } catch (error) {
      this.showError('Error deleting tag');
    } finally {
      this.deleting = '';
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
