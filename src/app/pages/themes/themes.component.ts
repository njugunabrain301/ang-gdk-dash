import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TemplatesService, Template } from '../../services/templates.service';
import { TemplateComponent } from './template/template.component';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    TemplateComponent,
  ],
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss'],
})
export class ThemesComponent implements OnInit {
  templates: any[] = [];
  selectedTemplate: string = '';
  selectedTheme: string = '';
  holidayTheme: boolean = false;

  constructor(
    private templatesService: TemplatesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.templatesService.getTemplates().subscribe({
      next: (response) => {
        if (response.success) {
          this.templates = response.data.templates;
          this.selectedTemplate = response.data.selectedTemplate;
          this.selectedTheme = response.data.selectedTheme;
          this.holidayTheme = response.data.holidayTheme;
        }
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.showError('Failed to load templates');
      },
    });
  }

  toggleHolidayThemes(): void {
    this.templatesService.setHolidayTheme(!this.holidayTheme).subscribe({
      next: (response) => {
        if (response.success) {
          this.holidayTheme = response.data.holidayTheme;
          this.showSuccess('Successfully Updated Holiday Themes');
        } else {
          this.showError('Failed to update Holiday Themes');
        }
      },
      error: (error) => {
        console.error('Error toggling holiday theme:', error);
        this.showError('Failed to update Holiday Themes');
      },
    });
  }

  setSelectedTemplate(templateName: string): void {
    this.selectedTemplate = templateName;
  }

  setSelectedTheme(themeName: string): void {
    this.selectedTheme = themeName;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
