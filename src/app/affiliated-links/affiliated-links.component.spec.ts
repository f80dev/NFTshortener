import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliatedLinksComponent } from './affiliated-links.component';

describe('AffiliatedLinksComponent', () => {
  let component: AffiliatedLinksComponent;
  let fixture: ComponentFixture<AffiliatedLinksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffiliatedLinksComponent]
    });
    fixture = TestBed.createComponent(AffiliatedLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
