import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, catchError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((res) => {
              isRefreshing = false;
              refreshTokenSubject.next(res.token);
              return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.token}` } }));
            }),
            catchError(err => {
              isRefreshing = false;
              authService.logout();
              router.navigate(['/auth/login']);
              return throwError(() => err);
            })
          );
        }

        return refreshTokenSubject.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(token => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
        );
      }

      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
