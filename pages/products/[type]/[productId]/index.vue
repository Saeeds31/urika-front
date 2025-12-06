import { useCustomFetch } from '../../../../composables/useCustomFetch';
<template>
  <v-container v-show="!isEbookOpen" class="single-product-page">
    <v-sheet class="px-3 py-3 rounded" elevation="1" v-motion-fade-visible :duration="700" :delay="0">
      <div class="d-flex justify-space-between align-center">
        <div class="product-info">
          <div class="d-flex align-center product-type">
            <img class="opacity-80" :src="productTypeIconUrl" />
            <h3 class="font-weight-black mr-1">
              {{ PRODUCT_TYPES[PRODUCT_TYPE].title }}
            </h3>
          </div>
          <h5 class="font-weight-black">{{ product?.name }}</h5>
          <p>
            {{ product?.owner.first_name + " " + product?.owner.last_name }}
          </p>
          <span>{{
            PRODUCT_TYPE == "ebooks"
              ? product?.total_page
              : product?.total_time
          }}
          </span>
        </div>
        <div class="product-image">
          <v-img width="120" :src="product?.image">
            <template v-slot:placeholder>
              <v-skeleton-loader height="100%"></v-skeleton-loader>
            </template>
          </v-img>
        </div>
      </div>
    </v-sheet>
    <div class="product-acttions mt-3" v-motion-fade-visible :duration="700" :delay="350">
      <v-btn v-if="!product?.is_bought" class="font-weight-black" block color="primary"
        @click="isVisiblePaymentModal = true">
        <span>
          <v-icon color="white" icon="mdi-shopping" size="15"></v-icon>
          پرداخت و خرید</span>
      </v-btn>
      <v-btn v-if="
        product?.is_bought && PRODUCT_TYPE == PRODUCT_TYPES['ebooks'].typeName
      " class="font-weight-black" block color="primary" @click="startBookReading">
        <span>
          <v-icon color="white" icon="mdi-book-open-page-variant" size="15" class="ml-1"></v-icon>
          خواندن کتاب
        </span>
      </v-btn>
      <v-btn v-if="
        product?.is_bought && PRODUCT_TYPE != PRODUCT_TYPES['ebooks'].typeName
      " class="font-weight-black" block color="primary" @click="isVisibleEpisodes = true">
        <span>
          <v-icon color="white" icon="mdi-earbuds" size="15"></v-icon>
          مشاهده قسمت ها
        </span>
      </v-btn>

      <v-row justify="start">
        <v-col cols="6" xs="6" class="pl-1">
          <v-btn class="mt-3 font-weight-bold" block color="primary" variant="outlined"
            :loading="isFavoriteButtonInLoading" @click="favorite">
            <span v-if="isFavorite">
              <v-icon color="primary" icon="mdi-heart" size="20"></v-icon>
              حذف از کتابخانه من</span>
            <span v-if="!isFavorite">
              <v-icon color="primary" icon="mdi-heart-outline" size="20"></v-icon>
              افزودن به کتابخانه من</span>
          </v-btn>
        </v-col>
        <v-col cols="6" xs="6" class="pr-1">
          <v-btn v-if="PRODUCT_TYPE == 'ebooks'" class="mt-3 font-weight-bold" block color="primary" variant="outlined"
            @click="openDemo">
            <!-- تابع کمکی بجای اینکه فلگ مد نظرو یهو ترو کنم -->
            <span>
              <v-icon color="primary" icon="mdi-book-open-variant" size="20"></v-icon>
              خواندن نسخه نمونه</span>
          </v-btn>
          <v-btn v-else-if="bottomAudioComponentModel?.contentId != product?.id" class="mt-3 font-weight-bold" block
            color="primary" variant="outlined" :loading="isDemoButtonInLoading"
            @click="launchDemo(product, PRODUCT_TYPE)">
            <span>
              <v-icon color="primary" icon="mdi-ear-hearing" size="20"></v-icon>
              شنیدن نسخه نمونه</span>
          </v-btn>
          <v-btn v-else-if="
            bottomAudioComponentModel?.contentId == product?.id &&
            bottomAudioComponentModel?.contentType == PRODUCT_TYPE &&
            bottomAudioComponentModel?.episodeId == 0
          " class="mt-3 font-weight-bold" block color="primary" variant="outlined">
            <span v-if="!isInDownloading">
              <v-icon color="primary" icon="mdi-ear-hearing" size="20"></v-icon>
              نسخه نمونه در حال پخش</span>
            <span v-else="isInDownloading">
              <v-icon color="primary" icon="mdi-download" size="20"></v-icon>
              نسخه نمونه در حال دانلود
            </span>
          </v-btn>
          <v-btn v-else-if="
            bottomAudioComponentModel?.contentId == product?.id &&
            bottomAudioComponentModel?.contentType == PRODUCT_TYPE &&
            bottomAudioComponentModel?.episodeId != 0
          " class="mt-3 font-weight-bold" block color="primary" variant="outlined">
            <span>
              <v-icon color="primary" icon="mdi-ear-hearing" size="20"></v-icon>
              کتاب در حال پخش</span>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <v-sheet class="mt-4 px-5 py-5 rounded" elevation="1" v-motion-fade-visible :duration="700" :delay="700">
      <div class="product-description">
        <h3 class="font-weight-black mb-3">توضیحات</h3>
        <div v-html="product?.description"></div>
      </div>
    </v-sheet>
    <v-bottom-sheet v-model="isVisiblePaymentModal" v-if="!product?.is_bought">
      <v-container>
        <v-card class="payment-ask-modal pb-3 pt-3 px-4" :elevation="3">
          <h2 class="font-weight-black text-center pb-3">
            <v-icon color="black" icon="mdi-bookmark-check" size="30"></v-icon>تایید پرداخت
          </h2>
          <p class="font-weight-black">{{ product?.name }}</p>
          <p>
            قیمت:
            <span class="font-weight-black">{{ product?.price }} تومان</span>
          </p>
          <p v-if="isLogin">
            در صورت تایید جهت پرداخت لطفا روی دکمه پرداخت کلیک کنید.
          </p>
          <p v-else-if="!isLogin">* لطفا قبل از پرداخت وارد اکانت خود شوید.</p>
          <v-row justify="start">
            <v-col cols="6" xs="6" class="pl-1">
              <v-btn class="mt-3 font-weight-black" block color="primary" variant="outlined"
                @click="isVisiblePaymentModal = false">
                انصراف
              </v-btn>
            </v-col>
            <v-col cols="6" xs="6" class="pr-1">
              <v-btn v-if="isLogin" class="mt-3 font-weight-black" block color="primary" variant="elevated"
                :loading="isPayButtonInLoading" @click="generatePaymentLink(parseInt(PRODUCT_ID), PRODUCT_TYPE)">
                پرداخت
              </v-btn>
              <v-btn v-else-if="!isLogin" class="mt-3 font-weight-black" block color="primary" variant="elevated"
                :loading="isPayButtonInLoading" @click="redirecteToLogin">
                ورود به اکانت
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-bottom-sheet>
    <v-bottom-sheet v-model="isVisibleEpisodes" class="episods-modal-outer" :style="{
      zIndex: 5,
      transition: '0.5s',
      boxShadow: 'none',
    }">
      <v-container>
        <v-card :elevation="3" :class="['episods-modal', 'px-2', 'pt-4']" :style="{
          transition: '0.5s',
          paddingBottom:
            bottomAudioComponentModel?.contentId == 0
              ? '56px'
              : isInDownloading
                ? '140px'
                : '170px',
        }">
          <v-list lines="two">
            <v-list-subheader inset class="mr-2 mb-3">لیست اپیزود های
              <strong class="font-weight-black">{{
                product?.name
                }}</strong></v-list-subheader>

            <v-list-item v-for="(episode, index) in product?.episodes" :key="episode.id" :subtitle="episode.time"
              :title="episode.title" class="episode-item" :class="{
                'currennt-playing':
                  PRODUCT_TYPES[bottomAudioComponentModel.contentType]?.id ===
                  product?.type &&
                  bottomAudioComponentModel.episodeId === episode.id,
              }" @click="playEpisode(product?.id, product?.type, episode.id)">
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-1" class="ml-2">
                  <v-icon color="white">mdi-earbuds-outline</v-icon>
                </v-avatar>
              </template>

              <template v-if="episode?.pdf_path.length > 5" v-slot:append>
                <a :href="episode?.pdf_path"><v-icon color="grey-lighten-1" icon="mdi-file-pdf-box"></v-icon></a>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-container>
    </v-bottom-sheet>
  </v-container>
  <div v-if="PRODUCT_TYPE == PRODUCT_TYPES['ebooks'].typeName && (isEbookOpen || isDemoOpen)">
    <!-- <div class="">
      <v-btn
        class="font-weight-black opacity-70"
        block
        color="primary"
        @click="isEbookOpen = false"
      >
        <span>
          <v-icon color="white" icon="mdi-close" size="15"></v-icon>
          بستن کتاب</span
        >
      </v-btn>
    </div> -->
    <ClientOnly>
      <UrikaPdfReader v-if="isEbookOpen" :src="pdfComponentSrc" @close="isEbookOpen = false" />
    </ClientOnly>
    <ClientOnly>
      <UrikaPdfReader v-if="isDemoOpen" :src="demoPdfSrc" @close="isDemoOpen = false" />
    </ClientOnly>
  </div>
