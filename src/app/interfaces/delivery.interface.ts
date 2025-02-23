export interface DeliveryLocation {
  _id: string;
  county: string;
  subcounty: string;
  courier: string;
  price: number;
  description: string;
  time: number;
  payOnDelivery: boolean;
}
