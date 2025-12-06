import { useState } from "#imports"; // Use Nuxt 3's composables
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import type { BottomAudioModel } from "~/types/bottomAudioModel";
import useBottomAudioPlayer from "~/composables/useBottomAudioPlayer";
import useFavorite from "./useFavorite";
import type { ProductGetModel } from "~/types/product-types";
import { PRODUCT_TYPES } from "~/utilities/constants";
import useUser from "./useUser";
export default function useSingleProduct() {
  const isPayButtonInLoading = ref<boolean>(false);
  const isDemoButtonInLoading = ref<boolean>(false);
  const isFavoriteButtonInLoading = ref<boolean>(false);
  const isFavorite = ref<boolean>(false);
  const isDemoLaunched = ref<boolean>(false);
  const {
    setCurrentAudio,
    bottomAudioComponentModel,
    isInDownloading,
    downloadedPrecent,
    playEpisode,
  } = useBottomAudioPlayer();
  const { addToFavorites, removeFromFavorites } = useFavorite();
  const { post, get } = useCustomFetch();
  const { isLogedIn } = useUser();
  const { showNotification } = useSnackNotification();

  async function getProduct(
    productType: string,
    id: number
  ): Promise<ProductGetModel | null> {
    try {
      const product = await get<ProductGetModel>(
        API_ENDPOINTS.product.getById(productType, id)
      );
      return product.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  function generatePaymentLink(id: number, type: string) {
    const isLogin = isLogedIn();
    if (isLogin) {
      isPayButtonInLoading.value = true;
      const payload = { productId: id, type: PRODUCT_TYPES[type].id };
      post(API_ENDPOINTS.order, payload).then((x) => {
        location.href = x.data.link;
      });
    } else showNotification("لطفا وارد حساب کاربری خود شوید.");
  }

  function launchDemo(product, contentType: string) {
    let audioModel: BottomAudioModel = {
      contentId: product?.id,
      episodeId: 0,
      nextEpisodeId: 0,
      previousEpisodeId: 0,
      contentType: contentType,
      contentTitle: product.name,
      episodeTitle: "نسخه نمونه",
      imageUrl: product.image,
      url: product.demo_path,
    };
    setCurrentAudio(audioModel);
  }
  const isLogin = isLogedIn();
  return {
    isPayButtonInLoading,
    isDemoButtonInLoading,
    launchDemo,
    addToFavorites,
    removeFromFavorites,
    isDemoLaunched,
    isFavoriteButtonInLoading,
    getProduct,
    isFavorite,
    generatePaymentLink,
    isLogin,
    bottomAudioComponentModel,
    playEpisode,
    isInDownloading,
  };
}
