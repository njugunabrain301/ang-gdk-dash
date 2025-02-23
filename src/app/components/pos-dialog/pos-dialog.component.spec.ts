import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosDialogComponent } from './pos-dialog.component';

describe('PosDialogComponent', () => {
  let component: PosDialogComponent;
  let fixture: ComponentFixture<PosDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
