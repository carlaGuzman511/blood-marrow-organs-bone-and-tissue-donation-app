import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { PublishRequestData, PublishRequestDialogComponent, deadlineValidator, donationTypeFor } from './publish-request-dialog.component';
import { DonationRequestService } from '../../services/donation-request.service';
import { DonationRequest } from '../../../models/DonationRequest';
import { aRequest } from '../../testing';
import { FormControl } from '@angular/forms';

describe('PublishRequestDialogComponent (US-WEB-05)', () => {
  let fixture: ComponentFixture<PublishRequestDialogComponent>;
  let component: PublishRequestDialogComponent;
  let create: jasmine.Spy;
  let response: Subject<DonationRequest>;
  let close: jasmine.Spy;

  const data: PublishRequestData = {
    sede: { id: 'sede-from-session', name: 'Hospital Viedma', access: 'clinical' },
    bloodTypes: [{ id: 'bt-1', name: 'O-', image: '' }],
    donationTypes: [
      { id: 'dt-blood', name: 'Sangre' } as never,
      { id: 'dt-marrow', name: 'Médula Ósea' } as never,
      { id: 'dt-kidney', name: 'Riñón' } as never,
    ],
  };

  function inTwoHours(): string {
    const d = new Date(Date.now() + 2 * 3600_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function fillValid() {
    component.form.patchValue({
      patientCode: 'PX-5819',
      medicalRecord: 'EXP-2024-1',
      urgency: 'CodeRed',
      deadline: inTwoHours(),
      component: 'PlateletsApheresis',
      unitsRequired: 4,
      bloodTypeId: 'bt-1',
      bed: 'UCI 08',
      coordinationPhone: '+591 4 4250000',
      description: 'Politraumatizado',
    });
    fixture.detectChanges();
  }

  beforeEach(() => {
    response = new Subject<DonationRequest>();
    create = jasmine.createSpy('create').and.returnValue(response);
    close = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [PublishRequestDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
        { provide: DonationRequestService, useValue: { create } },
      ],
    });
    fixture = TestBed.createComponent(PublishRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pre-fills the hospital from the session sede', () => {
    expect((fixture.nativeElement.querySelector('[data-testid="sede"]') as HTMLInputElement).value).toBe('Hospital Viedma');
  });

  it('shows inline errors and sends nothing while a required field is empty or invalid', () => {
    fillValid();
    component.form.patchValue({ coordinationPhone: 'abc', unitsRequired: 0 });
    component.publish();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#coordinationPhone-error')?.textContent).toContain('Teléfono no válido');
    expect(fixture.nativeElement.querySelector('#unitsRequired-error')?.textContent).toContain('Entre 1 y 100');
  });

  it('publishes for the session sede, never a hardcoded center, and closes on 201', () => {
    fillValid();
    component.publish();

    const body = create.calls.mostRecent().args[0];
    expect(body.donationCenterId).toBe('sede-from-session');
    expect(body.donationTypeId).toBe('dt-blood');
    expect(body.urgency).toBe('CodeRed');
    expect(body.unitsRequired).toBe(4);
    expect(body.deadline).toMatch(/Z$/);

    const created = aRequest();
    response.next(created);
    expect(close).toHaveBeenCalledWith(created);
  });

  it('on an API error stays open, keeps the data and shows the message', () => {
    fillValid();
    component.publish();
    response.error(new HttpErrorResponse({
      status: 400,
      error: { title: 'One or more validation errors occurred.', errors: { Deadline: ['La fecha limite no puede estar en el pasado'] } },
    }));
    fixture.detectChanges();

    expect(close).not.toHaveBeenCalled();
    expect(component.form.controls.patientCode.value).toBe('PX-5819');
    expect(fixture.nativeElement.querySelector('[data-testid="server-error"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#deadline-error')?.textContent).toContain('pasado');
  });

  it('asks for the organ when the component is an organ or tissue', () => {
    component.form.controls.component.setValue('OrganTissue');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#donationTypeId')).not.toBeNull();
    expect(component.organTypes().map((t) => t.id)).toEqual(['dt-kidney']);
  });

  it('maps components to the catalog types and checks the deadline window', () => {
    expect(donationTypeFor('BoneMarrow', data.donationTypes)?.id).toBe('dt-marrow');
    const validate = deadlineValidator(() => new Date('2026-10-26T10:00').getTime());
    expect(validate(new FormControl('2026-10-26T09:00'))).toEqual({ pastDeadline: true });
    expect(validate(new FormControl('2028-01-01T00:00'))).toEqual({ farDeadline: true });
    expect(validate(new FormControl('2026-10-27T10:00'))).toBeNull();
  });
});
