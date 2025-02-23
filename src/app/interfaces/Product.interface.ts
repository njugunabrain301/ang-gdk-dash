export class Product2 {
  _id: string = '';
  img?: string;
  images?: {
    url: string;
    img: string;
    _id?: string;
  }[];
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  sizes: string[] = [];
  colors: string[] = [];
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
  priceOptions: {
    _id: string;
    option?: string;
    price?: number;
    default?: boolean;
  }[] = [];
  coupons?: {
    name?: string;
    discount?: number;
    default?: boolean;
  }[];
  reviews?: {
    name: string;
    comment?: string;
    rating: number;
    media?: {
      link?: string;
      type?: string;
    }[];
  }[];
  articles?: {
    type?: string;
    order?: number;
    content?: Record<string, any>;
    visibility?: boolean;
  }[];
  landingPages?: {
    name?: string;
    articles?: {
      type?: string;
      order?: number;
      content?: Record<string, any>;
      visibility?: boolean;
    }[];
    default?: boolean;
    miniHeader?: boolean;
  }[];
  showRelated?: boolean;
  hide?: boolean;
  showGoogle?: boolean;
  originalDescription?: string;
  affiliateVisibility?: string;
  commission?: number;
  building?: boolean;

  //selected product
  size?: string;
  color?: string;
  option?: string;
  amount: number = 1;
}

export interface Product {
  _id: string;
  originalId?: any;
  name: string;
  description: string;
  price: number;
  img: string | File;
  category: string;
  subcategory: string;
  gender: string;
  colors: string[];
  sizes: string[];
  amount: number; //selected
  color: string; //selected
  size: string; //selected
  option: string; //selected
  categories: string[];
  features: string[];
  extras: {
    make?: string;
    model?: string;
    [key: string]: any;
  };
  handlingTime: any;
  brand: string;
  condition: string;
  inStock: boolean;
  affiliateVisibility: string;
  commission: number;
  showRelated: boolean;
  showGoogle: boolean;
  hide: boolean;
  specs: ProductSpec[];
  faqs: ProductFaq[];
  USPs: string[];
  videoLink: string;
  priceOptions: PriceOption[];
  coupons: Coupon[];
  landingPages: LandingPage[];
  images: {
    img: any;
    _id?: string;
  }[];
  proSellers: {
    name: string;
    price: number;
    default: boolean;
  }[];
}

export interface ProductSpec {
  _id?: string;
  name: string;
  detail: string;
}

export interface ProductFaq {
  _id?: string;
  question: string;
  answer: string;
}

export interface PriceOption {
  _id?: string;
  option: string;
  price: number;
  default: boolean;
}

export interface Coupon {
  _id?: string;
  name: string;
  discount: number;
  default: boolean;
}

export interface LandingPage {
  name: string;
  articles: Article[];
  miniHeader?: boolean;
  default?: boolean;
}

export interface Article {
  _id?: string;
  type: string;
  order: number;
  content: any;
  visibility?: boolean;
}
