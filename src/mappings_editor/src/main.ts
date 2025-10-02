// @ts-ignore
import process from 'process'
import App from './App.vue'
import * as MappingFileEditor from '@/assets/scripts/MappingFileEditor'
import * as MappingFileAuthority from './assets/scripts/MappingFileAuthority'
import { createPinia } from 'pinia'
import { createApp, toRaw } from 'vue'
import VueDiff from 'vue-diff'
import 'vue-diff/dist/index.css'
import "@/assets/fonts/inter.css"
import "@/assets/fonts/dm_mono.css"

// Configure Libraries
MappingFileEditor.Reactivity.toRaw = toRaw;
MappingFileAuthority.Reactivity.toRaw = toRaw;

// Create application
const app = createApp(App)

// Configure store and mount application
app.use(VueDiff, {componentName: 'VueDiff'}).use(createPinia()).mount('#app')

// Enable Vue performance timings
if(process.env.NODE_ENV === "development") {
    // app.config.performance = true;
}
