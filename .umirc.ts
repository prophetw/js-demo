import { defineConfig } from 'umi'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/upload', component: '@/pages/uploadQueue' },
  ],
  fastRefresh: {},
})
