import type { CurrentUserDetail } from '@/api/auth';
import type { Role } from '@/api/role';
import { ApiUser } from '@/api/user';
import router from '@/router';
import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

export const userInfoTemplate = {
    id: 0,
    username: '',
    enable: true,
    createTime: '',
    updateTime: '',
    profile: {
        id: 0,
        nickName: '',
        gender: 0,
        avatar: '',
        address: '',
        email: '',
        userId: 4,
    },
    roles: [] as Role[],
    currentRole: {
        id: 0,
        code: '',
        name: '',
        enable: true,
        permissionIds: [] as number[],
    },
};

export const useAuthStore = defineStore('auth', () => {
    const menus = ref<RouteRecordRaw[]>(cloneDeep(router.options.routes) as RouteRecordRaw[]);

    const addMenu = (menu: RouteRecordRaw) => {
        menus.value.push(cloneDeep(menu));
    };
    /**
     * 重置菜单
     * 切换角色应该回出现BUG
     */
    const resetMenu = () => {
        menus.value = cloneDeep(router.options.routes) as RouteRecordRaw[];
    };

    const userDetail = ref<CurrentUserDetail>(cloneDeep(userInfoTemplate));

    const setUserDetail = (data = cloneDeep(userInfoTemplate)) => {
        userDetail.value = data;
    };

    const logout = async () => {
        try {
            await ApiUser.logout();
        } catch (error) {
            console.warn('退出登录API调用失败，但仍继续清理本地数据:', error);
        } finally {
            // 无论API是否成功，都清理本地数据并跳转
            localStorage.removeItem('accessToken');
            localStorage.clear(); // 清理所有本地存储
            router.push('/login');
            // 延迟刷新，确保路由跳转完成
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    };

    return {
        menus,
        addMenu,
        resetMenu,
        userDetail,
        setUserDetail,
        logout,
    };
});
