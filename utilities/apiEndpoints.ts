import { PRODUCT_TYPES } from "./constants";

export const API_ENDPOINTS = {
  auth: {
    sendCode: "/auth/send-code",
    smsLogin: "/auth/login/sms",
    logout: "/auth/logout",
  },
  categories: {
    get: "/categories",
    getById: (id: number) => `/categories/${id}`,
  },
  ebooks: {
    get: "/ebooks",
    sendComment: (id: number) => `/ebooks/${id}/comments`,
    serv: (id: number) => `/ebooks/${id}/serv`,
  },
  favorites: {
    add: "/favorites/favorite",
    delete: "/favorites/un-favorite",
  },
  home: {
    get: "/home",
  },
  library: {
    get: "/library",
  },
  podcasts: {
    get: "/podcasts",
    studyTime: "/podcastsUpdatePlayTime",
    getById: (id: number) => `/podcasts/${id}`,
    sendComment: (id: number) => `/podcasts/${id}/comments`,
    getEpisode: (podcastId: number, episodId: number) =>
      `/podcasts/${podcastId}/episodes/${episodId}`,
  },
  product: {
    getById: (productType: string, id: number) =>
      `/${PRODUCT_TYPES[productType].typeNameInBack}/${id}`,
  },
  profile: {
    get: "/profile",
    save: "/profile",
    uploadAvatar: "/profile/upload-avatar ",
  },
  audiobooks: {
    get: "/soundbooks",
    studyTime: "/soundbooksUpdatePlayTime",
    getById: (id: number) => `/soundbooks/${id}`,
    sendComment: (id: number) => `/soundbooks/${id}/comments`,
    getEpisode: (podcastId: number, episodId: number) =>
      `/soundbooks/${podcastId}/episodes/${episodId}`,
  },
  search: "/search",
  order: "/orders/save",
  getFileToPlayData: "/playing",
};
