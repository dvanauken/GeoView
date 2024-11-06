import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportTableComponent } from './airport-table.component';

describe('AirportTableComponent', () => {
  let component: AirportTableComponent;
  let fixture: ComponentFixture<AirportTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AirportTableComponent]
    });
    fixture = TestBed.createComponent(AirportTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
