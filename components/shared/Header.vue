<template>
  <v-row class="app-header">
    <v-col cols="12" sm="12">
      <v-card
        elevation="2"
        color="grey-lighten-4"
        class="rounded-0"
        style="z-index: 10"
        flat
      >
        <v-toolbar color="primary" :dark="true">
          <v-toolbar-title class="font-weight-black">یوریکا</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon to="/search">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <!-- <v-btn icon>
            <v-icon>mdi-heart</v-icon>
          </v-btn> -->
        </v-toolbar>
      </v-card>
    </v-col>
  </v-row>
</template>
<style scoped>
.app-header > div {
  z-index: 5;
}
</style>
