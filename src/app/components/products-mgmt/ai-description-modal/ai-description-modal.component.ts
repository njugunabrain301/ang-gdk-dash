import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../../services/product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ai-description-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './ai-description-modal.component.html',
  styleUrls: ['./ai-description-modal.component.scss'],
})
export class AiDescriptionModalComponent {
  productId: string = '';
  AIResponse: string = '';
  instructions: string = '';
  generating: boolean = false;
  AIError: string = '';

  constructor(
    private productService: ProductService,
    public dialogRef: MatDialogRef<AiDescriptionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.AIResponse = data.description || '';
    this.productId = data.productId || '';
  }

  async fetchAIDesc() {
    if (this.generating) return;

    this.generating = true;
    this.AIError = '';

    try {
      // Call your AI service here
      const response: any = await this.productService
        .generateDescription({
          pid: this.productId,
          message: this.instructions,
          description: this.AIResponse,
        })
        .toPromise();
      console.log(response);
      this.AIResponse = response.data;
    } catch (error) {
      console.log(error);
      this.AIError = 'Error generating description';
    } finally {
      this.generating = false;
    }
  }

  containsUnwantedHtmlTags(text: string): boolean {
    const allowedTags = [
      '<p>',
      '<ul>',
      '<strong>',
      '<b>',
      '<br>',
      '<ol>',
      '<li>',
      '<em>',
      '<i>',
      '</p>',
      '</ul>',
      '</strong>',
      '</b>',
      '</br>',
      '</ol>',
      '</li>',
      '</em>',
      '</i>',
      '<br/>',
      '</h2>',
      '</h3>',
      '<h2>',
      '<h3>',
    ];

    const div = document.createElement('div');
    div.innerHTML = text;
    const tags = div.getElementsByTagName('*');

    for (let i = 0; i < tags.length; i++) {
      const tagName = tags[i].tagName.toLowerCase();
      if (!allowedTags.includes(`<${tagName}>`)) {
        return true;
      }
    }
    return false;
  }

  useDescription() {
    this.dialogRef.close(this.AIResponse);
  }

  close() {
    this.dialogRef.close();
  }
}
