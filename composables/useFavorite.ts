// File: composables/useItemList.ts
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { useCustomFetch } from "#imports";
import { PRODUCT_TYPES } from "~/utilities/constants";
import { ApiResponse } from "../types/apiResponseModel";
export default function useFavorite() {
  const { post } = useCustomFetch();
  const { showNotification } = useSnackNotification();
  const { isLogedIn } = useUser();

  function addOrRemoveFromFavorite(
    id: number,
    type: string,
    addOrRemove = "add"
  ) {
    const isLogin = isLogedIn();
    if (isLogin) {
      let payload = { id: id, type: PRODUCT_TYPES[type].id };
      return post(
        addOrRemove == "add"
          ? API_ENDPOINTS.favorites.add
          : API_ENDPOINTS.favorites.delete,
        payload
      );
    } else {
      return new Promise((reject) => {
        reject({
          messages: "لطفا وارد حساب کاربری خود شوید.",
        });
      });
    }
  }
  function addToFavorites(id: number, type: string) {
    return addOrRemoveFromFavorite(id, type, "add");
  }
  function removeFromFavorites(id: number, type: string) {
    return addOrRemoveFromFavorite(id, type, "remove");
  }

  return { addToFavorites, removeFromFavorites };
}
