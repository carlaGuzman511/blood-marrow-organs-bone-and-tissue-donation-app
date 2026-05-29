import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationCenterComponent } from './donation-center.component';

describe('DonationCenterComponent', () => {
  let component: DonationCenterComponent;
  let fixture: ComponentFixture<DonationCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
