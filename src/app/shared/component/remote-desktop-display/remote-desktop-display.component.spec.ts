import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteDesktopDisplayComponent } from './remote-desktop-display.component';

describe('RemoteDesktopDisplayComponent', () => {
  let component: RemoteDesktopDisplayComponent;
  let fixture: ComponentFixture<RemoteDesktopDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteDesktopDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteDesktopDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
