import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../../domain';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }


  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage', error);
        this.clearStorage();
      }
    }
  }


  login(email: string): Observable<LoginResponse> {
    return this.http.post<any>(`${this.API_URL}/users/login`, { email })
      .pipe(
        map(response => {
          console.log('Raw backend response:', response);
          if (response.data) {
            return response.data as LoginResponse;
          }
          return response as LoginResponse;
        }),
        tap(response => {
          console.log('Processed login response:', response);
          this.setSession(response);
        }),
        catchError(error => {
          console.error('Login error', error);
          throw error;
        })
      );
  }

  private setSession(response: LoginResponse): void {
    console.log('Setting session with token:', response.token);
    console.log('Setting session with user:', response.user);
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    console.log('Session set successfully');
  }


  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }


  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }


  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!this.getToken();
  }


  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
