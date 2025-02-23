import { TestBed } from '@angular/core/testing';

import { PosInvoiceService } from './pos-invoice.service';

describe('PosInvoiceService', () => {
  let service: PosInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
