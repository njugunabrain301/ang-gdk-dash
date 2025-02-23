import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isSidebarOpen = true;
  businessName: string = '';
  businessLogo: string = '';
  isLargeScreen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: LoginService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.loadBusinessData();
    this.breakpointObserver
      .observe([Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.isLargeScreen = result.matches;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBusinessData() {
    const profileData = localStorage.getItem('profile');
    if (profileData) {
      const businessData = JSON.parse(profileData);
      this.businessName = businessData.name || 'Business Name';
      this.businessLogo = businessData.icon || 'default-logo-url';
    } else {
      console.warn('No business data found in local storage');
      this.businessName = 'Business Name';
      this.businessLogo = 'default-logo-url';
    }
  }

  toggleSidebar() {
    this.sidenav.toggle();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onNavItemClick() {
    if (!this.isLargeScreen) {
      this.sidenav.close();
    }
  }
}
