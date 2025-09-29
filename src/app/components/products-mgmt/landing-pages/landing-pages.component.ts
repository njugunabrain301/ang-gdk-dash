import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SegmentComponent } from '../../segment/segment.component';
import { LandingPage, Article } from '../../../interfaces/Product.interface';
import { SafePipe } from '../../../pipes/safe.pipe';
import { catchError, tap } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-landing-pages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    SegmentComponent,
    SafePipe,
  ],
  templateUrl: './landing-pages.component.html',
})
export class LandingPagesComponent {
  @Input() landingPages: LandingPage[] = [];
  @Output() landingPagesChange = new EventEmitter<any[]>();

  currentLandingPage = '';
  newLandingPageName = '';
  selectedArticleType = '';
  newArticle: Article = {
    type: '',
    order: 0,
    content: {},
    visibility: true,
  };
  isAddingArticle = false;
  articleTypes = [
    'article',
    'counter',
    'list',
    'title',
    'link',
    'carousel',
    'video',
    'banner-video',
  ];
  listItem = {
    title: '',
    prefix: '',
    value: '',
    suffix: '',
  };
  listText = '';
  carouselItem = {
    title: '',
    description: '',
    image: null,
  };

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  get currentArticles(): Article[] {
    return (
      this.landingPages.find((lp) => lp.name === this.currentLandingPage)
        ?.articles || []
    );
  }

  get currentLandingPageSettings(): LandingPage {
    return (
      this.landingPages.find((lp) => lp.name === this.currentLandingPage) || {
        name: '',
        articles: [],
        miniHeader: false,
        default: false,
      }
    );
  }

  onMiniHeaderToggle() {
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    currentPage.miniHeader = !currentPage.miniHeader;
    this.emitChanges();
  }

  onDefaultToggle() {
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    // If turning on default for current page, turn off for all others
    if (!currentPage.default) {
      this.landingPages.forEach((page) => {
        page.default = false;
      });
      currentPage.default = true;
    } else {
      // Just turn off default for current page
      currentPage.default = false;
    }

    this.emitChanges();
  }

  addLandingPage() {
    if (!this.newLandingPageName) return;

    this.landingPages = [
      ...this.landingPages,
      {
        name: this.newLandingPageName,
        articles: [],
        miniHeader: false,
        default: false,
      },
    ];
    this.currentLandingPage = this.newLandingPageName;
    this.newLandingPageName = '';
    this.emitChanges();
  }

