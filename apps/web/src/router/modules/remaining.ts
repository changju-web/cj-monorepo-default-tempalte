const Layout = () => import('@web/layout/index.vue')

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@web/views/login/index.vue'),
    meta: {
      title: '登录',
      showLink: false
    }
  },
  // 全屏403（无权访问）页面
  {
    path: '/access-denied',
    name: 'AccessDenied',
    component: () => import('@web/views/error/403.vue'),
    meta: {
      title: '403',
      showLink: false
    }
  },
  // 全屏500（服务器出错）页面
  {
    path: '/server-error',
    name: 'ServerError',
    component: () => import('@web/views/error/500.vue'),
    meta: {
      title: '500',
      showLink: false
    }
  },
  {
    path: '/redirect',
    component: Layout,
    meta: {
      title: '加载中...',
      showLink: false
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@web/layout/redirect.vue')
      }
    ]
  }
] satisfies Array<RouteConfigsTable>
