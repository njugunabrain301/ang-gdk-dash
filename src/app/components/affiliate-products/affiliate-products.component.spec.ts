import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateProductsComponent } from './affiliate-products.component';

describe('AffiliateProductsComponent', () => {
  let component: AffiliateProductsComponent;
  let fixture: ComponentFixture<AffiliateProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffiliateProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffiliateProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
