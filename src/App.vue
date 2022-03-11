<template>
  <div id="app">
    <v-app id="inspire">
      <v-navigation-drawer v-model="drawer" app>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Contracts
            </v-list-item-title>
            <v-list-item-subtitle>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list nav dense>
          <v-list-item-group
            v-model="selectedItem"
            color="accent">
            <v-list-item
              v-for="(item, i) in items"
              :key="i">
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <v-toolbar-title>Abakhus</v-toolbar-title>
        <v-spacer />
        <v-btn outlined @click="connect">
          {{address === '' ? `Conect Keplr` : `${address.substring(0, 10)}...`}}
          <v-icon right>
            account_balance_wallet
          </v-icon>
        </v-btn>
      </v-app-bar>

      <v-main fill-height>
        <router-view fill-height/>
      </v-main>
    </v-app>
  </div>
</template>
<script>
import {
  bootstrap,
  getAddress,
  onAccountAvailable,
} from '@stakeordie/griptape.js';

export default {
  data: () => ({
    selectedItem: 0,
    drawer: null,
    address: '',
    isConnected: false,
    removeOnAccountAvailable: null,
    items: [
        { text: 'Laudos laboratriais', icon: 'science' },
        { text: 'Relatórios de análise', icon: 'biotech' },
        { text: 'Base de dados', icon: 'storage' },
        { text: 'Código/software', icon: 'code' },
        { text: 'Utility Token', icon: 'token' },
      ],
  }),
  mounted() {
    this.removeOnAccountAvailable = onAccountAvailable(() => {
      this.isConnected=true;
      this.address = getAddress();
    });
  },
  unmounted(){
    this.removeOnAccountAvailable();
  },
  methods: {
    async connect() {
      await bootstrap();
    },
  }
}
</script>
<style>
</style>