</template>
<style lang="scss">
.currennt-playing {
  opacity: 1;
  background: #f2f2f2 !important;

  .v-avatar {
    background-color: rgb(var(--v-theme-primary)) !important;
    transition: 0.5s;
  }
}

.payment-ask-modal,
.episods-modal {
  border-radius: 15px 15px 0 0 !important;
}

.episode-item {
  transition: 0.5s;
  opacity: 0.8;
  padding: 15px 7.5px !important;
  border-bottom: 1px solid #e3e3e37d;
  border-radius: 8px !important;

  &.currennt {
    color: green;
  }

  &:last-child {
    border-bottom: none !important;
  }
}

.single-product-page {
  .product-info {
    .product-type {
      opacity: 0.3;
      font-size: 10.5px;
      margin-bottom: 5px;

      img {
        width: 20px !important;
      }
    }

    h5 {
      font-size: 18px;
    }

    p {
      margin-top: 5px;
    }

    span {
      opacity: 0.4;
      font-size: 14px;
    }
  }
}

.v-bottom-sheet__content {
  box-shadow: none !important;

  .v-container {
    padding: 0 !important;
  }
}
</style>
<script lang="ts" setup>
import useSingleProduct from "~/composables/useSingleProduct";
import useSnackNotification from "~/composables/useSnackNotification";
import { PRODUCT_TYPES } from "~/utilities/constants";
import type { Episode } from "~/types/product-types";
import { ROUTES } from "~/utilities/routes";
import type { Transition } from "vue";
import { onMounted } from "vue";
const route = useRoute();
const PRODUCT_ID = route.params.productId as string;
const PRODUCT_TYPE = route.params.type as string;
const { data: product, pending } = await useAsyncData('single-product', async () => {
  const { getProduct } = useSingleProduct();
  return await getProduct(PRODUCT_TYPE, parseInt(PRODUCT_ID));
});
useHead({
  title: computed(() => product.value ? `${PRODUCT_TYPES[PRODUCT_TYPE].title} ${product.value.name}` : 'در حال بارگذاری...'),
  meta: [{
    name: 'description',
    content: computed(() => product.value ? `${product.value.name} - اوریکا` : '')
  }]
});
const isDemoOpen = ref(false);
const demoPdfSrc = ref<string>("");

