import Layout from '@/layout/index.vue';
export default [
    {
        path: '/',
        redirect: '/table',
        name: 'samples',
        meta: {
            visible: true,
            title: 'Samples',
            icon: 'mdi-cube-scan',
        },
        component: Layout,
        children: [
            {
                path: 'table',
                name: 'table',
                meta: {
                    title: 'Table',
                    icon: 'mdi-alpha-t',
                    keepAlive: false,
                    visible: true,
                },
                component: () => import('@/views/componets/table.vue'),
                children: [],
            },
        ],
    },
];
