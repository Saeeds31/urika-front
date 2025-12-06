<template>
  <v-container>
    <div class="d-flex justify-space-between align-center">
      <h2 v-motion-fade :duration="1200" class="font-weight-black">
        کتابخانه من
      </h2>
      <div class="d-flex g-2">
        <p
          v-motion-fade
          :duration="750"
          :delay="300"
          @click="setItems('ordered')"
          :class="{ active: tab == 'ordered' }"
        >
          خرید شده
        </p>
        <p
          v-motion-fade
          :duration="750"
          :delay="600"
          @click="setItems('liked')"
          :class="{ active: tab == 'liked' }"
        >
          لایک شده
        </p>
      </div>
    </div>
    <div class="content" v-motion-fade :duration="750" :delay="1200">
      <div class="items mt-5" v-if="content.items.length > 0">
        <v-row dense>
          <v-col
            v-for="(card, index) in content.items"
            :key="card.title"
            :cols="card.flex ?? 6"
          >
            <ProductCard
              v-motion-fade-visible
              :duration="700"
              :delay="index * 150 + 100"
              :product="card"
              :productType="getTypeByTypeId(card.type)"
              :hideFavorite="true"
            ></ProductCard>
          </v-col>
        </v-row>
      </div>
      <div v-else class="d-flex justify-center align-center empty">
        <div class="text-center">
          <v-icon class="opacity-60 mb-2" size="50">mdi-sticker-emoji</v-icon>
          <p>هنوز هیچ ایتمی اینجا وجود ندارد.</p>
        </div>
      </div>
    </div>
  </v-container>
</template>
<script>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { PRODUCT_TYPES } from "~/utilities/constants";

definePageMeta({
  middleware: "auth",
});
export default {
  async setup() {
    const { get } = useCustomFetch();
    const content = reactive({ items: [] });
    function getTypeByTypeId(id) {
      for (const key in PRODUCT_TYPES) {
        if (PRODUCT_TYPES[key].id === id) {
          return PRODUCT_TYPES[key].typeName;
        }
      }
      return null; // Return null or an appropriate value if the ID is not found
    }
    function setItems(whichOne) {
      if (whichOne == "ordered") {
        tab.value = "ordered";
        content.items = pageModel.data.buyed;
      } else {
        tab.value = "liked";
        content.items = pageModel.data.favorites;
      }
    }
    let pageModel = await get(API_ENDPOINTS.library.get);
    content.items = pageModel.data.buyed;
    const tab = ref("ordered");
    useHead({
      title: `کتابخانه من`,
    });
    return {
      PRODUCT_TYPES,
      tab,
      content,
      setItems,
      getTypeByTypeId,
      PRODUCT_TYPES,
    };
  },
};
</script>
<style scoped>
.g-2 {
  gap: 1rem;
  p {
    opacity: 0.5;
    transition: 1s;
    height: 32px;
    cursor: pointer;
    &.active {
      opacity: 1;
      border-bottom: 3px solid rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-primary));
    }
  }
}
.empty {
  height: 50vh;
}
</style>
