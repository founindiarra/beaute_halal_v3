import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/dm-sans/index.css'
import './style.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { magnetic, parallax, tilt } from './directives/motion'
import { reveal } from './directives/reveal'
import { syncTarifs } from './services/tarifsSync'

await syncTarifs()

createApp(App)
  .use(router)
  .directive('reveal', reveal)
  .directive('parallax', parallax)
  .directive('magnetic', magnetic)
  .directive('tilt', tilt)
  .mount('#app')
