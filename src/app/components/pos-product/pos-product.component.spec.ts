import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosProductComponent } from './pos-product.component';

describe('PosProductComponent', () => {
  let component: PosProductComponent;
  let fixture: ComponentFixture<PosProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
