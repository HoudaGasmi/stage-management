import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notif = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip auth errors (handled by authInterceptor)
      if (error.status === 401) return throwError(() => error);

      let message = 'Une erreur est survenue.';
      if (error.error?.error) message = error.error.error;
      else if (error.status === 403) message = 'Accès non autorisé.';
      else if (error.status === 404) message = 'Ressource non trouvée.';
      else if (error.status === 0) message = 'Serveur inaccessible. Vérifiez votre connexion.';

      if (error.status !== 400) {
        // Only show global errors for non-validation errors
        notif.error(message);
      }

      return throwError(() => error);
    })
  );
};
