import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/test', component: '@/pages/index' },
    { path: '/dynamic-demo', component: '@/pages/Demo' },
  ],
  fastRefresh: {},
});
