import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMgmtComponent } from './products-mgmt.component';

describe('ProductMgmtComponent', () => {
  let component: ProductMgmtComponent;
  let fixture: ComponentFixture<ProductMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductMgmtComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
