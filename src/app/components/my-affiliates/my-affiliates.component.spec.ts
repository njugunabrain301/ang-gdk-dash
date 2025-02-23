import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAffiliatesComponent } from './my-affiliates.component';

describe('MyAffiliatesComponent', () => {
  let component: MyAffiliatesComponent;
  let fixture: ComponentFixture<MyAffiliatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAffiliatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAffiliatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
