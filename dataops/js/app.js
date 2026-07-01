/**
 * 数据中台运营平台 (DataOps) - 主应用入口
 * 商业银行版 v2.4.1
 */
const { createApp, ref, reactive, computed, onMounted, watch } = Vue;
const { createRouter, createWebHashHistory, RouterLink, RouterView } = VueRouter;

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
    return {
      loading: true,
      sidebarCollapsed: false,
      showNotifications: false,
      globalSearch: '',
      currentUser: window.MockData.currentUser,
      notifications: window.MockData.notifications,
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
      return window.MockData.requirements.filter(r =>
        ['草稿', '待审核'].includes(r.status)
      ).length;
    },
    myApprovalCount() {
      return window.MockData.workflowSteps.filter(s =>
        s.status === 'pending' && s.approver === this.currentUser.name
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
const app = createApp(App);
app.use(router);
app.directive('click-outside', clickOutsideDirective);
app.mount('#app');
