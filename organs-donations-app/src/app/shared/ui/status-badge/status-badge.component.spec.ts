import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalTone, StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  function render(tone: ClinicalTone, label: string): HTMLElement {
    fixture.componentRef.setInput('tone', tone);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.vd-badge');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusBadgeComponent] });
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('shows the label as text and a decorative icon', () => {
    const badge = render('urgent', 'Urgente');
    expect(badge.textContent).toContain('Urgente');
    expect(badge.querySelector('.material-icons')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses the tone class of the design system', () => {
    expect(render('viable', 'Viable').classList).toContain('vd-badge--viable');
    expect(render('observation', 'En observacion').classList).toContain('vd-badge--observation');
  });

  // Green = viable/confirmed, red = urgent, amber = observation (computed from tokens.css).
  it('maps tones to the clinical colors', () => {
    const colorOf = (tone: ClinicalTone) => getComputedStyle(render(tone, tone)).color;
    expect(colorOf('viable')).toBe('rgb(4, 120, 87)');
    expect(colorOf('urgent')).toBe('rgb(190, 18, 60)');
    expect(colorOf('observation')).toBe('rgb(180, 83, 9)');
  });
});
