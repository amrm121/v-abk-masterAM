import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import {
  gripApp,
  getKeplrAccountProvider
} from '@stakeordie/griptape.js';
const restUrl = 'https://api.pulsar.griptapejs.com';
const provider = getKeplrAccountProvider();

Vue.config.productionTip = false
function runApp() {
  new Vue({
    router,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

gripApp(restUrl, provider, runApp);