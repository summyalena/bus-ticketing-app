import { TestBed } from '@angular/core/testing';

import { HttpCallService } from './http-call.service';

describe('HttpCallService', () => {
  let service: HttpCallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpCallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
