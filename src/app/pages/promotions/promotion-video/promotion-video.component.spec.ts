import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionVideoComponent } from './promotion-video.component';

describe('PromotionVideoComponent', () => {
  let component: PromotionVideoComponent;
  let fixture: ComponentFixture<PromotionVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotionVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromotionVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
