import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('token');

  // Determine the base URL based on the environment
  const apiUrl = environment.apiUrl;

  // Clone the request and update the URL
  let modifiedReq = req.clone({
    url: `${apiUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`,
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(modifiedReq).pipe(
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
