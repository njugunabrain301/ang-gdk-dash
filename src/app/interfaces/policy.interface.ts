export interface PolicyReturns {
  accept: boolean;
  refundPurchaseShipping: boolean;
  refundReturnShipping: boolean;
  replace: boolean;
  cashRefund: boolean;
  raiseTimeline: {
    unit: string;
    amount: number;
  };

  refundTimeline: {
    unit: string;
    amount: number;
  };
  eligibility: string[];
}

export interface PolicyShipping {
  accept: boolean;
  cutoffTime: string;
  earliestShipTime: string;
  guaranteeCourier: boolean;
  handlingType: 'constant' | 'custom';
  handlingTime: {
    unit: 'hours' | 'days' | 'weeks';
    amount: number;
  };
}
