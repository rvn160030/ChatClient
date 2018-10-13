import { TestBed } from '@angular/core/testing';

import { TcpserviceService } from './tcpservice.service';

describe('TcpserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TcpserviceService = TestBed.get(TcpserviceService);
    expect(service).toBeTruthy();
  });
});
