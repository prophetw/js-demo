import { defineConfig } from 'umi'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/test', component: '@/pages/index' },
    { path: '/dynamic-demo', component: '@/pages/Demo/index' },
    { path: '/subs-demo', component: '@/pages/Demo/subsDemo' },
    { path: '/subs-demo1', component: '@/pages/Demo/subscription-demo' },
    { path: '/dd', component: '@/pages/ClipboardPaste' },
  ],
  fastRefresh: {},
  qiankun: {
    master: {
      // 注册子应用信息
      apps: [
        {
          name: 'app1', // 唯一 id
          entry: '//localhost:7001', // html entry
        },
        {
          name: 'app2', // 唯一 id
          entry: '//localhost:7002', // html entry
        },
      ],
    },
  },
})
