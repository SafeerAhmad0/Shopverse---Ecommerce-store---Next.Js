export type Product = {
  title: string;
  reviews: number;
  price: number;
  category: string;
  discountedPrice: number;
  id: number | string; // Support both number and string IDs
  color: string[];
  woodTypes: string[];
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  // Database fields
  image_url?: string;
  images?: string[];
  category_id?: string;
  description_en?: string;
  description_ar?: string;
  stock?: number;
  tags?: string[];
  specs?: string;
  features?: string;
  wood_types?: string[];
  colors?: string[];
  properties?: string;
};
