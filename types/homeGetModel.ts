interface Category {
  id: number;
  name: string;
  image: string;
}

// Define the Owner interface
interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

// Define the BaseContent interface to represent common properties of soundbooks, podcasts, and ebooks
interface BaseContent {
  id: number;
  name: string;
  category: Category;
  owner: Owner;
  image: string;
  price: string;
}

export interface HomeGetModel {
  topBanners: any[]; // Assuming the structure for banners is not provided
  middleBanners: any[]; // Assuming the structure for banners is not provided
  bottomBanners: any[]; // Assuming the structure for banners is not provided
  soundbooks: BaseContent[];
  podcasts: BaseContent[];
  ebooks: BaseContent[];
}
