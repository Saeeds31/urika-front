<style lang="scss">
#bottomSlides,
#middleSlides {
  box-shadow: 0px 2px 1px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
    0px 1px 1px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
    0px 1px 3px 0px var(--v-shadow-key-ambient-opacity, rgba(0, 0, 0, 0.12));
}
@media (max-width: 960px) {
  #topSlides,
  #middleSlides,
  #bottomSlides {
    .v-carousel {
      height: 25vh !important;
    }
  }
}
@media (min-width: 960px) {
  #topSlides,
  #middleSlides,
  #bottomSlides {
    .v-carousel {
      height: 40vh !important;
    }
  }
}
.v-slide-group__next,
.v-slide-group__prev {
  background: white;
  border-radius: 4px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  padding: 7px 0;
  transition: 1s;
  opacity: 0.9;
  top: 50%;
  transform: scale(0.7);
  z-index: 5;
}
.v-slide-group__content {
  padding: 10px 0;
}

.v-slide-group__next {
  position: absolute;
  left: -15px;
}

.v-slide-group__prev {
  position: absolute;
  right: -15px;
}
</style>
<template>
  <ImageSlider
    v-if="
      homeGetModel?.topBanners != null && homeGetModel?.topBanners?.length > 0
    "
    :slides="homeGetModel?.topBanners"
    carouselId="topSlides"
  ></ImageSlider>
  <VContainer>
    <div v-motion-fade :duration="1200" :delay="300" class="position-relative">
      <div class="d-flex mb-3 justify-space-between align-center">
        <div class="d-flex align-end opacity-90">
          <v-img
            class="opacity-80"
            width="30"
            cover
            :src="PRODUCT_TYPES.audiobooks.iconUrl"
          ></v-img>
          <h3 class="font-weight-black mr-1">
            {{ PRODUCT_TYPES.audiobooks.title }}
          </h3>
        </div>
        <NuxtLink
          to="/products/audiobooks"
          class="text-decoration-none opacity-60 text-small text-black"
        >
          <v-icon size="17">mdi-arrow-top-left-thick</v-icon>
          مشاهده همه
        </NuxtLink>
      </div>
      <v-slide-group v-model="cards" class="" center-active show-arrows icon>
        <v-slide-group-item v-for="card in homeGetModel.soundbooks">
          <ProductCard
            :product="card"
            className="mx-1"
            :isHome="true"
            :productType="PRODUCT_TYPES.audiobooks.typeName"
            :hideFavorite="true"
            whereRender="home"
            :hideTypeTitle="true"
          ></ProductCard>
        </v-slide-group-item>
      </v-slide-group>
    </div>

    <div
      v-motion-fade
      :duration="1200"
      :delay="600"
      class="position-relative mt-6"
    >
      <div class="d-flex mb-3 justify-space-between align-center">
        <div class="d-flex align-center opacity-90">
          <v-img width="30" cover :src="PRODUCT_TYPES.podcasts.iconUrl"></v-img>
          <h3 class="font-weight-black mr-1">
            {{ PRODUCT_TYPES.podcasts.title }}
          </h3>
        </div>
        <NuxtLink
          class="text-decoration-none opacity-60 text-small text-black"
          to="/products/podcasts"
        >
          <v-icon size="17">mdi-arrow-top-left-thick</v-icon>
          مشاهده همه
        </NuxtLink>
      </div>
      <v-slide-group v-model="cards" center-active show-arrows icon>
        <v-slide-group-item v-for="card in homeGetModel.podcasts">
          <ProductCard
            :product="card"
            className="mx-1"
            :isHome="true"
            :productType="PRODUCT_TYPES.podcasts.typeName"
            :hideFavorite="true"
            :hideTypeTitle="true"
            whereRender="home"
          ></ProductCard>
        </v-slide-group-item>
      </v-slide-group>
    </div>
    <div :duration="1200" :delay="1200">
      <ImageSlider
        v-if="
          homeGetModel?.middleBanners != null &&
          homeGetModel?.middleBanners?.length > 0
        "
        :slides="homeGetModel?.middleBanners"
        carouselId="middleSlides"
      ></ImageSlider>
    </div>
    <div
      v-motion-fade
      :duration="1200"
      :delay="1800"
      class="position-relative mt-6"
    >
      <div class="d-flex mb-3 justify-space-between align-center">
        <div class="d-flex align-center opacity-90">
          <v-img width="30" cover :src="PRODUCT_TYPES.ebooks.iconUrl"></v-img>
          <h3 class="font-weight-black mr-1">
            {{ PRODUCT_TYPES.ebooks.title }}
          </h3>
        </div>
        <NuxtLink
          class="text-decoration-none opacity-60 text-small text-black"
          to="/products/ebooks"
        >
          <v-icon size="17">mdi-arrow-top-left-thick</v-icon>
          مشاهده همه
        </NuxtLink>
      </div>
      <v-slide-group v-model="cards" center-active show-arrows icon>
        <v-slide-group-item v-for="card in homeGetModel.ebooks">
          <ProductCard
            :product="card"
            className="mx-1"
            :isHome="true"
            :productType="PRODUCT_TYPES.ebooks.typeName"
            :hideFavorite="true"
            :hideTypeTitle="true"
            whereRender="home"
          ></ProductCard>
        </v-slide-group-item>
      </v-slide-group>
    </div>
    <div :duration="1200" :delay="2400">
      <ImageSlider
        v-if="
          homeGetModel?.bottomBanners != null &&
          homeGetModel?.bottomBanners?.length > 0
        "
        :slides="homeGetModel?.bottomBanners"
        carouselId="bottomSlides"
      ></ImageSlider>
    </div>
  </VContainer>
</template>

<script lang="ts">
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { useCustomFetch } from "../composables/useCustomFetch";
import type { HomeGetModel } from "~/types/homeGetModel";
import { PRODUCT_TYPES } from "~/utilities/constants";
import { onMounted } from "vue";

export default {
  async setup() {
    let homeGetModel;
    const { get } = useCustomFetch();
    await get<HomeGetModel>(API_ENDPOINTS.home.get).then((x) => {
      homeGetModel = x.data != null ? reactive<HomeGetModel>(x.data) : null;
    });
    // const route = useRoute();
    const productType = "podcasts"; //route.params.type as string;
    const pageTitle = PRODUCT_TYPES[productType].title;
    const pageIcon = PRODUCT_TYPES[productType].iconUrl;
    const pageGetUrl = PRODUCT_TYPES[productType].getUrl;
    useHead({
      title: `صفحه نخست`,
    });
    return {
      pageTitle,
      homeGetModel,
      pageIcon,
      PRODUCT_TYPES,
    };
  },
};
</script>
