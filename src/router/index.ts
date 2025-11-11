import Layout from "@/layout/index.vue";
import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
    routes: [
        {
            path: "/login",
            name: "login",
            meta: {
                title: "Login",
                icon: "mdi-shield-account",
                visible: false,
            },
            component: () => import("@/views/login/login.vue"),
        },
        {
            path: "/",
            redirect: "/home/chat",
        },
        {
            path: "/home",
            name: "home",
            component: Layout,
            meta: {
                title: "首页",
                icon: "mdi-home",
                visible: true,
                singleChildRedirect: true, // 添加标记，表示只有一个子菜单时直接重定向
            },
            children: [
                {
                    path: "chat",
                    name: "chat",
                    meta: {
                        title: "AI对话",
                        icon: "mdi-chat",
                        keepAlive: true,
                        visible: true,
                    },
                    component: () => import("@/views/chat/chat.vue"),
                },
            ],
        },
        {
            path: "/concrete-design",
            name: "concrete-design",
            component: Layout,
            meta: {
                title: "混凝土配比设计流程",
                icon: "mdi-source-branch",
                visible: true,
            },
            children: [
                {
                    path: "guide",
                    name: "guide",
                    meta: {
                        title: "流程引导",
                        icon: "mdi-map-marker-path",
                        visible: true,
                        step: 0,
                        description: "选择配比设计流程",
                    },
                    component: () => import("@/views/componets/deduce.vue"),
                },
                {
                    path: "reverse-step1",
                    name: "reverse-step1",
                    meta: {
                        title: "反向推演数据",
                        icon: "mdi-clipboard-text",
                        visible: true,
                        step: 1,
                        description: "施工方提供具体的强度需求",
                    },
                    component: () => import("@/views/reverse/step1.vue"),
                },
                {
                    path: "reverse-step2",
                    name: "reverse-step2",
                    meta: {
                        title: "反向推演报告",
                        icon: "mdi-file-document",
                        visible: true,
                        step: 2,
                        description: "预判模型快速给出初步配合比",
                    },
                    component: () => import("@/views/reverse/step2.vue"),
                },
                {
                    path: "detection",
                    name: "detection",
                    meta: {
                        title: "智慧实验室",
                        icon: "mdi-flask",
                        visible: true,
                        step: 3,
                        description: "检测实验室进行材料属性检测",
                    },
                    component: () => import("@/views/componets/detection.vue"),
                },
                {
                    path: "forward-step1",
                    name: "forward-step1",
                    meta: {
                        title: "正向推演数据",
                        icon: "mdi-database-edit",
                        visible: true,
                        step: 4,
                        description: "根据检测结果和历史数据调整配合比",
                    },
                    component: () => import("@/views/forward/step1.vue"),
                },
                {
                    path: "forward-step2",
                    name: "forward-step2",
                    meta: {
                        title: "正向推演报告",
                        icon: "mdi-file-chart",
                        visible: true,
                        step: 5,
                        description: "生成最终混合料配比",
                    },
                    component: () => import("@/views/forward/step2.vue"),
                },
            ],
        },
        {
            path: "/rbac",
            name: "rbac",
            component: Layout,
            meta: {
                title: "权限管理",
                icon: "mdi-shield-account",
                visible: false,
            },
            children: [
                {
                    path: "role",
                    name: "role",
                    meta: {
                        title: "角色管理",
                        icon: "mdi-account-group",
                        visible: true,
                    },
                    component: () => import("@/views/rbac/index.vue"),
                },
                {
                    path: "user",
                    name: "user",
                    meta: {
                        title: "用户管理",
                        icon: "mdi-account-multiple",
                        visible: true,
                    },
                    component: () => import("@/views/rbac/user.vue"),
                },
            ],
        },
        {
            path: "/:pathMatch(.*)",
            redirect: "/404",
        },
        {
            path: "/404",
            name: "NotFound",
            meta: { keepAlive: false },
            component: Layout,
            children: [
                {
                    path: "",
                    name: "d404",
                    meta: {
                        title: "Not found",
                        visible: false,
                    },
                    component: () => import("@/views/feedback/no.vue"),
                    children: [],
                },
            ],
        },
    ],
});

// 路由导航守卫 - 验证登录状态
router.beforeEach((to, from, next) => {
    // 获取accessToken
    const accessToken = localStorage.getItem("accessToken");

    // 白名单：不需要登录验证的路由
    const whiteList = ["/login", "/404"];

    // 判断是否在白名单中
    const isInWhiteList = whiteList.includes(to.path);

    if (accessToken) {
        // 已登录
        if (to.path === "/login") {
            // 如果已登录，访问登录页则跳转到首页
            next("/");
        } else {
            // 正常访问
            next();
        }
    } else {
        // 未登录
        if (isInWhiteList) {
            // 在白名单中，直接放行
            next();
        } else {
            // 不在白名单中，跳转到登录页
            next("/login");
        }
    }
});

export default router;

/**
 * 初始化路由和菜单
 * 使用本地静态路由，不再从后端获取
 * @param toFirst 是否跳转第一个路由
 */
export async function syncRouter(toFirst = false) {
    try {
        // 路由已在上面静态配置，这里不再需要动态添加
        // 直接返回成功，保持与原来的接口一致
        if (toFirst) {
            await router.push("/concrete-design/guide");
        }
        return Promise.resolve(true);
    } catch (err) {
        console.log(err, "==================");
        return Promise.resolve(false);
    }
}
