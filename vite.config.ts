import Vue from "@vitejs/plugin-vue";
import VueJsx from "@vitejs/plugin-vue-jsx";
import { fileURLToPath, URL } from "node:url";
import {
    ElementPlusResolver,
    VuetifyResolver,
} from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";
import Vuetify from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd());
    const apiTarget = env.VITE_API || "http://39.107.112.174";

    return {
        base: "/",
        // base: '/vue-material-admin',
        plugins: [
            Vue(),
            // 组件自动导入
            Vuetify({ autoImport: { labs: true } }),
            VueJsx(), // 都用Vue还用什么JSX
            Components({
                resolvers: [ElementPlusResolver(), VuetifyResolver()],
                dts: "typings/components.d.ts",
            }),
        ],
        server: {
            open: false,
            host: "0.0.0.0",
            port: 8088,
            hmr: true,
            // 配置代理解决跨域问题
            proxy: {
                "/api": {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyReq, req) => {
                            console.log(
                                `[代理请求] ${req.method} ${req.url} -> ${apiTarget}${req.url}`
                            );
                        });
                        proxy.on("proxyRes", (proxyRes, req) => {
                            console.log(
                                `[代理响应] ${proxyRes.statusCode} ${req.url}`
                            );
                        });
                    },
                },
            },
        },
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
    };
});
