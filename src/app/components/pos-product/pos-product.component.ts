import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../interfaces/Product.interface';

@Component({
  selector: 'app-pos-product',
  standalone: true,
  templateUrl: './pos-product.component.html',
  // styleUrl: './pos-product.component.css'
  imports: [CommonModule, MatButtonModule],
  // template: `

  // `,
  styles: [],
})
export class PosProductComponent implements OnInit {
  @Input() product!: Product;
  @Output() addSelected = new EventEmitter<Product>();

  color: string = '-';
  size: string = '-';
  option: any = '-';
  price: number = 0;

  ngOnInit() {
    this.color = this.product.colors.length > 0 ? this.product.colors[0] : '-';
    this.size = this.product.sizes.length > 0 ? this.product.sizes[0] : '-';
    this.option =
      this.product.priceOptions.length > 0 ? this.product.priceOptions[0] : '-';
    this.updatePrice();
  }

  setColor(cl: string) {
    this.color = cl;
  }

  setSize(sz: string) {
    this.size = sz;
  }

  setOption(op: any) {
    this.option = op;
    this.updatePrice();
  }

  updatePrice() {
    if (this.option === '-') {
      this.price = this.product.price;
    } else {
      this.price = this.option.price;
    }
  }

  addItem() {
    const selectedProduct = {
      ...this.product,
      color: this.color,
      size: this.size,
      option: this.option.option,
      price: this.price,
    };
    this.addSelected.emit(selectedProduct);
  }
}
