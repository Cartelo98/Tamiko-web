import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  UpdatePasswordState,
  AuthForgotPasswordState,
  AuthStateModal,
  AuthUserState,
  AuthVerifyOTPState,
  RegisterModal,
  AuthNumberLoginState,
  AuthVerifyNumberOTPState
} from '../interface/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public redirectUrl: string | undefined;
  public confirmed: boolean = false;
  public isLogin: boolean = false;

  private apiUrl = environment.baseURL; // Base URL from the environment file

  constructor(private http: HttpClient) { }

  /**
   * Register a new user
   */
  register(user: RegisterModal): Observable<AuthStateModal> {
    return this.http.post<AuthStateModal>(`${this.apiUrl}/auth/register`, user);
  }

  /**
   * Login with email and password
   */
  loginWithEmail(credentials: AuthUserState): Observable<AuthStateModal> {
    return this.http.post<AuthStateModal>(`${this.apiUrl}/auth/login/email`, credentials);
  }

  /**
   * Login with phone number and OTP
   */
  loginWithPhoneNumber(credentials: AuthNumberLoginState): Observable<AuthVerifyNumberOTPState> {
    return this.http.post<AuthVerifyNumberOTPState>(`${this.apiUrl}/auth/login/phone`, credentials);
  }

  /**
   * Send OTP to the provided phone number
   */
  sendOTP(phone: string): Observable<AuthVerifyOTPState> {
    return this.http.post<AuthVerifyOTPState>(`${this.apiUrl}/auth/send-otp`, { phone });
  }

  /**
   * Verify the OTP sent to the phone number
   */
  verifyPhoneOTP(otp: string, phone: string): Observable<AuthVerifyOTPState> {
    return this.http.post<AuthVerifyOTPState>(`${this.apiUrl}/auth/verify-otp`, { otp, phone });
  }

  /**
   * Verify the OTP sent to the email
   */
  verifyEmailOTP(otp: string, email: string): Observable<AuthVerifyOTPState> {
    return this.http.post<AuthVerifyOTPState>(`${this.apiUrl}/auth/verify-email-otp`, { otp, email });
  }

  /**
   * Forgot password - send reset link to email
   */
  forgotPassword(email: string): Observable<AuthForgotPasswordState> {
    return this.http.post<AuthForgotPasswordState>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Update the password after successful OTP verification
   */
  updatePassword(passwordData: UpdatePasswordState): Observable<AuthStateModal> {
    return this.http.post<AuthStateModal>(`${this.apiUrl}/auth/update-password`, passwordData);
  }

  /**
   * Logout the user from the application
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  /**
   * Check if the user is authenticated by checking the local storage for a token
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false otherwise
  }

  /**
   * Get the user's profile by sending the token in the Authorization header
   */
  getProfile(): Observable<AuthUserState> {
    const token = localStorage.getItem('token');
    return this.http.get<AuthUserState>(`${this.apiUrl}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  /**
   * Refresh the access token using the refresh token
   */
  refreshAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/auth/refresh-token`, { refreshToken });
  }

}
