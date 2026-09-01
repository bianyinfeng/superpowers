/**
 * 数据中台运营平台 (DataOps) - 主应用入口
 * 商业银行版 v2.4.1
 */
const { createApp, ref, reactive, computed, onMounted, watch } = Vue;
const { createRouter, createWebHashHistory, RouterLink, RouterView } = VueRouter;

function getMockData() {
  return window.MockData || {};
}

// ============================================================
// 路由配置
// ============================================================
const routes = [
  { path: '/',            component: window.DashboardView,    meta: { title: '运营看板' } },
  { path: '/requirements',component: window.RequirementsView, meta: { title: '数据需求管理' } },
  { path: '/workflow',    component: window.WorkflowView,     meta: { title: '审核流转' } },
  { path: '/standards',   component: window.StandardsView,    meta: { title: '数据标准匹配' } },
  { path: '/devspec',     component: window.DevSpecView,      meta: { title: '数据规范开发' } },
  { path: '/scripts',     component: window.ScriptsView,      meta: { title: '脚本管理' } },
  { path: '/deployment',  component: window.DeploymentView,   meta: { title: '灰度测试上线' } },
  { path: '/verification',component: window.VerificationView, meta: { title: '数据核验跑批' } },
  { path: '/metadata',    component: window.MetadataView,     meta: { title: '元数据管理' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// ============================================================
// 全局点击外部关闭指令
// ============================================================
const clickOutsideDirective = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};

// ============================================================
// 根组件
// ============================================================
const App = {
  data() {
    const mock = getMockData();
    return {
      loading: true,
      sidebarCollapsed: false,
      showNotifications: false,
      globalSearch: '',
      currentUser: mock.currentUser || { name: '当前用户', dept: '未知部门', avatar: '用' },
      notifications: Array.isArray(mock.notifications) ? mock.notifications : [],
    };
  },
  computed: {
    currentPageTitle() {
      return this.$route?.meta?.title || '数据中台';
    },
    unreadCount() {
      return this.notifications.filter(n => !n.read).length;
    },
    pendingCount() {
      const requirements = Array.isArray(getMockData().requirements) ? getMockData().requirements : [];
      return requirements.filter(r =>
        ['草稿', '待审核'].includes(r.status)
      ).length;
    },
    myApprovalCount() {
      const workflowSteps = Array.isArray(getMockData().workflowSteps) ? getMockData().workflowSteps : [];
      return workflowSteps.filter(s =>
        s.status === 'pending' && s.approver === (this.currentUser && this.currentUser.name)
      ).length;
    }
  },
  methods: {
    notifIcon(type) {
      const icons = { warning: '⚠️', info: 'ℹ️', error: '🚨', success: '✅' };
      return icons[type] || 'ℹ️';
    },
    markAllRead() {
      this.notifications.forEach(n => n.read = true);
    },
    doSearch() {
      if (this.globalSearch.trim()) {
        alert(`搜索功能: "${this.globalSearch}"\n（在实际部署中将跳转到搜索结果页）`);
      }
    }
  },
  mounted() {
    // 模拟加载
    setTimeout(() => { this.loading = false; }, 800);
  }
};

// ============================================================
// 创建并挂载应用
// ============================================================
function showBootError(error) {
  const message = error && error.stack ? error.stack : String(error);
  if (typeof window.__DATAOPS_SHOW_BOOT_ERROR === 'function') {
    window.__DATAOPS_SHOW_BOOT_ERROR(message);
  }
}

try {
  const start = async () => {
    if (typeof window.DataOpsBootstrap === 'function') {
      try {
        const bootstrapResult = await window.DataOpsBootstrap();
        if (bootstrapResult && bootstrapResult.failed && bootstrapResult.failed.length) {
          console.warn('DataOps backend bootstrap partial failures:', bootstrapResult.failed);
        }
      } catch (bootstrapError) {
        console.error('DataOps backend bootstrap failed, fallback to existing MockData.', bootstrapError);
      }
    }

    const app = createApp(App);
    app.config.errorHandler = (error) => {
      showBootError(error);
    };
    app.use(router);
    app.directive('click-outside', clickOutsideDirective);
    app.mount('#app');
  };

  start();
} catch (error) {
  showBootError(error);
}