  addArticle() {
    if (!this.currentLandingPage || !this.selectedArticleType) return;

    // Validate required fields based on article type
    switch (this.selectedArticleType) {
      case 'article':
        if (!this.newArticle.content.title || !this.newArticle.content.text) {
          this.snackBar.open('Article requires both title and text', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return;
        }
        break;

      case 'counter':
        if (
          !this.newArticle.content.values ||
          this.newArticle.content.values.length === 0
        ) {
          this.snackBar.open(
            'Counter requires at least one counter item',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          return;
        }
        break;

      case 'list':
        if (
          !this.newArticle.content.title ||
          !this.newArticle.content.items ||
          this.newArticle.content.items.length === 0
        ) {
          this.snackBar.open(
            'List requires a title and at least one list item',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          return;
        }
        break;

      case 'title':
        if (!this.newArticle.content.title) {
          this.snackBar.open('Title field is required', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return;
        }
        break;

      case 'link':
        if (!this.newArticle.content.text || !this.newArticle.content.url) {
          this.snackBar.open('Link requires both text and URL', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
          return;
        }
        break;

      case 'carousel':
        if (
          !this.newArticle.content.title ||
          !this.newArticle.content.values ||
          this.newArticle.content.values.length === 0
        ) {
          this.snackBar.open(
            'Carousel requires a title and at least one carousel item',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          return;
        }
        break;

      case 'video':
        if (!this.newArticle.content.title || !this.newArticle.content.url) {
          this.snackBar.open(
            'Video requires both title and video URL',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          return;
        }
        break;

      case 'banner-video':
        if (
          !this.newArticle.content.videoId ||
          !this.newArticle.content.headline
        ) {
          this.snackBar.open(
            'Banner video requires a video ID and headline',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          return;
        }
        break;

      default:
        this.snackBar.open('Invalid article type', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
    }

    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    // Check if there's an image file to upload
    let imageUpload$ = of(null); // Default observable if no image needs uploading

    if (
      this.newArticle.content?.image &&
      this.newArticle.content.image instanceof File
    ) {
      const formData = new FormData();
      formData.append('image', this.newArticle.content.image);

      // Upload image first and get URL
      imageUpload$ = this.productService
        .uploadImage(this.newArticle.content.image)
        .pipe(
          take(1),
          tap((response) => {
            this.newArticle.content.image = response.data; // Update the image URL
          }),
          catchError((error) => {
            console.error('Error uploading image:', error);
            this.snackBar.open('Error uploading image', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
            return EMPTY;
          })
        );
    }

    // Wait for the image upload (if any) before proceeding
    imageUpload$.subscribe(() => {
      this.isAddingArticle = true;

      // Create new article with the selected type
      const newArticle: Article = {
        ...this.newArticle,
        type: this.selectedArticleType,
        order: currentPage.articles.length,
      };

      // Add the article to the current page
      currentPage.articles = [...currentPage.articles, newArticle];

      // Reset form
      this.resetArticleForm();

      // Emit changes
      this.emitChanges();
    });
  }

  handleArticleMove(
    articleId: string | undefined,
    event: { direction: string; index: number }
  ) {
    if (!articleId) return;
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    const articles = [...currentPage.articles];
    const currentIndex = event.index;
    let newIndex: number;

    switch (event.direction) {
      case 'up':
        newIndex = currentIndex - 1;
        break;
      case 'down':
        newIndex = currentIndex + 1;
        break;
      case 'top':
        newIndex = 0;
        break;
      case 'bottom':
        newIndex = articles.length - 1;
        break;
      default:
        return;
    }

    if (newIndex < 0 || newIndex >= articles.length) return;

    const [removed] = articles.splice(currentIndex, 1);
    articles.splice(newIndex, 0, removed);
    currentPage.articles = articles;
    this.emitChanges();
  }

  handleArticleUpdate(updatedArticle: Article, event: any) {
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    currentPage.articles = currentPage.articles.map((article) =>
      article._id === updatedArticle._id ? updatedArticle : article
    );
    this.emitChanges();
  }

  handleArticleDelete(articleId: string | undefined, event: any) {
    if (!articleId) return;
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    currentPage.articles = currentPage.articles.filter(
      (article) => article._id !== articleId
    );
    this.emitChanges();
  }

  handleArticleVisibility(articleId: string | undefined, event: any) {
    if (!articleId) return;
    const currentPage = this.landingPages.find(
      (lp) => lp.name === this.currentLandingPage
    );
    if (!currentPage) return;

    currentPage.articles = currentPage.articles.map((article) =>
      article._id === articleId
        ? { ...article, visibility: !article.visibility }
        : article
    );
    this.emitChanges();
  }

  private emitChanges() {
    this.landingPagesChange.emit(this.landingPages);
  }

  private resetArticleForm() {
    this.isAddingArticle = false;
    this.selectedArticleType = '';
    this.newArticle = {
      type: '',
      order: 0,
      visibility: true,
      content: {},
    };
    this.listItem = {
      title: '',
      prefix: '',
      value: '',
      suffix: '',
    };
    this.listText = '';
    this.carouselItem = {
      title: '',
      description: '',
      image: null,
    };
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newArticle.content.image = file;
    }
  }

  onCarouselImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.carouselItem.image = file;
    }
  }

  addCarouselItem() {
    if (
      !this.carouselItem.title ||
      !this.carouselItem.description ||
      !this.carouselItem.image
    )
      return;

    if (!this.newArticle.content.values) {
      this.newArticle.content.values = [];
    }

    // Upload image first and wait for URL
    this.productService
      .uploadImage(this.carouselItem.image)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          // Add carousel item with returned image URL
          this.newArticle.content.values.push({
            title: this.carouselItem.title,
            description: this.carouselItem.description,
            image: response.data,
          });

          // Reset carousel item form
          this.carouselItem = {
            title: '',
            description: '',
            image: null,
          };
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          // Optionally show error message to user
        },
      });
  }

  removeCarouselItem(index: number) {
    if (!this.newArticle.content.values) return;
    this.newArticle.content.values.splice(index, 1);
  }

  getImageUrl(image: File | string | null): string {
    if (!image) {
      return '';
    }

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    return image;
  }

  addCounterItem() {
    if (!this.listItem.value) return;
    if (!this.newArticle.content.values) this.newArticle.content.values = [];
    this.newArticle.content.values.push({ ...this.listItem });
    this.listItem = { title: '', prefix: '', value: '', suffix: '' };
  }

  removeCounterItem(index: number) {
    if (!this.newArticle.content.values) return;
    this.newArticle.content.values = this.newArticle.content.values.filter(
      (_: any, i: number) => i !== index
    );
  }

  addListItem() {
    if (!this.listText) return;
    if (!this.newArticle.content.items) this.newArticle.content.items = [];
    this.newArticle.content.items.push(this.listText);
    this.listText = '';
  }

  removeListItem(index: number) {
    if (!this.newArticle.content.items) return;
    this.newArticle.content.items = this.newArticle.content.items.filter(
      (_: any, i: number) => i !== index
    );
  }
}
