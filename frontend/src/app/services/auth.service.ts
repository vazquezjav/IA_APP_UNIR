import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user && user.role === 'admin';
  }

  getUser(): any {
    return this.userSubject.value;
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Admin Methods
  getLoginHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`);
  }

  getFlightsLastHour(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/last-hour`);
  }

  downloadReport(): void {
    window.open(`${this.apiUrl}/report/excel`, '_blank');
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, userData).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        }
      })
    );
  }
}
