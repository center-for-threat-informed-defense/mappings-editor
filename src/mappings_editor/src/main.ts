import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "@/assets/fonts/inter.css"
import "@/assets/fonts/dm_mono.css"

createApp(App).use(createPinia()).mount('#app')
