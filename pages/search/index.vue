<template>
  <v-container>
    <h3 v-motion-fade :duration="1200" class="font-weight-black mb-3">
      جستجو در یوریکا
    </h3>
    <div class="search-box" v-motion-fade :duration="1200" :delay="600">
      <v-text-field
        :loading="isSearchTextInLoading"
        append-inner-icon="mdi-magnify"
        density="compact"
        label="نام کتاب یا نام نویسنده (حداقل سه کارکتر) ..."
        variant="solo"
        hide-details
        single-line
        @click:append-inner="onClick"
        v-model="searchText"
        v-on:keyup="trySearch"
      ></v-text-field>
    </div>
    <div v-if="isSearched">
      <p class="mt-5">
        نتایج جستجو برای‌:
        <strong class="font-weight-black">{{ searchText }}</strong>
      </p>
      <div class="search-result mt-3" v-if="pageModel?.items.length">
        <v-row dense>
          <v-col
            v-for="(card, index) in pageModel?.items"
            :key="card.title"
            :cols="card.flex ?? 6"
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
      </div>
      <v-empty-state
        v-else
        class="mt-5"
        icon="mdi-magnify"
        text="جستجوی شما نتیجه ای در پی نداشت درصورت نیاز میتوانید مجددا تلاش کنید."
        title="هیچ نتیجه ای یافت نشد!"
      ></v-empty-state>
    </div>
  </v-container>
</template>
<script>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { PRODUCT_TYPES } from "~/utilities/constants";

export default {
  async setup() {
    const { post } = useCustomFetch();
    const isSearchTextInLoading = ref(false);
    const pageModel = reactive({ items: [] });
    const isSearched = ref(false);
    const searchText = ref("");
    let latestSearchedText = "";
    let searchTimeout;
    async function search() {
      isSearchTextInLoading.value = true;
      let payload = {
        name: searchText.value,
      };
      await post(API_ENDPOINTS.search, payload)
        .then((x) => {
          pageModel.items = reactive(x.data);
        })
        .finally(() => {
          isSearched.value = true;
          isSearchTextInLoading.value = false;
        });
    }
    function trySearch() {
      isSearched.value = false;
      latestSearchedText = searchText.value;
      if (searchText.value.trim().length > 2) {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(() => {
          if (
            searchText.value.trim().length > 2 &&
            searchText.value == latestSearchedText
          ) {
            search();
          }
        }, 1500);
      }
    }
    function getTypeByTypeId(id) {
      for (const key in PRODUCT_TYPES) {
        if (PRODUCT_TYPES[key].id === id) {
          return PRODUCT_TYPES[key].typeName;
        }
      }
      return null; // Return null or an appropriate value if the ID is not found
    }
    useHead({
      title: `جستجو`,
    });
    return {
      searchText,
      trySearch,
      isSearchTextInLoading,
      isSearched,
      pageModel,
      getTypeByTypeId,
    };
  },
};
</script>
