import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoFormModalComponent } from './info-form-modal.component';

describe('InfoFormModalComponent', () => {
  let component: InfoFormModalComponent;
  let fixture: ComponentFixture<InfoFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
