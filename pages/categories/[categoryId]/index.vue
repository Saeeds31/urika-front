<template>
  <v-container>
    <div class="d-flex mb-5 justify-space-between align-center">
      <div class="d-flex align-end opacity-90">
        <h3
          v-motion-fade-visible
          :duration="1050"
          :delay="50"
          class="font-weight-black mr-1"
          v-if="pageTitle.length"
        >
          دسته بندی {{ pageTitle }}
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
          :productType="getTypeByTypeId(card.type)"
        ></ProductCard>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { PRODUCT_TYPES } from "~/utilities/constants";
export default {
  setup() {
    const { get, post } = useCustomFetch();
    const pageModel = reactive({ items: [] });
    const pageTitle = ref("");
    const route = useRoute();
    const categoryId = route.params.categoryId;
    const pageGetUrl = API_ENDPOINTS.categories.getById(categoryId);
    get(pageGetUrl).then((x) => {
      pageModel.items = reactive(x.data.items);
      pageTitle.value = x.data.name;
      useHead({
        title: `دسته بندی ` + pageTitle.value,
      });
    });
    function getTypeByTypeId(id) {
      for (const key in PRODUCT_TYPES) {
        if (PRODUCT_TYPES[key].id === id) {
          return PRODUCT_TYPES[key].typeName;
        }
      }
      return null; // Return null or an appropriate value if the ID is not found
    }

    return {
      pageTitle,
      pageModel,
      getTypeByTypeId,
    };
  },
};
</script>
