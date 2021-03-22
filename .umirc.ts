import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/test', component: '@/pages/index' },
    { path: '/dynamic-demo', component: '@/pages/Demo/index' },
    { path: '/subs-demo', component: '@/pages/Demo/subsDemo' },
    { path: '/subs-demo1', component: '@/pages/Demo/subscription-demo' },
  ],
  fastRefresh: {},
});
