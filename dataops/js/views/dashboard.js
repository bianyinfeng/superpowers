window.DashboardView = {
  template: `
    <div class="dashboard-view page-shell">
      <style>
        .page-shell{font-family:"Microsoft YaHei",Arial,sans-serif;color:#1f2937}.panel-card,.stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
        .page-header,.stats-grid,.dashboard-main-grid,.dashboard-side-column,.dashboard-bottom-grid,.dashboard-header-meta,.summary-list,.alert-list,.funnel-list,.quality-chart,.batch-job-list{display:grid;gap:14px}
        .page-header{grid-template-columns:1.3fr 1fr;align-items:center;padding:18px;margin-bottom:16px}.dashboard-header-meta{grid-template-columns:repeat(3,minmax(0,1fr))}.meta-item{background:#f8fafc;padding:12px;border-radius:12px;border:1px solid #e2e8f0}
        .page-title{margin:0;font-size:28px;font-weight:700}.page-subtitle,.meta-label,.stat-label,.stat-desc,.req-meta,.alert-meta,.alert-time,.summary-subtitle,.batch-job-meta,.quality-label{color:#64748b;font-size:12px}.page-subtitle{margin-top:8px}
        .stats-grid{grid-template-columns:repeat(6,minmax(0,1fr));margin-bottom:16px}.stat-card{padding:16px}.stat-value{font-size:28px;font-weight:700;margin:8px 0}.dashboard-main-grid{grid-template-columns:2fr 1fr;margin-bottom:16px}.dashboard-bottom-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
        .panel-card{padding:16px}.panel-header{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.panel-header h3{margin:0;font-size:18px}.panel-tag,.status-badge,.priority-badge,.alert-level,.batch-pill{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700}
        .panel-tag{background:#eff6ff;color:#1d4ed8}.btn{border:none;background:transparent;cursor:pointer;font-weight:600}.btn-link{color:#2563eb}
        .requirement-row{display:grid;grid-template-columns:2.2fr 1fr .8fr 1fr 1fr;gap:12px;padding:14px 0;align-items:center;border-bottom:1px solid #e5e7eb;font-size:13px}.list-head{color:#64748b;font-weight:700;padding-top:0}.requirement-clickable{cursor:pointer}.requirement-clickable:hover{background:#f8fafc;margin:0 -12px;padding-left:12px;padding-right:12px;border-radius:10px}
        .req-title,.alert-title,.batch-job-name,.summary-title{font-weight:700}.summary-item,.alert-item,.batch-job-item{display:grid;gap:12px;align-items:start;padding:12px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}.summary-item,.batch-job-item{grid-template-columns:1fr auto}.alert-item{grid-template-columns:auto 1fr}.summary-value{font-size:24px}
        .funnel-item{display:grid;grid-template-columns:88px 1fr 48px;gap:10px;align-items:center}.funnel-bar-track{height:12px;background:#e2e8f0;border-radius:999px;overflow:hidden}.funnel-bar-fill{height:100%;background:linear-gradient(90deg,#2563eb,#0ea5e9)}
        .quality-chart{grid-template-columns:repeat(7,minmax(0,1fr));align-items:end;min-height:200px}.quality-bar-item{display:grid;gap:8px;justify-items:center}.quality-bar-track{width:100%;max-width:44px;height:150px;background:#e2e8f0;border-radius:12px 12px 6px 6px;display:flex;align-items:end;overflow:hidden}.quality-bar-fill{width:100%;background:linear-gradient(180deg,#38bdf8,#1d4ed8)}.quality-score{font-size:12px;font-weight:700}
        .batch-status-summary{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.status-review,.batch-pill.running{background:#dbeafe;color:#1d4ed8}.status-online,.batch-pill.success{background:#dcfce7;color:#15803d}.status-rejected,.batch-pill.failed{background:#fee2e2;color:#b91c1c}.status-pending,.batch-pill.blocked{background:#fef3c7;color:#b45309}.status-develop,.status-test,.status-default{background:#ede9fe;color:#6d28d9}
        .priority-urgent{background:#fee2e2;color:#b91c1c}.priority-high{background:#ffedd5;color:#c2410c}.priority-medium{background:#e0f2fe;color:#0369a1}.priority-low{background:#f1f5f9;color:#475569}.alert-high{background:#fee2e2;color:#b91c1c}.alert-medium{background:#dbeafe;color:#1d4ed8}.alert-low{background:#fef3c7;color:#b45309}.empty-state{text-align:center;color:#64748b;padding:24px 12px}
        @media (max-width:1200px){.stats-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.page-header,.dashboard-main-grid,.dashboard-bottom-grid{grid-template-columns:1fr}}@media (max-width:760px){.stats-grid,.dashboard-header-meta,.quality-chart,.requirement-row,.funnel-item{grid-template-columns:1fr}}
      </style>
      <div class="page-header panel-card">
        <div>
          <h2 class="page-title">数据中台运营看板</h2>
          <div class="page-subtitle">聚焦需求流转、数据质量、批量作业与系统告警态势</div>
        </div>
        <div class="dashboard-header-meta">
          <div class="meta-item"><div class="meta-label">当前日期</div><div><strong>{{ currentDate }}</strong></div></div>
          <div class="meta-item"><div class="meta-label">当前用户</div><div><strong>{{ currentUser.name || '数据运营经理' }}</strong></div></div>
          <div class="meta-item"><div class="meta-label">所属角色</div><div><strong>{{ currentUser.role || '中台值班' }}</strong></div></div>
        </div>
      </div>
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card">
          <div class="stat-label">{{ stat.label }}</div><div class="stat-value">{{ stat.value }}</div><div class="stat-desc">{{ stat.desc }}</div>
        </div>
      </div>
      <div class="dashboard-main-grid">
        <div class="panel-card">
          <div class="panel-header"><h3>近期需求动态</h3><button class="btn btn-link" @click="goToRequirements()">查看全部</button></div>
          <div class="requirement-row list-head"><span>需求信息</span><span>状态</span><span>优先级</span><span>提交人</span><span>提交日期</span></div>
          <div v-for="item in recentRequirements" :key="item.id" class="requirement-row requirement-clickable" @click="goToRequirements(item)">
            <div><div class="req-title">{{ item.title }}</div><div class="req-meta">{{ item.id }} · {{ item.businessUnit || '未分配条线' }}</div></div>
            <span :class="['status-badge', statusClass(item.status)]">{{ statusText(item.status) }}</span>
            <span :class="['priority-badge', priorityClass(item.priority)]">{{ priorityText(item.priority) }}</span>
            <span>{{ item.submitter || '--' }}</span><span>{{ formatDate(item.submitDate) }}</span>
          </div>
          <div v-if="!recentRequirements.length" class="empty-state">暂无需求数据</div>
        </div>
        <div class="dashboard-side-column">
          <div class="panel-card">
            <div class="panel-header"><h3>待办审核汇总</h3><span class="panel-tag">按类型</span></div>
            <div class="summary-list"><div v-for="item in workflowSummary" :key="item.label" class="summary-item"><div><div class="summary-title">{{ item.label }}</div><div class="summary-subtitle">{{ item.desc }}</div></div><div class="summary-value">{{ item.count }}</div></div></div>
          </div>
          <div class="panel-card">
            <div class="panel-header"><h3>系统告警</h3><span class="panel-tag">实时通知</span></div>
            <div class="alert-list">
              <div v-for="item in systemAlerts" :key="item.id" class="alert-item"><span :class="['alert-level', alertLevelClass(item.level)]">{{ alertLevelText(item.level) }}</span><div><div class="alert-title">{{ item.title }}</div><div class="alert-meta">{{ item.message }}</div><div class="alert-time">{{ formatDateTime(item.time) }}</div></div></div>
              <div v-if="!systemAlerts.length" class="empty-state">暂无系统告警</div>
            </div>
          </div>
        </div>
      </div>
      <div class="dashboard-bottom-grid">
        <div class="panel-card"><div class="panel-header"><h3>需求流转漏斗</h3><span class="panel-tag">8 阶段</span></div><div class="funnel-list"><div v-for="stage in funnelStages" :key="stage.name" class="funnel-item"><div>{{ stage.name }}</div><div class="funnel-bar-track"><div class="funnel-bar-fill" :style="{ width: stage.width }"></div></div><div>{{ stage.count }}</div></div></div></div>
        <div class="panel-card"><div class="panel-header"><h3>数据质量趋势</h3><span class="panel-tag">近 7 日</span></div><div class="quality-chart"><div v-for="item in qualityBars" :key="item.label" class="quality-bar-item"><div class="quality-bar-track"><div class="quality-bar-fill" :style="{ height: item.height }"></div></div><div class="quality-score">{{ item.score }}%</div><div class="quality-label">{{ item.label }}</div></div></div></div>
        <div class="panel-card"><div class="panel-header"><h3>今日跑批状态</h3><span class="panel-tag">任务概览</span></div><div class="batch-status-summary"><span class="batch-pill running">运行中 {{ batchSummary.running }}</span><span class="batch-pill success">成功 {{ batchSummary.success }}</span><span class="batch-pill failed">失败 {{ batchSummary.failed }}</span><span class="batch-pill blocked">阻塞 {{ batchSummary.blocked }}</span></div><div class="batch-job-list"><div v-for="job in batchSummary.jobs" :key="job.id" class="batch-job-item"><div><div class="batch-job-name">{{ job.name }}</div><div class="batch-job-meta">{{ job.owner || '系统任务' }} · {{ job.schedule || '今日批次' }}</div></div><span :class="['status-badge', statusClass(job.status)]">{{ statusText(job.status) }}</span></div><div v-if="!batchSummary.jobs.length" class="empty-state">暂无跑批任务</div></div></div>
      </div>
    </div>
  `,
  data: function () {
    return { currentDate: '', currentUser: {}, requirements: [], workflows: [], notifications: [], batchJobs: [], qualityTrendData: [], metadataCoverage: 0 };
  },
  computed: {
    pendingRequirementsCount: function () { return this.requirements.filter(function (item) { return !/上线|驳回|撤回|reject|online/i.test(item.status || ''); }).length; },
    todayOnlineCount: function () { var today = this.dateKey(new Date()); return this.requirements.filter(function (item) { return /上线|online/i.test(item.status || '') && this.dateKey(item.onlineDate || item.updatedAt) === today; }, this).length; },
    scriptReviewCount: function () { return this.workflows.filter(function (item) { return /待|审核|review|pending/i.test(item.status || '') && /技术|脚本|开发/.test(item.currentStage || ''); }).length; },
    metadataCoverageRate: function () { return Number(this.metadataCoverage || 0); },
    batchSummary: function () { var s = { running: 0, success: 0, failed: 0, blocked: 0, jobs: this.batchJobs.slice(0, 8) }; this.batchJobs.forEach(function (job) { var st = String(job.status || ''); if (/运行|run/i.test(st)) s.running += 1; else if (/成功|完成|success|online/i.test(st)) s.success += 1; else if (/失败|异常|fail/i.test(st)) s.failed += 1; else if (/阻塞|等待|block/i.test(st)) s.blocked += 1; }); return s; },
    batchSuccessRate: function () { return this.batchJobs.length ? Math.round(this.batchSummary.success * 100 / this.batchJobs.length) : 0; },
    qualityBars: function () { return this.qualityTrendData.slice(-7).map(function (item, idx) { var score = Number(item.score || item.value || 0); var label = String(item.label || item.date || ('D' + (idx + 1))); return { label: label.slice(-5), score: score, height: Math.max(10, Math.round(score * 1.5)) + 'px' }; }); },
    statCards: function () { var latestScore = this.qualityBars.length ? this.qualityBars[this.qualityBars.length - 1].score : 0; return [{ label: '待处理需求', value: this.pendingRequirementsCount, desc: '待完成需求总量' }, { label: '今日上线', value: this.todayOnlineCount, desc: '当日已发布需求' }, { label: '数据质量得分', value: latestScore + '%', desc: '最近一天评分' }, { label: '脚本复核中', value: this.scriptReviewCount, desc: '技术/脚本审核中' }, { label: '跑批成功率', value: this.batchSuccessRate + '%', desc: '按作业结果统计' }, { label: '元数据覆盖率', value: this.metadataCoverageRate + '%', desc: '元数据资产完备度' }]; },
    recentRequirements: function () { return this.requirements.slice().sort(this.sortByDateDesc).slice(0, 8); },
    workflowSummary: function () { var map = { '业务审核': 0, '数据审核': 0, '技术审核': 0, '合规审核': 0 }; this.workflows.forEach(function (item) { if (/待|审核|review|pending/i.test(item.status || '')) map[this.stageType(item.currentStage)] += 1; }, this); return [{ label: '业务审核', count: map['业务审核'], desc: '业务需求确认' }, { label: '数据审核', count: map['数据审核'], desc: '数据口径校核' }, { label: '技术审核', count: map['技术审核'], desc: '脚本与任务评估' }, { label: '合规审核', count: map['合规审核'], desc: '权限与监管校验' }]; },
    systemAlerts: function () { return this.notifications.slice().sort(this.sortNoticeDesc).slice(0, 6); },
    funnelStages: function () { var names = ['需求提交', '业务审核', '数据审核', '技术审核', '合规审核', '开发', '测试', '上线']; var counts = {}; names.forEach(function (n) { counts[n] = 0; }); this.requirements.forEach(function (item) { counts[this.normalizeStage(item)] += 1; }, this); var max = Math.max.apply(null, names.map(function (n) { return counts[n]; }).concat([1])); return names.map(function (name) { return { name: name, count: counts[name], width: Math.max(12, Math.round(counts[name] * 100 / max)) + '%' }; }); }
  },
  methods: {
    loadData: function () { var source = window.MockData || {}; this.currentUser = JSON.parse(JSON.stringify(source.currentUser || source.user || {})); this.requirements = (source.requirements || source.requirementList || source.demands || []).map(this.normalizeRequirement); this.workflows = (source.workflows || source.workflowList || source.approvals || []).map(this.normalizeWorkflow); this.notifications = (source.notifications || source.alerts || source.messages || []).map(this.normalizeNotification); this.batchJobs = (source.batchJobs || source.jobs || source.batchList || []).map(this.normalizeBatchJob); this.qualityTrendData = (source.qualityTrend || source.dataQualityTrend || source.qualityScores || []).map(function (item) { return { label: item.label || item.date || item.day || '', score: Number(item.score || item.value || 0) }; }); this.metadataCoverage = Number(source.metadataCoverage || source.metadataRate || (source.metadata && (source.metadata.coverage || source.metadata.coverageRate)) || 0); },
    normalizeRequirement: function (item, idx) { return { id: item.id || item.code || item.requirementId || ('REQ-' + idx), title: item.title || item.name || item.requirementName || '未命名需求', businessUnit: item.businessUnit || item.businessLine || item.department || '', priority: item.priority || item.level || item.urgency || '中', status: item.status || item.currentStatus || '待处理', currentStage: item.currentStage || item.stage || '', submitter: item.submitter || item.creator || item.owner || '', submitDate: item.submitDate || item.createdAt || '', updatedAt: item.updatedAt || item.updateTime || '', onlineDate: item.onlineDate || item.goLiveDate || '' }; },
    normalizeWorkflow: function (item, idx) { return { id: item.id || item.code || ('WF-' + idx), status: item.status || item.currentStatus || '待处理', currentStage: item.currentStage || item.stage || item.stepName || '' }; },
    normalizeNotification: function (item, idx) { return { id: item.id || ('NOTICE-' + idx), title: item.title || item.name || '系统通知', message: item.message || item.content || '', level: item.level || item.type || 'info', time: item.time || item.createdAt || item.timestamp || '' }; },
    normalizeBatchJob: function (item, idx) { return { id: item.id || item.jobId || ('JOB-' + idx), name: item.name || item.jobName || '未命名作业', owner: item.owner || item.operator || '', schedule: item.schedule || item.batchWindow || item.runTime || '', status: item.status || item.result || item.state || '待处理' }; },
    statusText: function (status) { var s = String(status || ''); if (/驳回|撤回|reject|fail/i.test(s)) return '已驳回'; if (/上线|成功|完成|online|success/i.test(s)) return '已上线'; if (/测试|test/i.test(s)) return '测试中'; if (/开发|实施|develop/i.test(s)) return '开发中'; if (/审核|审批|review/i.test(s)) return '审核中'; return '待处理'; },
    statusClass: function (status) { var s = this.statusText(status); return s === '已上线' ? 'status-online' : s === '已驳回' ? 'status-rejected' : s === '审核中' ? 'status-review' : s === '待处理' ? 'status-pending' : s === '开发中' ? 'status-develop' : s === '测试中' ? 'status-test' : 'status-default'; },
    priorityText: function (priority) { var s = String(priority || ''); if (/P0|紧急/i.test(s)) return '紧急'; if (/P1|高/i.test(s)) return '高'; if (/P3|低/i.test(s)) return '低'; return '中'; },
    priorityClass: function (priority) { var s = this.priorityText(priority); return s === '紧急' ? 'priority-urgent' : s === '高' ? 'priority-high' : s === '低' ? 'priority-low' : 'priority-medium'; },
    alertLevelText: function (level) { var s = String(level || ''); if (/critical|error|high|高/i.test(s)) return '高'; if (/warn|medium|中/i.test(s)) return '中'; return '低'; },
    alertLevelClass: function (level) { var s = this.alertLevelText(level); return s === '高' ? 'alert-high' : s === '中' ? 'alert-medium' : 'alert-low'; },
    stageType: function (stage) { var s = String(stage || ''); if (/合规/.test(s)) return '合规审核'; if (/技术|脚本|开发/.test(s)) return '技术审核'; if (/数据/.test(s)) return '数据审核'; return '业务审核'; },
    normalizeStage: function (item) { var s = String(item.currentStage || item.stage || item.status || ''); if (/上线/.test(s) || /online/i.test(s)) return '上线'; if (/测试/.test(s)) return '测试'; if (/开发|实施/.test(s)) return '开发'; if (/合规/.test(s)) return '合规审核'; if (/技术|脚本/.test(s)) return '技术审核'; if (/数据/.test(s)) return '数据审核'; if (/业务/.test(s)) return '业务审核'; return '需求提交'; },
    formatDate: function (value) { if (!value) return '--'; var d = new Date(value); if (isNaN(d.getTime())) return value; return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    formatDateTime: function (value) { if (!value) return '--'; var d = new Date(value); if (isNaN(d.getTime())) return value; return this.formatDate(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); },
    dateKey: function (value) { if (!value) return ''; return this.formatDate(value instanceof Date ? value : new Date(value)); },
    sortByDateDesc: function (a, b) { return new Date(b.submitDate || b.updatedAt || 0).getTime() - new Date(a.submitDate || a.updatedAt || 0).getTime(); },
    sortNoticeDesc: function (a, b) { return new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime(); },
    goToRequirements: function (item) { this.$router.push({ path: '/requirements', query: item ? { requirementId: item.id } : {} }); }
  },
  mounted: function () { this.currentDate = this.formatDate(new Date()); this.loadData(); }
};
