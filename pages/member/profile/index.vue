<template>
  <v-container elevation="1">
    <v-card class="mx-auto rounded profile-card">
      <h3 class="font-weight-black opacity-70">پروفایل</h3>
      <v-list>
        <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-account"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>نام</div>
                <div class="font-weight-bold" @click="profileEditModal.isVisible = true">
                  <span class="ml-2 opacity-30"><v-icon size="15">mdi-pencil</v-icon></span>
                  <span v-if="
                    profileModel?.first_name != null ||
                    profileModel?.last_name != null
                  ">
                    {{ profileModel?.first_name }}
                    {{ profileModel?.last_name }}</span>
                  <span v-else>ثبت نشده</span>
                </div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>

        <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-phone-dial"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>شماره موبایل</div>
                <div class="font-weight-bold">
                  {{ profileModel?.phone_number }}
                </div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>

        <!-- <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-currency-usd"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>کیف پول</div>
                <div class="font-weight-bold">۲۰.۰۰۰ ریال</div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item> -->

        <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-account-credit-card"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>تراکنش ها</div>
                <div class=""><v-icon icon="mdi-menu-left"></v-icon></div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>

        <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-information-box"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>قوانین و مقررات</div>
                <div class=""><v-icon icon="mdi-menu-left"></v-icon></div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>

        <!-- <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-face-agent"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>پشتیبانی و سوالات متداول</div>
                <div class=""><v-icon icon="mdi-menu-left"></v-icon></div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item> -->

        <v-list-item class="border-b-thin">
          <template v-slot:prepend>
            <v-icon icon="mdi-alert"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div>گزارش خطا</div>
                <div class=""><v-icon icon="mdi-menu-left"></v-icon></div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>

        <v-list-item class="">
          <template v-slot:prepend>
            <v-icon icon="mdi-logout"></v-icon>
          </template>

          <v-list-item-title>
            <template v-slot="text">
              <div class="d-flex justify-space-between contetn-of-profile">
                <div @click="logoutUser">خروج از حساب کاربری</div>
                <div class=""></div>
              </div>
            </template>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>

  <v-dialog max-width="500" v-model="profileEditModal.isVisible">
    <v-card rounded="lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-medium-emphasis ps-2 font-weight-black">
          <p>ویرایش اطلاعات</p>
        </div>

        <v-btn icon="mdi-close" variant="text" @click="profileEditModal.isVisible = false"></v-btn>
      </v-card-title>

      <v-divider class="mb-1"></v-divider>

      <v-card-text class="pb-2 px-3">
        <v-text-field label="نام" variant="outlined" persistent-hint v-model="profileEditModal.name"></v-text-field>
        <v-text-field label="نام خانوادگی" variant="outlined" v-model="profileEditModal.lastName"
          hide-details></v-text-field>
        <v-btn class="font-weight-black mt-4 mb-2" block color="primary" variant="elevated"
          :loading="profileEditModal.isSaveButtonLoading" @click="updateProfile">
          <v-icon class="ml-1">mdi-content-save-check</v-icon>
          ذخیره
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import useLoading from "~/composables/useLoading";
import Cookies from "js-cookie";
import { ROUTES } from "~/utilities/routes";

definePageMeta({
  middleware: "auth",
});

const { get, post } = useCustomFetch();
const { startLoading } = useLoading();
const profileEditModal = reactive({
  isVisible: false,
  isSaveButtonLoading: false,
  name: "",
  lastName: "",
});
let profileModel;
get(API_ENDPOINTS.profile.get).then((x) => {
  profileModel = reactive(x.data);
  profileEditModal.name = profileModel?.first_name ?? "";
  profileEditModal.lastName = profileModel?.last_name ?? "";
});
function logoutUser() {
  startLoading();
  post(API_ENDPOINTS.auth.logout).then((x) => {
    Cookies.remove("authToken");
    navigateTo(ROUTES.MEMBER.LOGIN);
  });
}
function updateProfile() {
  profileEditModal.isSaveButtonLoading = true;
  let payload = {
    first_name: profileEditModal.name,
    last_name: profileEditModal.lastName,
  };
  post(API_ENDPOINTS.profile.save, payload)
    .then((x) => {
      profileEditModal.isVisible = false;
    })
    .finally(() => {
      profileEditModal.isSaveButtonLoading = false;
    });
}
useHead({
  title: `پروفایل`,
});

</script>
<style>
.v-list-item__prepend {
  flex-direction: column;
}

.profile-card {
  padding: 10px 25px !important;
}

.v-list-subheader__text {
  font-size: 20px;
}

.v-list-item.v-list-item.v-theme--light.v-list-item--density-default.v-list-item--one-line.rounded-0.v-list-item--variant-text {
  padding: 17px 0px;
  font-size: 12px;
}

.v-list--density-default .v-list-subheader {
  padding-inline-start: 0 !important;
}

.contetn-of-profile {
  font-size: 14px;
}
</style>
