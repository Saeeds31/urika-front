<template>
  <v-bottom-sheet v-model="isVisible">
    <v-card class="pwa-modal">
      <div class="text-center mt-2">
        <v-img class="my-4 mx-auto" max-width="85" :src="logoUrl" />
        <p class="font-weight-bold mt-4">
          وب‌اپلیکیشن یوریکا را به صفحه اصلی موبایل خود اضافه کنید.
        </p>
        <div class="text-center">
          <div class="pwa-install-steps text-right ios-guide" v-if="isIos">
            <p class="mt-2">
              <img :src="safariIcon" class="ml-1" />
              ۱ - از طریق مرورگر Safari وارد سایت یوریکا شوید.
            </p>
            <p>
              <img :src="shareIcon" class="ml-1" />
              ۲ - در نوار پایین گزینه share را انتخاب کنید.
            </p>
            <p>
              <img :src="plusIcon" class="ml-1" />
              ۳ - در منوی باز شده، در قسمت پایین، گزینه Add to Home Screen را
              انتخاب کنید.
            </p>
            <p>
              <img :src="addIcon" class="ml-1" /> ۴ - در مرحله بعد در قسمت بالا
              Add را انتخاب کنید.
            </p>
          </div>
          <div class="pwa-install-steps text-right other-guides" v-else>
            <p>۱ - ابتدا روی دکمه سه نقطه در بالای صفحه کلیک کنید.</p>
            <p>۱ - سپس دکمه Add to home را بزنید.</p>
            <p>۲ - سپس از مودال باز شده دکمه "Install" را انتخاب کنید.</p>
            <p>
              ۳ - بعد از نصب وب اپلیکیشن یوریکا در صفحه اول دستگاه شما در دسترسی
              خواهد بود.
            </p>
          </div>
          <div class="px-3 py-3 mb-2" v-if="1 == 1">
            <v-btn
              @click="hideUntil(30)"
              class="font-weight-black"
              block
              color="primary"
            >
              <span>متوجه شدم</span>
            </v-btn>
          </div>
          <div class="px-3 py-3 mb-2" v-else>
            <v-row justify="start">
              <v-col cols="6" xs="6" class="pl-1">
                <v-btn
                  class="mt-3 font-weight-black"
                  block
                  color="primary"
                  variant="outlined"
                  @click="hideUntil(30)"
                >
                  متوجه شدم
                </v-btn>
              </v-col>
              <v-col cols="6" xs="6" class="pr-1">
                <v-btn
                  class="mt-3 font-weight-black"
                  block
                  color="primary"
                  variant="elevated"
                  @click="install"
                >
                  نصب
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </div></v-card
    >
  </v-bottom-sheet>
</template>
<script setup>
const logoUrl = "/assets/images/pwa-96x96.png";
const { showNotification } = useSnackNotification();

const safariIcon = "/assets/images/pwa-images/safari.svg";
const shareIcon = "/assets/images/pwa-images/share-btn.svg";
const plusIcon = "/assets/images/pwa-images/plus-sign.svg";
const addIcon = "/assets/images/pwa-images/add.svg";
var installPromptEvent;
const isVisible = ref(false);
function hideUntil(dayCount) {
  const untilTimeStamp = Date.now() + dayCount * 24 * 60 * 60 * 1000;
  localStorage.setItem("pwaModalHideUntil", untilTimeStamp);
  isVisible.value = false;
}
function install() {
  installPromptEvent?.prompt();
  installPromptEvent.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === "accepted") {
      showNotification("درخواست نصب تایید شد.", "success");
      hideUntil(365);
      isVisible.value = false;
    } else {
      showNotification("درخواست نصب رد شد.", "error");
    }
  });
}

let pwaModalHideUntil = localStorage.getItem("pwaModalHideUntil");
const isPwa = window.matchMedia("(display-mode: standalone)").matches;
const nowTimeStamp = Date.now();
const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
if (
  (pwaModalHideUntil == null || pwaModalHideUntil < nowTimeStamp) &&
  !isPwa &&
  !window.MSStream
) {
  isVisible.value = true;
  onMounted(() => {
    setTimeout(() => {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        alert();
        installPromptEvent = e;
        console.log(e);
      });
    }, 500);
  });
}
</script>
<style scoped lang="scss">
.pwa-install-steps {
  padding: 10px 30px;
  p {
    margin: 15px 0;
    font-size: 14px;
    line-height: 30px;
  }
  img {
    vertical-align: -4px;
  }
}
.pwa-modal {
  border-radius: 15px 15px 0 0 !important;
}
</style>
