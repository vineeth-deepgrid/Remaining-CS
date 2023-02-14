import { TestBed } from '@angular/core/testing';

import { ChangeProjectonService } from './change-projecton.service';

describe('ChangeProjectonService', () => {
  let service: ChangeProjectonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeProjectonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
