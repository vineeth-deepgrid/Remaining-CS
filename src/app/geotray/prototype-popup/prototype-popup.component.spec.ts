import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypePopupComponent } from './prototype-popup.component';

describe('PrototypePopupComponent', () => {
  let component: PrototypePopupComponent;
  let fixture: ComponentFixture<PrototypePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrototypePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrototypePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
