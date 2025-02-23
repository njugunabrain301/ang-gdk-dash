import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiDescriptionModalComponent } from './ai-description-modal.component';

describe('AiDescriptionModalComponent', () => {
  let component: AiDescriptionModalComponent;
  let fixture: ComponentFixture<AiDescriptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiDescriptionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiDescriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
