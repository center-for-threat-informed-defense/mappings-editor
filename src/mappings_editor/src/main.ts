import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "@/assets/fonts/inter.css"

createApp(App).use(createPinia()).mount('#app')
