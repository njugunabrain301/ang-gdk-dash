import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { MatIconModule } from '@angular/material/icon';

interface ProductModel {
  img: File | null;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  gender: string;
  description: string;
  extras: any;
  brand: string;
  condition: string;
}

@Component({
  selector: 'app-new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatGridListModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewProductComponent implements OnInit {
  @Input() storeData: any[] = [];
  @Input() categories: any[] = [];
  @Output() storeDataChange = new EventEmitter<any[]>();

  isAdding = false;
  building = 'Uploading...';
  make = '';
  model = '';
  otherSubCat = '';
  errorMessage = '';

  prod: ProductModel = {
    img: null,
    name: '',
    category: '',
    subcategory: '',
    price: 0,
    gender: '',
    description: '',
    extras: {},
    brand: '',
    condition: '',
  };

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  containsUnwantedHtmlTags(inputString: string): boolean {
    const htmlTagPattern = /<[^>]+>/g;
    const allowedTags = [
      '<p>',
      '</p>',
      '<ul>',
      '</ul>',
      '<strong>',
      '</strong>',
      '<b>',
      '</b>',
      '<br>',
      '</br>',
      '<ol>',
      '</ol>',
      '<li>',
      '</li>',
      '<em>',
      '</em>',
      '<i>',
      '</i>',
      '<br/>',
      '<h2>',
      '</h2>',
      '<h3>',
      '</h3>',
    ];

    const foundTags = inputString.match(htmlTagPattern);
    if (foundTags) {
      return foundTags.some(
        (tag) => !allowedTags.some((allowedTag) => tag.startsWith(allowedTag))
      );
    }
    return false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size / (1024 * 1024) > 10) {
        this.showError('Please upload an image under 10MB.');
        return;
      }
      this.prod.img = file;
    }
  }

  getImageUrl(): string {
    return this.prod.img ? URL.createObjectURL(this.prod.img) : '';
  }

  // async addProduct() {
  //   if (this.isAdding) return;

  //   if (!this.validateProduct()) return;

  //   const formData = new FormData();
  //   this.appendProductDataToForm(formData);

  //   this.isAdding = true;
  //   this.startBuildingMessages();

  //   try {
  //     const response = await this.productService
  //       .addProduct(formData)
  //       .toPromise();
  //     if (response?.success) {
  //       this.showSuccess('New Product Added Successfully');
  //       this.storeDataChange.emit([...this.storeData, response.data]);
  //       this.resetForm();
  //     } else {
  //       this.showError('Unable to add product');
  //     }
  //   } catch (error) {
  //     this.showError('Error adding product');
  //     console.error('Error adding product:', error);
  //   } finally {
  //     this.isAdding = false;
  //   }
  // }

  private validateProduct(): boolean {
    if (!this.prod.img) {
      this.showError('Please provide an image');
      return false;
    }

    if (this.prod.img.size / (1024 * 1024) > 10) {
      this.showError(
        'Please upload an image under 10MB for web compatibility.'
      );
      return false;
    }

    if (!this.validateRequiredFields()) {
      this.showError('Fill in all required fields');
      return false;
    }

    if (this.prod.price < 0) {
      this.showError('The price cannot be less than 0');
      return false;
    }

    if (this.containsUnwantedHtmlTags(this.prod.description)) {
      this.showError(
        'Invalid description. Only p, ul, ol, li, strong, b, br, em & i tags are allowed here'
      );
      return false;
    }

    return true;
  }

  private validateRequiredFields(): boolean {
    if (this.prod.subcategory === 'Vehicles') {
      return this.make !== '' && this.model !== '';
    }

    return (
      this.prod.description !== '' &&
      this.prod.name !== '' &&
      this.prod.category !== '' &&
      (this.prod.subcategory !== '' || this.prod.category === 'Other')
    );
  }

  private appendProductDataToForm(formData: FormData) {
    if (this.prod.subcategory === 'Vehicles') {
      this.prod.extras = { make: this.make, model: this.model };
      this.prod.name = `${this.make} ${this.model}`;
    }

    formData.append('img', this.prod.img as File);
    formData.append('description', this.prod.description);
    formData.append('name', this.prod.name);
    formData.append('category', this.prod.category);
    formData.append(
      'subcategory',
      this.prod.subcategory === 'Other' || this.prod.category === 'Other'
        ? this.otherSubCat
        : this.prod.subcategory
    );
    formData.append('extras', JSON.stringify(this.prod.extras));
    formData.append('price', this.prod.price.toString());
    formData.append('gender', this.prod.gender);
    formData.append('brand', this.prod.brand);
    formData.append('condition', this.prod.condition);
  }

  private startBuildingMessages() {
    setTimeout(() => (this.building = 'Building Product Page...'), 10000);
    setTimeout(() => (this.building = 'Almost There...'), 20000);
    setTimeout(() => (this.building = 'Just a few seconds left...'), 35000);
  }

  private resetForm() {
    this.prod = {
      img: null,
      name: '',
      category: '',
      subcategory: '',
      price: 0,
      gender: '',
      description: '',
      extras: {},
      brand: '',
      condition: '',
    };
    this.make = '';
    this.model = '';
    this.otherSubCat = '';
    const imageInput = document.getElementById(
      'image-select'
    ) as HTMLInputElement;
    if (imageInput) {
      imageInput.value = '';
    }
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  getSubcategories(): string[] {
    const category = this.categories.find(
      (cat) => cat.name === this.prod.category
    );
    return category ? [...category.subcategories, 'Other'] : [];
  }

  async addProduct() {
    if (this.isAdding) {
      return;
    }

    // Validate image
    if (!this.prod.img) {
      this.showError('Please provide an image');
      return;
    }

    if (this.prod.img.size / (1024 * 1024) > 10) {
      this.showError(
        'Please upload an image under 10MB for web compatibility.'
      );
      return;
    }

    // Validate required fields
    if (!this.validateRequiredFields()) {
      this.showError('Fill in all required fields');
      return;
    }

    // Validate price
    if (this.prod.price < 0) {
      this.showError('The price cannot be less than 0');
      return;
    }

    // Validate description HTML tags
    if (this.containsUnwantedHtmlTags(this.prod.description)) {
      this.showError(
        'Invalid description. Only p, ul, ol, li, strong, b, br, em & i tags are allowed here'
      );
      return;
    }

    // Start upload process
    this.isAdding = true;
    this.building = 'Uploading...';
    this.startBuildingMessages();

    const formData = new FormData();
    this.appendProductDataToForm(formData);

    try {
      const response = await this.productService
        .addProduct(formData)
        .toPromise();

      if (response?.success) {
        this.showSuccess('New Product Added Successfully');
        this.storeDataChange.emit([...this.storeData, response.data]);
        this.resetForm();
      } else {
        this.showError('Unable to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      this.showError('Unable to add product');
    } finally {
      this.isAdding = false;
    }
  }

  // Add to ProductService
  updateVehicleName() {
    if (this.prod.subcategory === 'Vehicles') {
      this.prod.name = `${this.make} ${this.model}`.trim();
    }
  }
}
