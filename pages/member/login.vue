<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <div class="text-center">
          <h2 v-motion-fade-visible :duration="1200" class="font-weight-black">
            ورود به حساب کاربری
          </h2>
          <div v-motion-fade-visible :duration="1200" :delay="150">
            <v-img cover src="/public/assets/images/illustrations/login-image.svg"></v-img>
          </div>
          <div v-motion-fade-visible :duration="1200" :delay="300" v-show="step == 1" class="mb-3">
            <v-text-field type="text" hide-spin-buttons hide-details class="mt-3 inner-text-left" v-model="username"
              label="شماره موبایل یا ایمیل" variant="outlined" @keydown.enter="sendCode"></v-text-field>
          </div>
          <div v-motion-fade-visible :duration="1200" v-show="step == 2">
            <v-locale-provider locale="fa" v-if="step == 2 && notExist">
              <v-text-field type="text" hide-spin-buttons hide-details class="mt-3 inner-text-right" v-model="firstName"
                label="نام" variant="outlined"></v-text-field>
              <v-text-field type="text" hide-spin-buttons hide-details class="mt-3 inner-text-right" v-model="lastName"
                label="نام خانوادگی" variant="outlined"></v-text-field>
            </v-locale-provider>

            <v-locale-provider locale="en" v-if="step == 2">
              <v-otp-input ref="otpInput" @finish="login" v-if="step == 2" v-model="otpCode" :length="5"></v-otp-input>
            </v-locale-provider>
          </div>

          <div v-motion-fade :duration="1200" :delay="450">
            <v-btn :disabled="isSubmitButtonDisabled" v-on:click="handleClick" block color="primary" variant="elevated"
              :loading="isButtonInLoading">
              <span v-show="step == 1" style="font-size: 14px" class="font-weight-black">ورود / ثبت نام</span>
              <span v-show="step == 2" style="font-size: 14px" class="font-weight-black">تایید</span>
              <span v-show="step == 3" style="font-size: 14px" class="font-weight-black">با موفقیت لاگین شدید در حال
                انتقال ...</span>
            </v-btn>
          </div>
          <div v-motion-fade :duration="1200" :delay="600">
            <p v-show="step == 1" class="font-weight-black mt-4 opacity-40">
              هم اکنون به جمع یوریکایی ها بپیوندید.
            </p>
            <p v-if="step == 2" class="mt-4 opacity-40" v-motion-fade :duration="1200" :delay="600">
              {{ isNumeric ? "شماره تماس " : "ایمیل" }} وارد شده {{ username }}
            </p>
            <v-button v-motion-fade :duration="1200" :delay="600" class="cursor-pointer opacity-80" v-if="step == 2">
              <span class="font-weight-black text-decoration-underline" @click="changeNumber">تغییر می دهید؟</span>
            </v-button>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-snackbar v-model="showSnackbar" :timeout="2000">
      {{ snackbarText }}
      <template v-slot:actions> </template>
    </v-snackbar>
  </v-container>
</template>
<script>
import { API_ENDPOINTS } from "~/utilities/apiEndpoints";
import { useCustomFetch } from "../composables/useCustomFetch";
import Cookies from "js-cookie";
import useLoading from "~/composables/useLoading";
import { ROUTES } from "~/utilities/routes";

definePageMeta({
  middleware: "auth",
});
export default {
  setup() {
    const { post } = useCustomFetch();
    const route = useRoute();
    const fromPage = route.query.fromPage || null;
    useHead({
      title: `ورود کاربران`,
    });
    return { post, fromPage };
  },
  data() {
    return {
      isButtonInLoading: false,
      showSnackbar: false,
      snackbarText: "",
      username: "",
      otpCode: "",
      step: 1,
      firstName: "",
      lastName: "",
      notExist: false
    };
  },
  computed: {
    // isSubmitButtonDisabled() {
    //   return this.step === 1
    //     ? this.username.length !== 11
    //     : this.otpCode.toString().length !== 5;
    // },
    isSubmitButtonDisabled() {
      if (this.step === 1) {
        return !this.isValidUsername;
      } else {
        return this.otpCode.toString().length !== 5;
      }
    },
    isNumeric() {
      return /^[0-9]+$/.test(this.username.trim());
    },
    isValidUsername() {
      const username = this.username.trim();
      if (this.isNumeric) {
        return username.length === 11;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(username);
    }
  },
  methods: {
    async sendCode() {
      self = this;
      self.isButtonInLoading = true;
      const payload = {
        identifier: self.username,
      };
      await this.post(API_ENDPOINTS.auth.sendCode, payload).then((x) => {
        self.step = 2;
        self.snackbarText = x.messages;
        this.notExist = !x.data?.exist;
        self.showSnackbar = true;
        self.isButtonInLoading = false;
      });
      this.focusOnOtp();
    },
    async login() {
      self = this;
      self.isButtonInLoading = true;
      let isCodeIncoorrect = false;
      const payload = {
        identifier: self.username,
        code: self.otpCode,
        firstName: this.firstName,
        lastName: this.lastName,
      };
      await this.post(API_ENDPOINTS.auth.smsLogin, payload).then((x) => {
        if (x.status == "successful" && x.data?.access_token.length) {
          self.step = 3;
          self.isButtonInLoading = false;
          isCodeIncoorrect = false;
          const expires = new Date();
          expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 7 روز
          Cookies.set("authToken", x.data?.access_token, {
            expires: expires,
            secure: true,
            sameSite: "strict",
          });
        } else {
          self.snackbarText = x.messages;
          self.showSnackbar = true;
          self.isButtonInLoading = false;
          isCodeIncoorrect = true;
        }
        if (isCodeIncoorrect) {
          this.$refs.otpInput.reset();
          this.$refs.otpInput.focus();
        } else {
          const { startLoading } = useLoading();
          startLoading();
          if (self.fromPage && self.fromPage.length) {
            const query = { isOpenPaymentModal: true };
            navigateTo({ path: self.fromPage, query });
          } else navigateTo(ROUTES.MEMBER.PROFILE);
        }
      });
    },
    handleClick() {
      switch (this.step) {
        case 1:
          this.sendCode();
          break;
        case 2:
          this.login();
          break;
      }
    },
    focusOnOtp() {
      this.$refs.otpInput.focus();
    },
    changeNumber() {
      this.username = "";
      this.step = 1;
      this.$refs.otpInput.reset();
    },
  },
  mounted() { },
};
</script>
