import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        // Check if route requires admin role
        if (route.data && route.data['role'] === 'admin') {
            if (authService.isAdmin()) {
                return true;
            } else {
                // User is logged in but not admin
                router.navigate(['/']);
                return false;
            }
        }
        return true;
    }

    // Not logged in
    router.navigate(['/login']);
    return false;
};