const openDemo = () => {
  if (!product.value?.demo_path) {
    useSnackNotification().showNotification("نسخه نمونه موجود نیست.", "warning");
    return;
  }
  console.log(product.value);

  demoPdfSrc.value = product.value.demo_path;
  isDemoOpen.value = true;
};

const isVisibleEpisodes = ref<boolean>(false);
const _isOpenPaymentModal =
  route.query.isOpenPaymentModal != null &&
    route.query.isOpenPaymentModal == "true"
    ? true
    : false;
const isVisiblePaymentModal = ref<boolean>(_isOpenPaymentModal);
const pdfComponentSrc = ref<string>("");
const productTypeIconUrl = PRODUCT_TYPES[PRODUCT_TYPE].iconUrl;
const { showNotification } = useSnackNotification();
const {
  isPayButtonInLoading,
  isDemoButtonInLoading,
  launchDemo,
  addToFavorites,
  removeFromFavorites,
  isFavoriteButtonInLoading,
  getProduct,
  isFavorite,
  generatePaymentLink,
  isLogin,
  bottomAudioComponentModel,
  playEpisode,
  isInDownloading,
} = useSingleProduct();


isFavorite.value = product?.is_favorited ?? false;


function startBookReading() {
  if (PRODUCT_TYPE == PRODUCT_TYPES.ebooks.typeName && product.value?.is_bought) {
    pdfComponentSrc.value = product.value.origina_file;
    isEbookOpen.value = true;
  }
}

function favorite() {
  isFavoriteButtonInLoading.value = true;
  if (product) {
    if (isFavorite.value) {
      removeFromFavorites(product.value.id, PRODUCT_TYPE)
        .then((x) => {
          if (x.status == "successful") {
            isFavorite.value = false;
            showNotification(
              product.value.name + " " + "از کتابخانه شما حذف شد.",
              "success"
            );
          } else {
            showNotification(x.messages ?? "", x.status ?? "error");
          }
        })
        .finally(() => (isFavoriteButtonInLoading.value = false));
    } else {
      addToFavorites(product.value.id, PRODUCT_TYPE)
        .then((x) => {
          if (x.status == "successful") {
            isFavorite.value = true;
            showNotification(
              product.value.name + " " + "به کتابخانه شما اضافه شد.",
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
function redirecteToLogin() {
  const query = { fromPage: location.pathname };
  navigateTo({ path: ROUTES.MEMBER.LOGIN, query });
}
const isEbookOpen = ref(false);
if (PRODUCT_TYPE == PRODUCT_TYPES.ebooks.typeName) {
  pdfComponentSrc.value = product.value?.demo_path ?? "";
  console.log(pdfComponentSrc);
}

</script>
