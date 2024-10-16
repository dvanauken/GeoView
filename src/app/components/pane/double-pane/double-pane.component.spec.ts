import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoublePaneComponent } from './double-pane.component';

describe('DoublePaneComponent', () => {
  let component: DoublePaneComponent;
  let fixture: ComponentFixture<DoublePaneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoublePaneComponent]
    });
    fixture = TestBed.createComponent(DoublePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
