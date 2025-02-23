import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { isLoggedIn } from './guards/auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProductsComponent } from './pages/products/products.component';
import { PromotionsComponent } from './pages/promotions/promotions.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ThemesComponent } from './pages/themes/themes.component';
import { BillingComponent } from './pages/billing/billing.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'promotions', component: PromotionsComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'themes', component: ThemesComponent },
      { path: 'billing', component: BillingComponent },
    ],
    canActivate: [isLoggedIn],
  },
];
