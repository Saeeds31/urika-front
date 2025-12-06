<template>
  <v-container>
    <div class="px-3" style="background-color: white">
      <v-list lines="two">
        <v-list-item
          v-for="category in categoryGetModel"
          class="border-b-thin cursor-pointer"
        >
          <v-list-title>
            <template v-slot="text">
              <nuxt-link
                :to="ROUTES.CATEGORIES.CATEGORY(category.id)"
                class="text-decoration-none"
              >
                <div
                  class="d-flex justify-space-between contetn-of-profile font-weight-bold text-black"
                >
                  <div>
                    {{ category.name }}
                  </div>
                  <div class="">
                    <v-icon icon="mdi-menu-left"></v-icon>
                  </div></div
              ></nuxt-link>
            </template>
          </v-list-title>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { useCustomFetch } from "~/composables/useCustomFetch";
import type { CategoryGetModel } from "~/types/categoryGetModel";
import { ROUTES } from "~/utilities/routes";
useHead({ bodyAttrs: { class: "bg-white" } });
let categoryGetModel: any;
const { get } = useCustomFetch();
await get<CategoryGetModel[]>(API_ENDPOINTS.categories.get).then((x) => {
  categoryGetModel =
    x.data != null ? reactive<CategoryGetModel[]>(x.data) : null;
});
useHead({
  title: `دسته بندی ها`,
});
</script>
