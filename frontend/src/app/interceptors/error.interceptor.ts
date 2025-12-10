import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const messageService = inject(MessageService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Ocurrió un error desconocido';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Error: ${error.error.message}`;
            } else {
                // Server-side error
                if (error.status === 0) {
                    errorMessage = 'No se puede conectar con el servidor';
                } else {
                    errorMessage = error.error?.error || `Error ${error.status}: ${error.statusText}`;
                }
            }

            messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 5000
            });

            return throwError(() => error);
        })
    );
};
