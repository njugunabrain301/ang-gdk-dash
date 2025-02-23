import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Article } from '../../interfaces/Product.interface';
import { ProductService } from '../../services/product.service';

interface CarouselItem {
  image?: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-segment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './segment.component.html',
  styleUrls: ['./segment.component.css'],
})
export class SegmentComponent implements OnInit {
  @Input() article!: Article;
  updating = false;
  @Input() idx!: number;
  @Input() currentLp!: string;

  @Output() moveArticle = new EventEmitter<{
    direction: string;
    index: number;
  }>();
  @Output() updateArticle = new EventEmitter<Article>();
  @Output() deleteArticle = new EventEmitter<string>();
  @Output() toggleVisibility = new EventEmitter<string>();

  original!: Article;
  mArticle!: Article;
  update = false;
  saving = false;
  keys: string[] = [];
  newListItem = '';
  newCounterItem: any = {};
  newCarouselItem: any = {};
  addingCarousel = false;
  image: any;

  constructor(
    private sanitizer: DomSanitizer,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.original = this.article;
    this.mArticle = this.article;
    this.keys = Object.keys(this.article?.content || {});
    console.log(this.keys, this.article, this.currentLp);
  }

  // Movement methods
  moveUp() {
    this.moveArticle.emit({ direction: 'up', index: this.idx });
  }

  moveDown() {
    this.moveArticle.emit({ direction: 'down', index: this.idx });
  }

  toTop() {
    this.moveArticle.emit({ direction: 'top', index: this.idx });
  }

  toBottom() {
    this.moveArticle.emit({ direction: 'bottom', index: this.idx });
  }

  // Update methods
  toggleUpdate() {
    if (!this.update) {
      this.update = true;
      return;
    }

    this.saving = true;

    // Handle image upload if needed
    if (this.isFile(this.article.content.image)) {
      this.productService.uploadImage(this.article.content.image).subscribe({
        next: (response) => {
          if (response.success) {
            this.mArticle.content.image = response.data;
            console.log(this.mArticle);
            this.updateArticle.emit(this.mArticle);
            this.saving = false;
            this.update = false;
          } else {
            console.error('Error uploading image:');
            this.saving = false;
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.saving = false;
        },
      });
    } else {
      // No image to upload, just update the article
      this.updateArticle.emit(this.mArticle);
      this.saving = false;
      this.update = false;
    }
  }

  cancelChanges() {
    this.mArticle = { ...this.original };
    this.image = this.article.content.image;
    this.update = false;
  }

  // Helper methods
  isFile(input: any): boolean {
    return 'File' in window && input instanceof File;
  }

  camelCase(text: string): string {
    return text[0].toUpperCase() + text.slice(1);
  }

  // Content management methods
  addListItem() {
    // if (!this.newListItem || this.mArticle?.content?.items?.length >= 5) return;

    this.mArticle.content.items = [
      ...(this.mArticle.content.items || []),
      this.newListItem,
    ];
    this.newListItem = '';
  }

  removeListItem(index: number) {
    this.mArticle.content.items = this.mArticle.content.items?.filter(
      (_: any, i: any) => i !== index
    );
  }

  // Additional methods for counter and carousel items...

  getSafeUrl(videoId: string | undefined): SafeResourceUrl {
    if (!videoId) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }

  /**
   * Removes a carousel item at the specified index.
   * @param index - The index of the carousel item to remove.
   */
  removeCarouselItem(index: number): void {
    if (
      this.mArticle.content.values &&
      index >= 0 &&
      index < this.mArticle.content.values.length
    ) {
      this.mArticle.content.values.splice(index, 1);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log(this.mArticle);
      this.mArticle.content.image = file;
      console.log(this.mArticle);
    }
  }

  getImageUrl(): string {
    if (!this.mArticle?.content?.image) {
      return '';
    }

    if (typeof this.mArticle.content.image === 'string') {
      return this.mArticle.content.image;
    }

    return URL.createObjectURL(this.mArticle.content.image);
  }

  addCarouselItem() {
    console.log(this.newCarouselItem);
  }

  addCounterItem() {
    if (this.newCounterItem.title && this.newCounterItem.value !== undefined) {
      if (!this.mArticle.content.values) {
        this.mArticle.content.values = [];
      }
      this.mArticle.content.values.push({ ...this.newCounterItem });
      this.newCounterItem = { title: '', value: 0 };
    }
  }

  removeCounterItem(index: number) {
    if (
      this.mArticle.content.values &&
      index >= 0 &&
      index < this.mArticle.content.values.length
    ) {
      this.mArticle.content.values.splice(index, 1);
    }
  }

  onCarouselImageSelected(event: any) {
    console.log(event);
  }
}
