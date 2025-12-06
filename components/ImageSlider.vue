<template>
  <div :id="carouselId" class="image-slider">
    <v-carousel show-arrows="hover" cycle hide-delimiter-background>
      <v-carousel-item v-for="(slide, i) in slides" :key="i">
        <a :href="slide.link" target="_self">
          <v-img
            v-motion-fade
            :duration="1200"
            cover
            :src="slide.image"
            height="100%"
            class="fill-height slider-image"
          >
            <template v-slot:placeholder>
              <v-skeleton-loader height="100%"></v-skeleton-loader>
            </template>
          </v-img>
        </a>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
export default {
  props: {
    slides: {
      type: Array,
      required: true,
      default: () => [],
    },
    carouselId: {
      type: String,
      required: false,
      default: () => "",
    },
  },
};
</script>
<style lang="scss">
.image-slider {
  button {
    color: white;
    opacity: 1;
    background: #0000003b;
    transform: scale(0.65) !important;
  }
}
</style>
