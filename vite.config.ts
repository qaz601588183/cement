import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import { ElementPlusResolver, VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import Vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    // base: '/vue-material-admin',
    plugins: [
        Vue(),
        // 组件自动导入
        Vuetify({ autoImport: { labs: true } }),
        VueJsx(), // 都用Vue还用什么JSX
        Components({
            resolvers: [ElementPlusResolver(), VuetifyResolver()],
            dts: 'typings/components.d.ts',
        }),
    ],
    server: {
        open: false,
        host: '0.0.0.0',
        port: 8088,
        hmr: true,
    },
    resolve: {
        alias: {
            // @ts-ignore
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
