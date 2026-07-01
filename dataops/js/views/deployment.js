(function () {
  const ENV_FLOW = ['DEV', 'SIT', 'UAT', 'GRAY', 'PRD'];
  const mock = window.MockData || {};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pickArray(name, fallback) {
    return Array.isArray(mock[name]) && mock[name].length ? clone(mock[name]) : clone(fallback);
  }

  function linkedName(item) {
    return item.requirementName || item.requirement || item.scriptName || item.script || '-';
  }

  function ensurePool(pool, fallback, idPrefix, namePrefix) {
    var list = Array.isArray(pool) ? clone(pool) : [];
    var i;
    for (i = 0; i < fallback.length; i += 1) {
      if (!list[i]) {
        list[i] = clone(fallback[i]);
      }
    }
    for (i = 0; i < list.length; i += 1) {
      if (!list[i]) {
        list[i] = {};
      }
      list[i].id = list[i].id || (idPrefix + '-' + String(i + 1).padStart(3, '0'));
      list[i].name = list[i].name || list[i].title || (namePrefix + ' ' + (i + 1));
    }
    return list;
  }

  const requirementSeed = [
    { id: 'REQ-2024-101', name: '零售客户统一视图增强' },
    { id: 'REQ-2024-118', name: '对公网银交易明细灰度校验' },
    { id: 'REQ-2024-126', name: '监管报送口径修复' },
    { id: 'REQ-2024-139', name: '手机银行营销标签重算' }
  ];
  const requirementPool = ensurePool(pickArray('requirements', requirementSeed), requirementSeed, 'REQ-AUTO', '自动需求');

  const scriptSeed = [
    { id: 'SCR-ODS-301', name: 'ods_cust_profile_merge.sql' },
    { id: 'SCR-DWD-412', name: 'dwd_public_trade_delta.sql' },
    { id: 'SCR-DWS-225', name: 'dws_regulatory_snapshot_fix.sql' },
    { id: 'SCR-ADS-118', name: 'ads_mobile_marketing_tag.sql' }
  ];
  const scriptPool = ensurePool(pickArray('scripts', scriptSeed), scriptSeed, 'SCR-AUTO', 'auto_script.sql');

  const defaultDeployments = [
    {
      id: 'DEP-240901',
      name: '零售客户统一视图 V3.2',
      requirementId: requirementPool[0].id,
      requirementName: requirementPool[0].name,
      scriptId: scriptPool[0].id,
      scriptName: scriptPool[0].name,
      currentEnv: 'SIT',
      status: '测试中',
      progress: 42,
      operator: '王欣',
      updatedAt: '2024-09-20 10:25',
      readyToAdvance: true,
      testSummary: 'SIT 核验通过率 97.6%，待完成性能回归。',
      testReport: [
        { item: '主键唯一性', result: '通过', detail: '冲突记录 0 条' },
        { item: '指标口径比对', result: '通过', detail: '与现网偏差 0.12%' },
        { item: '批量性能', result: '待确认', detail: '耗时 18 分钟，接近阈值' }
      ],
      steps: ['脚本打包', 'SIT 冒烟', 'UAT 验收', '灰度放量', '生产切换']
    },
    {
      id: 'DEP-240902',
      name: '对公网银交易明细修复',
      requirementId: requirementPool[1].id,
      requirementName: requirementPool[1].name,
      scriptId: scriptPool[1].id,
      scriptName: scriptPool[1].name,
      currentEnv: 'GRAY',
      status: '灰度中',
      progress: 78,
      operator: '陈昊',
      updatedAt: '2024-09-20 09:10',
      readyToAdvance: true,
      testSummary: '灰度 20% 流量稳定，等待业务确认扩大流量。',
      testReport: [
        { item: '对账平衡', result: '通过', detail: 'T+0 交易差异 0 条' },
        { item: '高频查询响应', result: '通过', detail: 'P95 2.1 秒' },
        { item: '灰度投诉监控', result: '通过', detail: '暂无异常反馈' }
      ],
      steps: ['脚本打包', 'SIT 冒烟', 'UAT 验收', '灰度放量', '生产切换']
    },
    {
      id: 'DEP-240903',
      name: '监管报送客户风险分类修正',
      requirementId: requirementPool[2].id,
      requirementName: requirementPool[2].name,
      scriptId: scriptPool[2].id,
      scriptName: scriptPool[2].name,
      currentEnv: 'PRD',
      status: '已上线',
      progress: 100,
      operator: '李珂',
      updatedAt: '2024-09-19 22:18',
      readyToAdvance: false,
      testSummary: '生产投产完成，指标监控平稳。',
      testReport: [
        { item: '报送样本抽查', result: '通过', detail: '抽样 5000 笔全部一致' },
        { item: '任务耗时', result: '通过', detail: '较旧版本缩短 11%' },
        { item: '回滚预案', result: '通过', detail: '已完成演练' }
      ],
      steps: ['脚本打包', 'SIT 冒烟', 'UAT 验收', '灰度放量', '生产切换']
    },
    {
      id: 'DEP-240904',
      name: '手机银行营销标签增量同步',
      requirementId: requirementPool[3].id,
      requirementName: requirementPool[3].name,
      scriptId: scriptPool[3].id,
      scriptName: scriptPool[3].name,
      currentEnv: 'UAT',
      status: '待部署',
      progress: 24,
      operator: '赵晴',
      updatedAt: '2024-09-20 08:40',
      readyToAdvance: false,
      testSummary: '等待 UAT 验收窗口开放。',
      testReport: [
        { item: '字段映射', result: '通过', detail: '标签口径已核对' },
        { item: '增量抽取', result: '通过', detail: 'CDC 解析正常' },
        { item: '营销圈选', result: '待确认', detail: '待业务验收' }
      ],
      steps: ['脚本打包', 'SIT 冒烟', 'UAT 验收', '灰度放量', '生产切换']
    },
    {
      id: 'DEP-240905',
      name: '贵宾客户资产快照回退',
      requirementId: 'REQ-2024-088',
      requirementName: '贵宾客户资产快照修复',
      scriptId: 'SCR-DWS-090',
      scriptName: 'dws_vip_asset_snapshot_fix.sql',
      currentEnv: 'GRAY',
      status: '回滚中',
      progress: 63,
      operator: '周岚',
      updatedAt: '2024-09-20 07:35',
      readyToAdvance: false,
      testSummary: '灰度发现口径偏差，正在执行回滚。',
      testReport: [
        { item: '灰度对比', result: '失败', detail: '资产余额偏差 1.8%' },
        { item: '补数任务', result: '处理中', detail: '正在清理异常批次' }
      ],
      steps: ['灰度异常', '回滚审批', '执行回退', '数据修复', '恢复监控']
    }
  ];

  const defaultEnvironments = [
    { name: 'DEV', health: 'healthy', database: 'MySQL-ODS-DEV', servers: 4, lastCheck: '09:58:11', cpu: 36, memory: 54, deployments: ['零售客户统一视图 V3.2', '手机银行营销标签增量同步'] },
    { name: 'SIT', health: 'healthy', database: 'Hive-SIT-01', servers: 6, lastCheck: '09:58:03', cpu: 48, memory: 62, deployments: ['零售客户统一视图 V3.2'] },
    { name: 'UAT', health: 'warning', database: 'Oracle-UAT-02', servers: 5, lastCheck: '09:57:55', cpu: 72, memory: 76, deployments: ['手机银行营销标签增量同步'] },
    { name: 'GRAY', health: 'warning', database: 'Hive-GRAY-01', servers: 8, lastCheck: '09:57:48', cpu: 67, memory: 71, deployments: ['对公网银交易明细修复', '贵宾客户资产快照回退'] },
    { name: 'PRD', health: 'healthy', database: 'Greenplum-PRD-A', servers: 12, lastCheck: '09:57:36', cpu: 51, memory: 64, deployments: ['监管报送客户风险分类修正'] }
  ];

  const defaultGrayAlerts = [
    { level: '警告', title: '灰度节点 2 出现短时 CPU 抖动', time: '09:40', status: '已恢复' },
    { level: '提示', title: '生产对照组执行时间高于昨日均值 6%', time: '09:46', status: '观察中' },
    { level: '严重', title: '贵宾客户资产快照差异率触发回滚阈值', time: '07:31', status: '处理中' }
  ];

  const defaultRecords = [
    { orderNo: 'REL-20240920-001', scriptName: 'ods_cust_profile_merge.sql', env: 'GRAY→PRD', type: '变更', applicant: '王欣', reviewer: '张睿', time: '2024-09-20 09:30', result: '成功' },
    { orderNo: 'REL-20240920-002', scriptName: 'dws_vip_asset_snapshot_fix.sql', env: 'GRAY', type: '回滚', applicant: '周岚', reviewer: '刘宁', time: '2024-09-20 07:36', result: '回滚' },
    { orderNo: 'REL-20240919-014', scriptName: 'dws_regulatory_snapshot_fix.sql', env: 'PRD', type: '新增', applicant: '李珂', reviewer: '徐航', time: '2024-09-19 22:18', result: '成功' },
    { orderNo: 'REL-20240918-009', scriptName: 'ads_marketing_tag_refresh.sql', env: 'UAT', type: '变更', applicant: '赵晴', reviewer: '陈璐', time: '2024-09-18 16:05', result: '失败' }
  ];

  window.DeploymentView = {
    template: `
      <div class="deployment-view deploy-shell">
        <style>
          .deploy-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
          .deploy-shell .page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
          .deploy-shell .subtle { color: #6b7280; font-size: 13px; }
          .deploy-shell .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); }
          .deploy-shell .panel { padding: 16px; }
          .deploy-shell .tab-row, .deploy-shell .actions, .deploy-shell .pipeline, .deploy-shell .metric-row, .deploy-shell .table-actions { display: flex; gap: 8px; flex-wrap: wrap; }
          .deploy-shell .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 16px; cursor: pointer; font-weight: 600; }
          .deploy-shell .tab-btn.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
          .deploy-shell .summary-grid, .deploy-shell .deploy-grid, .deploy-shell .env-grid, .deploy-shell .two-col, .deploy-shell .form-grid { display: grid; gap: 14px; }
          .deploy-shell .summary-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); margin-bottom: 16px; }
          .deploy-shell .deploy-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .deploy-shell .env-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .deploy-shell .two-col { grid-template-columns: 1.1fr 0.9fr; align-items: start; }
          .deploy-shell .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .deploy-shell .summary-card { padding: 16px; border-radius: 14px; background: linear-gradient(135deg, #eff6ff, #ffffff); border: 1px solid #dbeafe; }
          .deploy-shell .summary-label { color: #6b7280; font-size: 12px; }
          .deploy-shell .summary-value { font-size: 26px; font-weight: 700; margin-top: 8px; }
          .deploy-shell .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .deploy-shell .badge-blue { background: #dbeafe; color: #1d4ed8; }
          .deploy-shell .badge-green { background: #dcfce7; color: #15803d; }
          .deploy-shell .badge-orange { background: #ffedd5; color: #c2410c; }
          .deploy-shell .badge-red { background: #fee2e2; color: #b91c1c; }
          .deploy-shell .badge-gray { background: #f3f4f6; color: #4b5563; }
          .deploy-shell .badge-purple { background: #ede9fe; color: #6d28d9; }
          .deploy-shell .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
          .deploy-shell .btn-primary { background: #1d4ed8; color: #fff; }
          .deploy-shell .btn-secondary { background: #eff6ff; color: #1d4ed8; }
          .deploy-shell .btn-muted { background: #f3f4f6; color: #374151; }
          .deploy-shell .btn-danger { background: #fee2e2; color: #b91c1c; }
          .deploy-shell .btn-link { background: transparent; color: #1d4ed8; padding: 0; }
          .deploy-shell .deploy-card { padding: 18px; cursor: pointer; transition: all .2s ease; }
          .deploy-shell .deploy-card:hover { border-color: #93c5fd; transform: translateY(-2px); }
          .deploy-shell .pipeline-step { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
          .deploy-shell .pipeline-dot { width: 12px; height: 12px; border-radius: 50%; background: #d1d5db; box-shadow: inset 0 0 0 2px rgba(255,255,255,.7); }
          .deploy-shell .pipeline-step.active .pipeline-dot { background: #2563eb; }
          .deploy-shell .pipeline-step.done .pipeline-dot { background: #16a34a; }
          .deploy-shell .pipeline-arrow { color: #94a3b8; font-size: 12px; }
          .deploy-shell .progress { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
          .deploy-shell .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #0ea5e9); }
          .deploy-shell .progress-bar.warn { background: linear-gradient(90deg, #f59e0b, #fb7185); }
          .deploy-shell .health-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
          .deploy-shell .healthy { background: #16a34a; }
          .deploy-shell .warning { background: #f59e0b; }
          .deploy-shell .down { background: #dc2626; }
          .deploy-shell .input, .deploy-shell .select, .deploy-shell textarea { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
          .deploy-shell textarea { min-height: 80px; resize: vertical; }
          .deploy-shell .range-row { display: grid; grid-template-columns: 1fr 70px; gap: 12px; align-items: center; }
          .deploy-shell .table-wrap { overflow: auto; }
          .deploy-shell table { width: 100%; border-collapse: collapse; }
          .deploy-shell th, .deploy-shell td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 13px; vertical-align: top; }
          .deploy-shell th { background: #f8fafc; font-weight: 700; }
          .deploy-shell .alert-item, .deploy-shell .detail-block { padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f8fafc; }
          .deploy-shell .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
          .deploy-shell .modal-card { background: #fff; border-radius: 16px; width: min(960px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
          .deploy-shell .mini-table td, .deploy-shell .mini-table th { padding: 8px 10px; font-size: 12px; }
          @media (max-width: 1200px) {
            .deploy-shell .summary-grid, .deploy-shell .env-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .deploy-shell .deploy-grid, .deploy-shell .two-col, .deploy-shell .form-grid { grid-template-columns: 1fr; }
          }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px;">
          <div>
            <h1 class="page-title">灰度测试上线管理</h1>
            <div class="subtle">统一管理数据脚本从 DEV 到 PRD 的推进、灰度放量、回滚预案与上线留痕。</div>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" @click="simulateRefresh">刷新监控</button>
            <button class="btn btn-primary" @click="activeTab = 'deployment'">查看当前部署</button>
          </div>
        </div>

        <div class="tab-row" style="margin-bottom:16px;">
          <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>

        <div v-if="activeTab === 'deployment'">
          <div class="summary-grid">
            <div class="summary-card" v-for="item in deploymentStats" :key="item.label">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </div>

          <div class="deploy-grid">
            <div class="card deploy-card" v-for="item in deployments" :key="item.id" @click="openDetail(item)">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
                <div>
                  <div style="font-size:18px; font-weight:700; margin-bottom:6px;">{{ item.name }}</div>
                  <div class="subtle">需求：{{ item.requirementId }}｜{{ item.requirementName }}</div>
                  <div class="subtle">脚本：{{ item.scriptId }}｜{{ item.scriptName }}</div>
                </div>
                <span class="badge" :class="statusClass(item.status)">{{ item.status }}</span>
              </div>

              <div class="pipeline" style="margin:16px 0 12px; align-items:center;">
                <template v-for="(env, idx) in envFlow" :key="env">
                  <div class="pipeline-step" :class="pipelineClass(item.currentEnv, env)">
                    <span class="pipeline-dot"></span>
                    <span>{{ env }}</span>
                  </div>
                  <span v-if="idx < envFlow.length - 1" class="pipeline-arrow">→</span>
                </template>
              </div>

              <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; gap:10px; font-size:13px; margin-bottom:6px;">
                  <span>当前进度</span>
                  <strong>{{ item.progress }}%</strong>
                </div>
                <div class="progress"><div class="progress-bar" :class="{ warn: item.status === '回滚中' }" :style="{ width: item.progress + '%' }"></div></div>
              </div>

              <div class="metric-row" style="justify-content:space-between; margin-bottom:12px;">
                <span class="subtle">最近更新：{{ item.updatedAt }}</span>
                <span class="subtle">操作人：{{ item.operator }}</span>
              </div>

              <div class="table-actions" @click.stop>
                <button class="btn btn-primary" v-if="item.readyToAdvance && item.currentEnv !== 'PRD' && item.status !== '回滚中'" @click="advanceDeployment(item)">推进环境</button>
                <button class="btn btn-secondary" @click="viewTestReport(item)">查看测试报告</button>
                <button class="btn btn-danger" v-if="item.status !== '回滚中'" @click="requestRollback(item)">申请回滚</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'environment'">
          <div class="env-grid" style="margin-bottom:16px;">
            <div class="card panel" v-for="env in environments" :key="env.name">
              <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:10px;">
                <strong style="font-size:18px;">{{ env.name }}</strong>
                <div class="actions" style="align-items:center;">
                  <span class="health-dot" :class="env.health"></span>
                  <span class="badge" :class="healthBadgeClass(env.health)">{{ healthLabel(env.health) }}</span>
                </div>
              </div>
              <div class="subtle" style="margin-bottom:10px;">连接库：{{ env.database }}</div>
              <div class="detail-block">
                <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; font-size:13px;">
                  <div><strong>服务器：</strong>{{ env.servers }} 台</div>
                  <div><strong>最后巡检：</strong>{{ env.lastCheck }}</div>
                  <div><strong>CPU：</strong>{{ env.cpu }}%</div>
                  <div><strong>内存：</strong>{{ env.memory }}%</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card panel table-wrap">
            <div style="display:flex; justify-content:space-between; gap:16px; align-items:center; margin-bottom:10px;">
              <h2 style="margin:0; font-size:18px;">各环境当前部署分布</h2>
              <span class="subtle">按环境查看正在运行或待切换的部署脚本</span>
            </div>
            <table class="mini-table">
              <thead>
                <tr>
                  <th>环境</th>
                  <th>健康状态</th>
                  <th>当前部署</th>
                  <th>脚本数量</th>
                  <th>建议动作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="env in environments" :key="env.name + '-table'">
                  <td><strong>{{ env.name }}</strong></td>
                  <td><span class="badge" :class="healthBadgeClass(env.health)">{{ healthLabel(env.health) }}</span></td>
                  <td>{{ env.deployments.join('、') || '无' }}</td>
                  <td>{{ env.deployments.length }}</td>
                  <td>{{ env.health === 'healthy' ? '可继续推进' : (env.health === 'warning' ? '建议观察指标' : '暂停发版') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'gray'" class="two-col">
          <div>
            <div class="card panel" style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px;">
                <h2 style="margin:0; font-size:18px;">灰度流量配置</h2>
                <span class="badge badge-purple">当前灰度：{{ activeGrayDeployment ? activeGrayDeployment.name : '-' }}</span>
              </div>
              <div class="form-grid">
                <div>
                  <label class="subtle">选择灰度发布对象</label>
                  <select class="select" v-model="grayConfig.deploymentId">
                    <option v-for="item in grayCandidates" :key="item.id" :value="item.id">{{ item.id }}｜{{ item.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="subtle">选择灰度用户群体</label>
                  <select class="select" v-model="grayConfig.userGroup">
                    <option value="VIP客户">VIP客户</option>
                    <option value="特定部门">特定部门</option>
                    <option value="随机20%">随机20%</option>
                    <option value="随机50%">随机50%</option>
                  </select>
                </div>
                <div style="grid-column:1 / -1;">
                  <label class="subtle">流量百分比</label>
                  <div class="range-row">
                    <input type="range" min="5" max="100" step="5" v-model.number="grayConfig.traffic" />
                    <strong>{{ grayConfig.traffic }}%</strong>
                  </div>
                </div>
                <div>
                  <label class="subtle">开始时间</label>
                  <input class="input" type="date" v-model="grayConfig.startDate" />
                </div>
                <div>
                  <label class="subtle">结束时间</label>
                  <input class="input" type="date" v-model="grayConfig.endDate" />
                </div>
                <div>
                  <label class="subtle">自动回滚条件：错误率 &gt; X%</label>
                  <input class="input" type="number" min="0" step="0.1" v-model.number="grayConfig.errorThreshold" />
                </div>
                <div>
                  <label class="subtle">自动回滚条件：质量得分 &lt; X</label>
                  <input class="input" type="number" min="0" max="100" step="0.1" v-model.number="grayConfig.qualityThreshold" />
                </div>
              </div>
              <div class="actions" style="margin-top:14px;">
                <button class="btn btn-primary" @click="saveGrayConfig">保存灰度策略</button>
                <button class="btn btn-secondary" @click="grayConfig.traffic = Math.min(grayConfig.traffic + 10, 100)">提升 10%</button>
              </div>
            </div>

            <div class="card panel table-wrap">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:10px;">
                <h2 style="margin:0; font-size:18px;">Gray vs. Prod 实时对比</h2>
                <span class="subtle">模拟刷新时间：{{ monitorTimestamp }}</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>指标</th>
                    <th>灰度</th>
                    <th>生产</th>
                    <th>偏差说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in monitorRows" :key="row.label">
                    <td>{{ row.label }}</td>
                    <td>{{ row.gray }}</td>
                    <td>{{ row.prod }}</td>
                    <td>{{ row.diff }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card panel">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px;">
              <h2 style="margin:0; font-size:18px;">异常告警</h2>
              <span class="badge badge-orange">{{ grayAlerts.length }} 条</span>
            </div>
            <div style="display:grid; gap:12px;">
              <div class="alert-item" v-for="item in grayAlerts" :key="item.title + item.time">
                <div style="display:flex; justify-content:space-between; gap:10px; margin-bottom:6px;">
                  <span class="badge" :class="alertClass(item.level)">{{ item.level }}</span>
                  <span class="subtle">{{ item.time }}</span>
                </div>
                <div style="font-weight:700; margin-bottom:6px;">{{ item.title }}</div>
                <div class="subtle">状态：{{ item.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'records'">
          <div class="summary-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
            <div class="summary-card">
              <div class="summary-label">月度部署成功率</div>
              <div class="summary-value">{{ monthlySuccessRate }}%</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">平均故障间隔时间（MTBF）</div>
              <div class="summary-value">{{ mtbfHours }} 小时</div>
            </div>
          </div>

          <div class="card panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>上线单号</th>
                  <th>脚本名称</th>
                  <th>上线环境</th>
                  <th>上线类型</th>
                  <th>申请人</th>
                  <th>审核人</th>
                  <th>上线时间</th>
                  <th>结果</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in releaseRecords" :key="record.orderNo">
                  <td><strong>{{ record.orderNo }}</strong></td>
                  <td>{{ record.scriptName }}</td>
                  <td>{{ record.env }}</td>
                  <td>{{ record.type }}</td>
                  <td>{{ record.applicant }}</td>
                  <td>{{ record.reviewer }}</td>
                  <td>{{ record.time }}</td>
                  <td><span class="badge" :class="recordClass(record.result)">{{ record.result }}</span></td>
                  <td><button class="btn btn-link" @click="viewRecord(record)">查看详情</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-mask" v-if="showDetailModal && selectedDeployment">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">{{ selectedDeployment.name }}</h2>
                <div class="subtle">{{ selectedDeployment.id }}｜{{ selectedDeployment.requirementId }}｜{{ selectedDeployment.scriptName }}</div>
              </div>
              <button class="btn btn-muted" @click="showDetailModal = false">关闭</button>
            </div>

            <div class="detail-block" style="margin-bottom:12px;">
              <div class="pipeline" style="align-items:center;">
                <template v-for="(env, idx) in envFlow" :key="env + '-detail'">
                  <div class="pipeline-step" :class="pipelineClass(selectedDeployment.currentEnv, env)">
                    <span class="pipeline-dot"></span>
                    <span>{{ env }}</span>
                  </div>
                  <span v-if="idx < envFlow.length - 1" class="pipeline-arrow">→</span>
                </template>
              </div>
            </div>

            <div class="two-col" style="grid-template-columns:1fr 1fr;">
              <div>
                <div class="detail-block" style="margin-bottom:12px;">
                  <div><strong>当前状态：</strong><span class="badge" :class="statusClass(selectedDeployment.status)">{{ selectedDeployment.status }}</span></div>
                  <div style="margin-top:8px;"><strong>推进摘要：</strong>{{ selectedDeployment.testSummary }}</div>
                  <div style="margin-top:8px;"><strong>最后操作：</strong>{{ selectedDeployment.operator }} / {{ selectedDeployment.updatedAt }}</div>
                </div>
                <div class="detail-block">
                  <strong>实施步骤</strong>
                  <ol style="margin:10px 0 0; padding-left:18px; line-height:1.8;">
                    <li v-for="step in selectedDeployment.steps" :key="step">{{ step }}</li>
                  </ol>
                </div>
              </div>
              <div class="detail-block table-wrap">
                <strong>测试报告</strong>
                <table style="margin-top:10px;">
                  <thead>
                    <tr>
                      <th>检查项</th>
                      <th>结果</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="report in selectedDeployment.testReport" :key="report.item">
                      <td>{{ report.item }}</td>
                      <td>{{ report.result }}</td>
                      <td>{{ report.detail }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        tabs: [
          { key: 'deployment', label: '部署列表' },
          { key: 'environment', label: '环境管理' },
          { key: 'gray', label: '灰度配置' },
          { key: 'records', label: '上线记录' }
        ],
        activeTab: 'deployment',
        envFlow: ENV_FLOW,
        deployments: pickArray('deployments', defaultDeployments),
        environments: pickArray('deploymentEnvironments', defaultEnvironments),
        releaseRecords: pickArray('releaseRecords', defaultRecords),
        grayAlerts: pickArray('grayAlerts', defaultGrayAlerts),
        grayConfig: {
          deploymentId: (pickArray('deployments', defaultDeployments).find(item => item.currentEnv === 'GRAY') || defaultDeployments[1]).id,
          traffic: 20,
          userGroup: 'VIP客户',
          startDate: '2024-09-20',
          endDate: '2024-09-27',
          errorThreshold: 1.5,
          qualityThreshold: 90
        },
        monitorRows: [
          { label: '记录数', gray: '1,202,188', prod: '1,199,906', diff: '+0.19%' },
          { label: '质量得分', gray: '96.8', prod: '97.1', diff: '-0.3' },
          { label: '执行耗时', gray: '14.2 分钟', prod: '13.8 分钟', diff: '+0.4 分钟' }
        ],
        monitorTimestamp: '09:58:18',
        showDetailModal: false,
        selectedDeploymentId: null,
        timer: null
      };
    },
    computed: {
      deploymentStats() {
        const labels = ['待部署', '测试中', '灰度中', '已上线', '回滚中'];
        return labels.map(label => ({
          label,
          value: this.deployments.filter(item => item.status === label).length
        }));
      },
      selectedDeployment() {
        return this.deployments.find(item => item.id === this.selectedDeploymentId) || null;
      },
      grayCandidates() {
        return this.deployments.filter(item => ['GRAY', 'PRD'].includes(item.currentEnv) || item.status === '灰度中');
      },
      activeGrayDeployment() {
        return this.deployments.find(item => item.id === this.grayConfig.deploymentId) || this.grayCandidates[0] || null;
      },
      monthlySuccessRate() {
        if (!this.releaseRecords.length) {
          return '0.0';
        }
        const successCount = this.releaseRecords.filter(item => item.result === '成功').length;
        return ((successCount / this.releaseRecords.length) * 100).toFixed(1);
      },
      mtbfHours() {
        const issueCount = this.releaseRecords.filter(item => item.result !== '成功').length || 1;
        return (720 / issueCount).toFixed(1);
      }
    },
    methods: {
      statusClass(status) {
        return {
          '待部署': 'badge-gray',
          '测试中': 'badge-blue',
          '灰度中': 'badge-purple',
          '已上线': 'badge-green',
          '回滚中': 'badge-red'
        }[status] || 'badge-gray';
      },
      recordClass(result) {
        return {
          '成功': 'badge-green',
          '失败': 'badge-red',
          '回滚': 'badge-orange'
        }[result] || 'badge-gray';
      },
      alertClass(level) {
        return {
          '提示': 'badge-blue',
          '警告': 'badge-orange',
          '严重': 'badge-red'
        }[level] || 'badge-gray';
      },
      healthBadgeClass(health) {
        return {
          healthy: 'badge-green',
          warning: 'badge-orange',
          down: 'badge-red'
        }[health] || 'badge-gray';
      },
      healthLabel(health) {
        return {
          healthy: '健康',
          warning: '预警',
          down: '故障'
        }[health] || '未知';
      },
      pipelineClass(currentEnv, env) {
        const currentIndex = this.envFlow.indexOf(currentEnv);
        const envIndex = this.envFlow.indexOf(env);
        return {
          done: envIndex < currentIndex,
          active: envIndex === currentIndex
        };
      },
      openDetail(item) {
        this.selectedDeploymentId = item.id;
        this.showDetailModal = true;
      },
      viewTestReport(item) {
        this.selectedDeploymentId = item.id;
        this.showDetailModal = true;
      },
      advanceDeployment(item) {
        const currentIndex = this.envFlow.indexOf(item.currentEnv);
        if (currentIndex < this.envFlow.length - 1) {
          item.currentEnv = this.envFlow[currentIndex + 1];
          item.progress = Math.min(item.progress + 18, 100);
          item.updatedAt = '2024-09-20 10:00';
          item.operator = (mock.currentUser && mock.currentUser.name) || '系统调度';
          item.status = item.currentEnv === 'PRD' ? '已上线' : (item.currentEnv === 'GRAY' ? '灰度中' : '测试中');
          item.readyToAdvance = item.currentEnv === 'GRAY';
          if (item.currentEnv === 'PRD') {
            this.releaseRecords.unshift({
              orderNo: 'REL-20240920-' + String(this.releaseRecords.length + 1).padStart(3, '0'),
              scriptName: item.scriptName,
              env: 'GRAY→PRD',
              type: '变更',
              applicant: item.operator,
              reviewer: '自动审批流',
              time: item.updatedAt,
              result: '成功'
            });
          }
          this.syncEnvDeployments();
        }
      },
      requestRollback(item) {
        item.status = '回滚中';
        item.progress = Math.max(35, item.progress - 15);
        item.readyToAdvance = false;
        item.updatedAt = '2024-09-20 10:02';
        this.grayAlerts.unshift({ level: '严重', title: item.name + ' 已发起回滚申请', time: '10:02', status: '处理中' });
        this.releaseRecords.unshift({
          orderNo: 'REL-20240920-' + String(this.releaseRecords.length + 1).padStart(3, '0'),
          scriptName: item.scriptName,
          env: item.currentEnv,
          type: '回滚',
          applicant: item.operator,
          reviewer: '运维经理',
          time: item.updatedAt,
          result: '回滚'
        });
        this.syncEnvDeployments();
      },
      saveGrayConfig() {
        const name = this.activeGrayDeployment ? this.activeGrayDeployment.name : '当前部署';
        alert('已保存灰度配置：' + name + '\n流量 ' + this.grayConfig.traffic + '%，用户群体：' + this.grayConfig.userGroup);
      },
      simulateRefresh() {
        this.monitorTimestamp = '10:0' + Math.floor(Math.random() * 9) + ':' + String(Math.floor(Math.random() * 59)).padStart(2, '0');
        this.monitorRows = this.monitorRows.map((row, index) => {
          if (index === 0) {
            const gray = 1200000 + Math.floor(Math.random() * 5000);
            const prod = 1195000 + Math.floor(Math.random() * 5000);
            return { label: row.label, gray: gray.toLocaleString('zh-CN'), prod: prod.toLocaleString('zh-CN'), diff: (((gray - prod) / prod) * 100).toFixed(2) + '%' };
          }
          if (index === 1) {
            const gray = (96 + Math.random() * 2).toFixed(1);
            const prod = (96.5 + Math.random() * 1.5).toFixed(1);
            return { label: row.label, gray, prod, diff: (gray - prod).toFixed(1) };
          }
          const gray = (13 + Math.random() * 2).toFixed(1);
          const prod = (13 + Math.random() * 1.5).toFixed(1);
          return { label: row.label, gray: gray + ' 分钟', prod: prod + ' 分钟', diff: (gray - prod).toFixed(1) + ' 分钟' };
        });
      },
      viewRecord(record) {
        alert(record.orderNo + '\n脚本：' + record.scriptName + '\n结果：' + record.result + '\n审核人：' + record.reviewer);
      },
      syncEnvDeployments() {
        this.environments.forEach(env => {
          env.deployments = this.deployments.filter(item => item.currentEnv === env.name).map(item => item.name);
        });
      }
    },
    mounted() {
      this.selectedDeploymentId = this.deployments[0] && this.deployments[0].id;
      this.syncEnvDeployments();
      this.timer = setInterval(this.simulateRefresh, 8000);
    },
    beforeUnmount() {
      clearInterval(this.timer);
    }
  };
})();
