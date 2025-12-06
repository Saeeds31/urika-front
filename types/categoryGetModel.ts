export interface CategoryGetModel {
  id: number;
  image: string;
  name: string;
  sort_order: string; // or number if you expect to treat it as a numerical value
}
