import { TestBed } from '@angular/core/testing';

import { RemoteDesktopManagerService } from './remote-desktop-manager.service';

describe('RemoteDesktopManagerService', () => {
  let service: RemoteDesktopManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteDesktopManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
