import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionTagsComponent } from './promotion-tags.component';

describe('PromotionTagsComponent', () => {
  let component: PromotionTagsComponent;
  let fixture: ComponentFixture<PromotionTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
