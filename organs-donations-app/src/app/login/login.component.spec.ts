import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ACCESS_COPY, LoginComponent } from './login.component';
import { AuthService } from '../auth/auth.service';
import { HomeService } from '../services/home.service';
import { SessionSedeService } from '../auth/session-sede.service';

describe('LoginComponent (US-WEB-01)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let auth: { isLoggedIn: ReturnType<typeof signal<boolean>>; canUsePortal: ReturnType<typeof signal<boolean>>; login: jasmine.Spy };
  const centers = [
    { id: 'c-1', name: 'Hospital Viedma', address: '', image: '', city: 'Cochabamba', latitude: 0, longitude: 0 },
    { id: 'c-2', name: 'Banco de Sangre Central', address: '', image: '', city: 'La Paz', latitude: 0, longitude: 0 },
  ];

  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const submit = () => el('[data-testid="submit"]') as HTMLButtonElement;

  function create(loggedIn = false) {
    sessionStorage.clear();
    auth = { isLoggedIn: signal(loggedIn), canUsePortal: signal(true), login: jasmine.createSpy('login') };
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
        { provide: HomeService, useValue: { searchDonationCenters: () => of({ items: centers, totalCount: 2, page: 1, pageSize: 100 }) } },
      ],
    });
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  }

  function pickSede(id: string) {
    const select = el('#sede-select') as HTMLSelectElement;
    select.value = id;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('lists the sedes from the API', () => {
    create();
    const options = Array.from((el('#sede-select') as HTMLSelectElement).options).map((o) => o.textContent?.trim());
    expect(options).toContain('Hospital Viedma');
    expect(fixture.nativeElement.textContent).toContain('2 centros conectados');
  });

  it('changes the button text and email placeholder with the role tab', () => {
    create();
    expect(submit().textContent).toContain(ACCESS_COPY.clinical.submit);
    expect((el('#email') as HTMLInputElement).placeholder).toBe(ACCESS_COPY.clinical.emailPlaceholder);

    (fixture.nativeElement.querySelectorAll('[role="tab"]')[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(submit().textContent).toContain(ACCESS_COPY.admin.submit);
    expect((el('#email') as HTMLInputElement).placeholder).toBe(ACCESS_COPY.admin.emailPlaceholder);
  });

  it('keeps the button disabled with a "required" message until a sede is chosen', () => {
    create();
    expect(submit().disabled).toBeTrue();
    expect(el('[data-testid="sede-required"]').textContent).toContain('Campo requerido');

    pickSede('c-1');

    expect(submit().disabled).toBeFalse();
    expect(el('[data-testid="sede-required"]')).toBeNull();
  });

  it('starts the Keycloak PKCE login with the chosen sede and the email as hint', () => {
    create();
    pickSede('c-2');
    const email = el('#email') as HTMLInputElement;
    email.value = 'doctor@hospital.org';
    email.dispatchEvent(new Event('input'));
    submit().click();

    expect(auth.login).toHaveBeenCalledWith({
      sede: { id: 'c-2', name: 'Banco de Sangre Central', access: 'clinical' },
      email: 'doctor@hospital.org',
      google: false,
    });
  });

  it('"Continuar con Google Workspace" goes through the Google identity provider', () => {
    create();
    pickSede('c-1');
    (el('.google-button') as HTMLButtonElement).click();
    expect(auth.login).toHaveBeenCalledWith(jasmine.objectContaining({ google: true }));
  });

  it('sends volunteer donors to the DonaVida app, not to the portal', () => {
    create();
    const link = el('[data-testid="donor-link"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/donantes');
  });

  it('signed in without a sede: only picks the sede, without signing in again', () => {
    create(true);
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl');
    expect(el('.google-button')).toBeNull();
    pickSede('c-1');
    submit().click();

    expect(auth.login).not.toHaveBeenCalled();
    expect(TestBed.inject(SessionSedeService).sede()?.id).toBe('c-1');
    expect(navigate).toHaveBeenCalledWith('/solicitudes');
  });
});
