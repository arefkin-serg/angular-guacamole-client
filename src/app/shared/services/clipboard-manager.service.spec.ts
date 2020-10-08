import { TestBed } from '@angular/core/testing';

import { ClipboardManagerService } from './clipboard-manager.service';

describe('ClipboardManagerService', () => {
  let service: ClipboardManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClipboardManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
