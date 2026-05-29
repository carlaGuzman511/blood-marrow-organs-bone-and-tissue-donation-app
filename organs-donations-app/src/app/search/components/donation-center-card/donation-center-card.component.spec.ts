import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationCenterCardComponent } from './donation-center-card.component';

describe('DonationCenterCardComponent', () => {
  let component: DonationCenterCardComponent;
  let fixture: ComponentFixture<DonationCenterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationCenterCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationCenterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
