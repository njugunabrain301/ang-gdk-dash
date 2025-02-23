export interface OrderReviewMedia {
  link: string;
  type: string;
}

export interface OrderReview {
  submitted: boolean;
  comment: string;
  rating: number;
  media: OrderReviewMedia[];
}

export interface OrderItem {
  img: string;
  name: string;
  description: string;
  size: string;
  color: string;
  gender: string;
  selectedOption: string;
  price: number;
  amount: number;
  pid: string;
  reviewed: boolean;
}

export interface POSInvoice {
  name: string;
  phone: string;
  email: string;
  total: number;
  paymentCode: string;
  date: string;
  county: string;
  subcounty: string;
  courier: string;
  arrivalDate: string;
  delivered: boolean;
  requestReview: boolean;
  pickupDescription: string;
  paymentMode: string;
  status: string;
  review: OrderReview;
  items: OrderItem[];
}
