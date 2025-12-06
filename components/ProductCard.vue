<template>
  <v-card
    :class="'product-card-item ' + className"
    @click="navigateTo(toUrl)"
    :width="whereRender == 'home' ? '175' : ''"
  >
    <div
      class="d-flex mb-3 justify-space-between align-center product-type-absolute"
      v-if="!hideTypeTitlePrivate"
    >
      <div class="d-flex align-end opacity-90">
        <v-img
          class="opacity-80"
          width="20"
          cover
          :src="PRODUCT_TYPES[productType].iconUrl"
        ></v-img>
        <p class="font-weight-black mr-1">
          {{ PRODUCT_TYPES[productType].title }}
        </p>
      </div>
    </div>
    <div
      class="position-absolute product-like-action"
      v-if="!hideFavoritePrivate"
    >
      <v-btn
        color="medium-emphasis"
        class="like-button"
        :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
        size="small"
        :loading="isFavoriteButtonInLoading"
        @click.stop="favorite"
      ></v-btn>
    </div>
    <v-img
      :src="product.image"
      class="align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.8)"
      height="175px"
      :width="whereRender == 'home' ? '175' : ''"
      cover
    >
      <template v-slot:placeholder>
        <v-skeleton-loader height="100%"></v-skeleton-loader>
      </template>
    </v-img>
    <v-card-title v-text="product.name"></v-card-title>
    <v-card-subtitle class="authar-name-holder text-black">
      {{ product?.owner?.first_name + " " + product?.owner?.last_name }}
    </v-card-subtitle>
  </v-card>
</template>

<script>
import { PRODUCT_TYPES } from "~/utilities/constants";
import { ROUTES } from "~/utilities/routes";
import colors from "vuetify/util/colors";
export default {
  props: [
    "product",
    "className",
    "productType",
    "hideFavorite",
    "hideTypeTitle",
    "whereRender",
  ],
  setup(props) {
    const hideFavoritePrivate = props.hideFavorite ?? false;
    const hideTypeTitlePrivate = props.hideTypeTitle ?? false;
    const toUrl = ROUTES.PRODUCTS.ITEM(props.productType, props.product.id);
    const { showNotification } = useSnackNotification();
    const { addToFavorites, removeFromFavorites } = useFavorite();

    const isFavoriteButtonInLoading = ref(false);
    const isFavorite = ref(props.product?.is_favorited);

    function favorite() {
      isFavoriteButtonInLoading.value = true;
      if (props.product) {
        if (isFavorite.value) {
          removeFromFavorites(props.product.id, props.productType)
            .then((x) => {
              if (x.status == "successful") {
                isFavorite.value = false;
                showNotification(
                  props.product.name + " " + "از کتابخانه شما حذف شد.",
                  "success"
                );
              } else {
                showNotification(x.messages ?? "", x.status ?? "error");
              }
            })
            .finally(() => (isFavoriteButtonInLoading.value = false));
        } else {
          addToFavorites(props.product.id, props.productType)
            .then((x) => {
              if (x.status == "successful") {
                isFavorite.value = true;
                showNotification(
                  props.product.name + " " + "به کتابخانه شما اضافه شد.",
                  "success"
                );
              } else {
                showNotification(x.messages ?? "", x.status ?? "error");
              }
            })
            .finally(() => (isFavoriteButtonInLoading.value = false));
        }
      }
    }

    return {
      toUrl,
      PRODUCT_TYPES,
      hideFavoritePrivate,
      hideTypeTitlePrivate,
      isFavoriteButtonInLoading,
      isFavorite,
      favorite,
    };
  },
};
</script>
<style>
.like-button i {
  color: rgb(var(--v-theme-primary));
}
</style>
