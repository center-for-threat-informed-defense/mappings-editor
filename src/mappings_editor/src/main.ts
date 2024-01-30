// @ts-ignore
import process from 'process'
import App from './App.vue'
import { createPinia } from 'pinia'
import { MappingFileView } from '@/assets/scripts/MappingFileEditor'
import { createApp, toRaw } from 'vue'
import "@/assets/fonts/inter.css"
import "@/assets/fonts/dm_mono.css"

// Configure Libraries
MappingFileView.toRaw = toRaw;

// Create application
const app = createApp(App)

// Configure store and mount application
app.use(createPinia()).mount('#app')

// Enable Vue performance timings
if(process.env.NODE_ENV === "development") {
    // app.config.performance = true;
}
