import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  const authIsAuthenticated = signal(false);
  const mockLogin = vi.fn();
  const mockSnackBarOpen = vi.fn();
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    authIsAuthenticated.set(false);
    mockLogin.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: AuthService,
          useValue: {
            login: mockLogin,
            isAuthenticated: authIsAuthenticated,
            isLoading: signal(false),
          },
        },
        { provide: MatSnackBar, useValue: { open: mockSnackBarOpen } },
      ],
    }).compileComponents();

    // Spy on the real Router's navigateByUrl after TestBed is configured
    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders email and password inputs', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('marks controls touched and does not call login when form is empty', async () => {
    await component.onSubmit();
    expect(component.form.controls.email.touched).toBe(true);
    expect(component.form.controls.password.touched).toBe(true);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls auth.login and navigates to /dashboard on valid submit', async () => {
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    await component.onSubmit();
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to the returnUrl query param after login when present', async () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.queryParamMap, 'get').mockReturnValue('/calendar');
    component.form.setValue({ email: 'test@example.com', password: 'password123' });
    await component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith('/calendar');
  });

  it('shows snackbar on login failure (generic error)', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    component.form.setValue({ email: 'test@example.com', password: 'wrongpass' });
    await component.onSubmit();
    expect(mockSnackBarOpen).toHaveBeenCalledWith(
      'Invalid credentials',
      'Dismiss',
      expect.objectContaining({ duration: 5000 })
    );
  });

  it('extracts API error message from HttpErrorResponse', async () => {
    mockLogin.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 401, error: { error: 'Invalid password' } })
    );
    component.form.setValue({ email: 'test@example.com', password: 'wrongpass' });
    await component.onSubmit();
    expect(mockSnackBarOpen).toHaveBeenCalledWith(
      'Invalid password',
      'Dismiss',
      expect.any(Object)
    );
  });

  it('redirects to /dashboard in ngOnInit if already authenticated', () => {
    authIsAuthenticated.set(true);
    const newFixture = TestBed.createComponent(LoginComponent);
    newFixture.detectChanges(); // triggers ngOnInit
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('isLoading is false after failed submit', async () => {
    mockLogin.mockRejectedValueOnce(new Error('oops'));
    component.form.setValue({ email: 'a@b.com', password: 'pass123' });
    await component.onSubmit();
    expect(component.isLoading()).toBe(false);
  });
});
