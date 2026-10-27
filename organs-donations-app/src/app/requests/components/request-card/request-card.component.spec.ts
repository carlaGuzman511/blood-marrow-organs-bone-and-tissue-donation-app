import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestCardComponent } from './request-card.component';
import { toCardView } from '../../request-view';
import { aRequest } from '../../testing';

describe('RequestCardComponent (US-WEB-02)', () => {
  let fixture: ComponentFixture<RequestCardComponent>;
  const text = (id: string) => (fixture.nativeElement.querySelector(`[data-testid="${id}"]`) as HTMLElement | null)?.textContent?.trim();

  function render(overrides = {}, now = 1_000_000) {
    fixture.componentRef.setInput('request', toCardView(aRequest(overrides), 1_000_000));
    fixture.componentRef.setInput('now', now);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RequestCardComponent], });
    fixture = TestBed.createComponent(RequestCardComponent);
  });

  it('shows folio, ABO/Rh, patient, service and bed, component, units and urgency', () => {
    render();
    expect(text('folio')).toBe('REQ-8902');
    expect(text('blood-type')).toBe('O-');
    expect(text('patient')).toBe('Paciente #PX-4912');
    expect(fixture.nativeElement.textContent).toContain('Quirófano Central 3');
    expect(text('location')).toContain('Cama UCI-04');
    expect(text('component')).toBe('Plaquetas Aféresis');
    expect(text('units')).toBe('1 de 4 Unidades');
    expect(text('urgency')).toContain('Código Rojo');
  });

  it('Código Rojo shows a live countdown and the urgency treatment', () => {
    render({}, 1_000_000 + 5 * 60_000);
    expect(text('countdown')).toBe('30m rest.');
    expect((fixture.nativeElement.querySelector('article') as HTMLElement).classList).toContain('card--code-red');
  });

  it('a Prioritario request has no countdown until it is overdue', () => {
    render({ urgency: 'Priority', remainingSeconds: 18 * 3600 });
    expect(text('countdown')).toBeUndefined();
    render({ urgency: 'Priority', remainingSeconds: -120 });
    expect(text('countdown')).toBe('Vencida hace 2m');
  });

  it('offers only the phases the API allows', () => {
    render({ allowedNextStatuses: [] });
    expect(fixture.nativeElement.querySelector('.move')).toBeNull();
    render();
    expect(fixture.nativeElement.querySelector('.move')).not.toBeNull();
  });
});
