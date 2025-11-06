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
            redirect: '/components/deduce',
        },
        {
            path: '/components',
            name: 'components',
            component: Layout,
            meta: {
                title: '因果分析',
                icon: 'mdi-view-dashboard',
                visible: true,
            },
            children: [
                {
                    path: 'detection',
                    name: 'detection',
                    meta: {
                        title: '智慧实验室',
                        icon: 'mdi-table',
                        visible: true,
                    },
                    component: () => import('@/views/componets/detection.vue'),
                },
                {
                    path: 'deduce',
                    name: '推演系统',
                    meta: {
                        title: '混凝土强度推演',
                        icon: 'mdi-chart-timeline-variant',
                        visible: true,
                    },
                    component: () => import('@/views/componets/deduce.vue'),
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
                visible: false,
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

// 路由导航守卫 - 验证登录状态
router.beforeEach((to, from, next) => {
    // 获取accessToken
    const accessToken = localStorage.getItem('accessToken');
    
    // 白名单：不需要登录验证的路由
    const whiteList = ['/login', '/404'];
    
    // 判断是否在白名单中
    const isInWhiteList = whiteList.includes(to.path);
    
    if (accessToken) {
        // 已登录
        if (to.path === '/login') {
            // 如果已登录，访问登录页则跳转到首页
            next('/');
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
            next('/login');
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
            await router.push('/components/deduce');
        }
        return Promise.resolve(true);
    } catch (err) {
        console.log(err, '==================');
        return Promise.resolve(false);
    }
}
