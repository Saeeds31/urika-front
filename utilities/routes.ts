export const ROUTES: any = {
  HOME: "/",
  MY_LIBRARY: "/mylibrary",
  MEMBER: {
    LOGIN: "/member/login",
    PROFILE: "/member/profile",
  },
  PRODUCTS: {
    INDEX: (type: string) => `/products/${type}/`,
    ITEM: (type: string, id: number) => `/products/${type}/${id}`,
  },
  CATEGORIES: {
    INDEX: "/categories",
    CATEGORY: (id: number) => `/categories/${id}/`,
  },
  SEARCH: "/search",
};
