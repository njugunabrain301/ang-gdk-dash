export interface DeliveryLocation {
  county: string;
  courier: string;
  description: string;
  endpoint: string;
  nextday: boolean;
  payOnDelivery: boolean;
  price: string;
  sameday: boolean;
  subcounty: string;
  time: number;
  weightLimit: number;
  _id: string;
}

export interface HandlingTime {
  amount: number;
  unit: string;
}

export interface ShippingConfig {
  accept: boolean;
  businessId: string;
  cutoffTime: string;
  earliestShipTime: string;
  guaranteeCourier: boolean;
  handlingTime: HandlingTime;
  handlingType: string;
  __v: number;
  _id: string;
}

export interface CheckoutInfo {
  deliveryLocation: DeliveryLocation[];
  paymentOptions: any; // You might want to define a specific type instead of 'any'
  shipping: ShippingConfig;
}
