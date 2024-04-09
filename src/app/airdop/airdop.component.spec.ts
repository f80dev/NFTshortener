import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirdopComponent } from './airdop.component';

describe('AirdopComponent', () => {
  let component: AirdopComponent;
  let fixture: ComponentFixture<AirdopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirdopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AirdopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
