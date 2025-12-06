import { type } from "../.nuxt/types/imports";
interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Episode {
  id: number;
  title: string;
  description: string;
  time: number;
  can_listen: boolean;
  is_favorited: boolean;
  created_at: string;
  type: number;
  pdf_path: string;
}

export interface ProductGetModel {
  id: number;
  owner: Owner;
  category: Category;
  name: string;
  image: string;
  description: string;
  demo_path: string;
  price: string;
  total_time: number;
  comments: any[];
  is_favorited: boolean;
  is_bought: boolean;
  episodes: Episode[];
  total_page: string;
  type: number;
  origina_file: string;
}
