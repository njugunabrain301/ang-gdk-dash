export interface ResponseTime {
  unit: 'hours' | 'days' | 'weeks' | 'months';
  amount: number;
}

export interface Profile {
  icon: string | File;
  name: string;
  phone: string;
  email: string;
  location: string;
  about: string;
  aboutDetailed: string;
  showPrice: boolean;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  google?: string;
  responseTime: ResponseTime;
  workingHours: string;
  type: string;
}
