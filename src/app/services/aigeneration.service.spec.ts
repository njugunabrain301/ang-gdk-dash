import { TestBed } from '@angular/core/testing';

import { AIGenerationService } from './aigeneration.service';

describe('AIGenerationService', () => {
  let service: AIGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AIGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
