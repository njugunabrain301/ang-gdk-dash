import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if the error is 401 (Unauthorized) or 403 (Forbidden)
      if (error.status === 401 || error.status === 403) {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Re-throw the error so other error handlers can process it
      return throwError(() => error);
    })
  );
};
