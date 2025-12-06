<template>
  <v-container>
    <div class="d-flex mb-5 justify-space-between align-center">
      <div class="d-flex align-end opacity-90">
        <v-img
          v-motion-fade-visible
          :duration="1000"
          :delay="50"
          class="opacity-80"
          width="30"
          cover
          :src="pageIcon"
        ></v-img>
        <h3
          v-motion-fade-visible
          :duration="1050"
          :delay="50"
          class="font-weight-black mr-1"
        >
          {{ pageTitle }}
        </h3>
      </div>
    </div>
    <v-row dense>
      <v-col
        v-for="(card, index) in pageModel.items"
        :key="card.title"
        :cols="card.flex ?? 6"
        :xs="card.xs ?? 6"
        :sm="card.sm ?? 6"
        :lg="card.md ?? 2"
      >
        <ProductCard
          v-motion-fade-visible
          :duration="700"
          :delay="index * 150 + 100"
          :product="card"
          :productType="productType"
          :hideTypeTitle="true"
        ></ProductCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { PRODUCT_TYPES } from "~/utilities/constants";
export default {
  async setup() {
    const { get, post } = useCustomFetch();
    const pageModel = reactive({ items: [] });

    const route = useRoute();
    const productType = route.params.type;
    const pageTitle = PRODUCT_TYPES[productType].title;
    const pageIcon = PRODUCT_TYPES[productType].iconUrl;
    const pageGetUrl = API_ENDPOINTS[productType].get;
    await get(pageGetUrl).then((x) => {
      pageModel.items = reactive(x.data);
    });
    useHead({
      title: pageTitle,
    });
    return {
      pageTitle,
      pageIcon,
      pageModel,
      productType,
    };
  },
};
</script>
