import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TemplatesService } from '../../../services/templates.service';

interface Theme {
  name: string;
  img: string;
}

interface TemplateData {
  name: string;
  themes: Theme[];
  preview?: string;
}

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent implements OnInit {
  @Input() template!: any;
  @Input() selectedTheme: string = '';
  @Input() selectedTemplate: string = '';
  @Output() templateSelected = new EventEmitter<string>();
  @Output() themeSelected = new EventEmitter<string>();

  currentImage: string = '';
  selectedThemeObj: Theme | null = null;
  applying: boolean = false;

  constructor(private templatesService: TemplatesService) {}

  ngOnInit(): void {
    if (this.template.themes.length > 0) {
      this.currentImage = this.template.themes[0].img;
      this.selectedThemeObj = this.template.themes[0];
    }

    // Set initial selected theme if it matches
    this.template.themes.forEach((theme: any) => {
      if (
        theme.name === this.selectedTheme &&
        this.template.name === this.selectedTemplate
      ) {
        this.select(theme);
      }
    });
  }

  select(theme: Theme): void {
    this.selectedThemeObj = theme;
    this.currentImage = theme.img;
  }

  applyTemplate(): void {
    if (!this.selectedThemeObj) return;

    this.applying = true;
    this.templatesService
      .updateSelectedTemplate({
        template: this.template.name,
        theme: this.selectedThemeObj.name,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.templateSelected.emit(response.data.selectedTemplate);
            this.themeSelected.emit(response.data.selectedTheme);
          }
          this.applying = false;
        },
        error: (error) => {
          console.error('Error applying template:', error);
          this.applying = false;
        },
      });
  }

  isThemeSelected(theme: Theme): boolean {
    return theme.img === this.currentImage;
  }

  isTemplateApplied(): boolean {
    return (
      this.selectedTemplate === this.template.name &&
      this.selectedTheme === this.selectedThemeObj?.name
    );
  }
}
