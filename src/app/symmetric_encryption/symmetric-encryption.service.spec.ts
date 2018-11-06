import { TestBed } from '@angular/core/testing';

import { SymmetricEncryptionService } from './symmetric-encryption.service';

describe('SymmetricEncryptionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SymmetricEncryptionService = TestBed.get(SymmetricEncryptionService);
    expect(service).toBeTruthy();
  });
});
