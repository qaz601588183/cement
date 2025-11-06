import Layout from '@/layout/index.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior() {
        return { top: 0 };
    },
    routes: [
        {
            path: '/login',
            name: 'login',
            meta: {
                title: 'Login',
                icon: 'mdi-shield-account',
                visible: false,
            },
            component: () => import('@/views/login/login.vue'),
        },
        {
            path: '/',
            redirect: '/components/table',
        },
        {
            path: '/components',
            name: 'components',
            component: Layout,
            meta: {
                title: 'Samples',
                icon: 'mdi-view-dashboard',
                visible: true,
            },
            children: [
                {
                    path: 'detection',
                    name: 'detection',
                    meta: {
                        title: '检测页面',
                        icon: 'mdi-table',
                        visible: true,
                    },
                    component: () => import('@/views/componets/detection.vue'),
                },
                {
                    path: 'table',
                    name: '抓取页面',
                    meta: {
                        title: '抓取页面',
                        icon: 'mdi-table',
                        visible: true,
                    },
                    component: () => import('@/views/componets/table.vue'),
                },
            ],
        },
        {
            path: '/rbac',
            name: 'rbac',
            component: Layout,
            meta: {
                title: '权限管理',
                icon: 'mdi-shield-account',
                visible: true,
            },
            children: [
                {
                    path: 'role',
                    name: 'role',
                    meta: {
                        title: '角色管理',
                        icon: 'mdi-account-group',
                        visible: true,
                    },
                    component: () => import('@/views/rbac/index.vue'),
                },
                {
                    path: 'user',
                    name: 'user',
                    meta: {
                        title: '用户管理',
                        icon: 'mdi-account-multiple',
                        visible: true,
                    },
                    component: () => import('@/views/rbac/user.vue'),
                },
            ],
        },
        {
            path: '/:pathMatch(.*)',
            redirect: '/404',
        },
        {
            path: '/404',
            name: 'NotFound',
            meta: { keepAlive: false },
            component: Layout,
            children: [
                {
                    path: '',
                    name: 'd404',
                    meta: {
                        title: 'Not found',
                        visible: false,
                    },
                    component: () => import('@/views/feedback/no.vue'),
                    children: [],
                },
            ],
        },
    ],
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
            await router.push('/components/table');
        }
        return Promise.resolve(true);
    } catch (err) {
        console.log(err, '==================');
        return Promise.resolve(false);
    }
}
