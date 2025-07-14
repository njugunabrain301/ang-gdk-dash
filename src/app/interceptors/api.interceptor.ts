import {
  HttpEventType,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, tap, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token');
  const production = environment.production;

  console.log(production, 'Production env variable', environment);

  // Define URLs based on environment
  const primaryURL = production
    ? 'https://server.bunikasolutions.com/business/zidika'
    : 'http://localhost:3001/business/zidika';
  const backupURL = 'https://bunika.cyclic.app/business/zidika';

  // Function to create the request with a specific base URL
  const createRequest = (baseURL: string) => {
    return req.clone({
      url: `${baseURL}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Initial request with primary URL
  const modifiedReq = createRequest(primaryURL);

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt fallback in production and if error is 404, 503, or 504
      if (production && ![403, 401, 500].includes(error.status)) {
        console.log(
          `Primary server error ${error.status}, trying backup server...`
        );
        // Try backup server
        const backupReq = createRequest(backupURL);
        return next(backupReq);
      }
      // If not in production or different error, just throw the error
      return throwError(() => error);
    }),
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        if (event.status === 200 && localStorage.getItem('token')) {
          const expiryTime = new Date();
          expiryTime.setHours(expiryTime.getHours() + 24);
          localStorage.setItem('tokenExpiry', expiryTime.toISOString());
        }
      }
    })
  );
};
