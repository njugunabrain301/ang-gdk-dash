export class ActiveProduct {
  _id?: string;
  img?: string;
  images?: { img?: string }[];
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  //selected product
  size?: string;
  color?: string;
  option?: string;
  amount: number = 1;

  gender?: string;
  price: number = 0;
  features?: any[];
  extras?: Record<string, any>;
  brand?: string;
  condition?: string;
  inStock?: boolean;
  handlingTime?: {
    unit?: string;
    amount?: number;
  };
  USPs?: string[];
  videoLink?: string;
  priceOptions?: {
    option?: string;
    price?: number;
    default?: boolean;
  }[];
  coupons?: {
    name?: string;
    discount?: number;
    default?: boolean;
  }[];
}
