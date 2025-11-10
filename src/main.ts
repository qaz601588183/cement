import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/index.scss';
import App from './App.vue';
import router, { syncRouter } from './router';
import { vuetify } from '@/plugins/vuetify';
import registeComponent from './components';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);
registeComponent(app);
app.use(createPinia());
app.use(vuetify);

syncRouter().then(() => {
    app.use(router);
    app.mount('#app').$nextTick(() => {
        setTimeout(() => {
            const d = document.getElementById('_loading_');
            d?.setAttribute('class', 'loading_ hide');
        }, 10);
    });
});
