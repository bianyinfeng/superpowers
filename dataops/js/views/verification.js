(function () {
  const mock = window.MockData || {};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pickArray(name, fallback) {
    return Array.isArray(mock[name]) && mock[name].length ? clone(mock[name]) : clone(fallback);
  }

  const metadataTables = pickArray('metadataTables', [
    { schema: 'dw_dwd', tableName: 'dwd_customer_profile', cnName: '客户画像明细表', fields: ['cust_id', 'cust_name', 'risk_level', 'branch_no'] },
    { schema: 'dw_dws', tableName: 'dws_public_trade_summary', cnName: '对公交易汇总表', fields: ['trade_date', 'org_no', 'trade_amt', 'trade_cnt'] },
    { schema: 'dw_ads', tableName: 'ads_mobile_marketing_tag', cnName: '手机银行营销标签表', fields: ['cust_id', 'tag_code', 'tag_value', 'batch_date'] }
  ]);

  const defaultRules = [
    {
      id: 'QR-001',
      name: '客户号非空校验',
      type: '非空校验',
      targetTable: 'dw_dwd.dwd_customer_profile',
      targetField: 'cust_id',
      blockingLevel: '硬阻断',
      enabled: true,
      passRate: 99.6,
      lastRun: '2024-09-20 09:15',
      priority: 'P1',
      notify: 'dataops@bank.com; 风险监控群',
      sqlCondition: 'cust_id IS NOT NULL',
      threshold: 99,
      history: [
        { time: '09:15', passRate: 99.6, failedCount: 12, samples: ['cust_id = NULL, branch_no=3101', 'cust_id = NULL, batch=20240920'] },
        { time: '08:00', passRate: 99.9, failedCount: 2, samples: ['cust_id = NULL, branch_no=2201'] }
      ]
    },
    {
      id: 'QR-002',
      name: '交易流水唯一性',
      type: '唯一性校验',
      targetTable: 'dw_dws.dws_public_trade_summary',
      targetField: 'trade_no',
      blockingLevel: '软阻断',
      enabled: true,
      passRate: 97.8,
      lastRun: '2024-09-20 09:10',
      priority: 'P1',
      notify: 'ops@bank.com; 钉钉-跑批告警',
      sqlCondition: 'count(*) over(partition by trade_no)=1',
      threshold: 98,
      history: [
        { time: '09:10', passRate: 97.8, failedCount: 124, samples: ['trade_no=TX88901 重复 2 次', 'trade_no=TX88908 重复 3 次'] },
        { time: '08:00', passRate: 98.6, failedCount: 88, samples: ['trade_no=TX77618 重复 2 次'] }
      ]
    },
    {
      id: 'QR-003',
      name: '营销标签值域校验',
      type: '值域校验',
      targetTable: 'dw_ads.ads_mobile_marketing_tag',
      targetField: 'tag_value',
      blockingLevel: '警告',
      enabled: true,
      passRate: 95.4,
      lastRun: '2024-09-20 08:50',
      priority: 'P2',
      notify: 'sms:138****1024',
      sqlCondition: 'tag_value in (\'Y\', \'N\', \'A\')',
      threshold: 95,
      history: [
        { time: '08:50', passRate: 95.4, failedCount: 321, samples: ['tag_value=UNK', 'tag_value=空字符串'] },
        { time: '07:40', passRate: 96.1, failedCount: 255, samples: ['tag_value=TEST'] }
      ]
    },
    {
      id: 'QR-004',
      name: '监管报送时效性校验',
      type: '时效性校验',
      targetTable: 'dw_dws.dws_regulatory_snapshot',
      targetField: 'etl_time',
      blockingLevel: '硬阻断',
      enabled: false,
      passRate: 100,
      lastRun: '2024-09-19 23:00',
      priority: 'P0',
      notify: 'email:reg@bank.com',
      sqlCondition: 'etl_time <= report_deadline',
      threshold: 100,
      history: [
        { time: '23:00', passRate: 100, failedCount: 0, samples: ['无异常记录'] },
        { time: '22:00', passRate: 100, failedCount: 0, samples: ['无异常记录'] }
      ]
    }
  ];

  const defaultJobs = [
    {
      id: 'JOB-ETL-001',
      name: '客户画像宽表装载',
      code: 'customer_profile_load',
      cycle: '每日 08:00',
      status: '运行中',
      lastRun: '2024-09-20 08:00',
      nextRun: '2024-09-21 08:00',
      duration: '18 分钟',
      dependency: 'raw_customer_sync',
      timelineStart: 8,
      timelineDuration: 18,
      logs: ['08:00:01 INFO 作业启动', '08:03:12 INFO 装载 ODS 分区 4 个', '08:15:30 WARN 发现 12 条空客户号', '08:18:10 INFO 作业结束'],
      historyBars: [72, 78, 81, 76, 85, 88, 80],
      ioStats: { inputRows: '12,880,120', outputRows: '12,879,998', rejects: '122' }
    },
    {
      id: 'JOB-ETL-002',
      name: '对公交易汇总',
      code: 'public_trade_summary',
      cycle: '每小时',
      status: '待执行',
      lastRun: '2024-09-20 09:00',
      nextRun: '2024-09-20 10:00',
      duration: '11 分钟',
      dependency: 'trade_detail_sync',
      timelineStart: 9,
      timelineDuration: 11,
      logs: ['09:00:01 INFO 汇总开始', '09:07:42 INFO 聚合 30 分区', '09:11:03 INFO 作业成功'],
      historyBars: [62, 66, 68, 70, 72, 64, 69],
      ioStats: { inputRows: '4,502,201', outputRows: '652,883', rejects: '0' }
    },
    {
      id: 'JOB-ETL-003',
      name: '营销标签刷新',
      code: 'marketing_tag_refresh',
      cycle: '每日 07:30',
      status: '阻断中',
      lastRun: '2024-09-20 07:30',
      nextRun: '等待恢复',
      duration: '6 分钟',
      dependency: 'customer_profile_load',
      timelineStart: 7.5,
      timelineDuration: 6,
      logs: ['07:30:00 INFO 任务启动', '07:33:25 ERROR 质量规则 QR-003 未达标', '07:36:10 INFO 作业已挂起'],
      historyBars: [45, 52, 48, 43, 40, 38, 36],
      ioStats: { inputRows: '2,360,199', outputRows: '2,358,890', rejects: '1,309' }
    },
    {
      id: 'JOB-ETL-004',
      name: '监管快照归档',
      code: 'reg_snapshot_archive',
      cycle: '每日 23:00',
      status: '已暂停',
      lastRun: '2024-09-19 23:00',
      nextRun: '人工恢复',
      duration: '23 分钟',
      dependency: 'reg_snapshot_generate',
      timelineStart: 23,
      timelineDuration: 23,
      logs: ['23:00:00 INFO 启动作业', '23:20:10 INFO 归档完成'],
      historyBars: [88, 86, 84, 85, 90, 92, 89],
      ioStats: { inputRows: '890,220', outputRows: '890,220', rejects: '0' }
    }
  ];

  const defaultBlockingRules = [
    { triggerRule: 'QR-001 客户号非空校验', impactedJobs: '客户画像宽表装载、营销标签刷新', level: '硬阻断', notify: '邮件 + 钉钉', recover: '通过补数后重新执行规则', enabled: true },
    { triggerRule: 'QR-002 交易流水唯一性', impactedJobs: '对公交易汇总', level: '软阻断', notify: '钉钉', recover: '重复流水清洗率 > 99.5%', enabled: true },
    { triggerRule: 'QR-003 营销标签值域校验', impactedJobs: '营销标签刷新', level: '警告', notify: '短信 + 钉钉', recover: '业务确认容忍范围或修正标签映射', enabled: true }
  ];

  const defaultAlerts = [
    { id: 'ALT-001', severity: '危急', title: '监管快照时效校验即将超时', related: '规则 QR-004', time: '2024-09-20 09:12', status: '未处理', note: '' },
    { id: 'ALT-002', severity: '严重', title: '营销标签刷新因质量规则阻断', related: '作业 JOB-ETL-003', time: '2024-09-20 07:33', status: '处理中', note: '已通知营销数据负责人' },
    { id: 'ALT-003', severity: '警告', title: '交易流水唯一性通过率低于阈值', related: '规则 QR-002', time: '2024-09-20 09:10', status: '未处理', note: '' },
    { id: 'ALT-004', severity: '提示', title: '客户画像宽表存在 12 条空客户号', related: '规则 QR-001', time: '2024-09-20 08:15', status: '已解决', note: '已完成补数' }
  ];

  window.VerificationView = {
    template: `
      <div class="verification-view verify-shell">
        <style>
          .verify-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
          .verify-shell .page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
          .verify-shell .subtle { color: #6b7280; font-size: 13px; }
          .verify-shell .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); }
          .verify-shell .panel { padding: 16px; }
          .verify-shell .tab-row, .verify-shell .actions, .verify-shell .flow-row { display: flex; gap: 8px; flex-wrap: wrap; }
          .verify-shell .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 16px; cursor: pointer; font-weight: 600; }
          .verify-shell .tab-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
          .verify-shell .summary-grid, .verify-shell .rule-top, .verify-shell .two-col, .verify-shell .form-grid, .verify-shell .timeline, .verify-shell .dep-graph { display: grid; gap: 14px; }
          .verify-shell .summary-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .verify-shell .rule-top { grid-template-columns: 1.2fr 0.8fr; align-items: start; margin-bottom: 16px; }
          .verify-shell .two-col { grid-template-columns: 1.2fr 0.8fr; align-items: start; }
          .verify-shell .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .verify-shell .summary-card { padding: 16px; border-radius: 14px; background: linear-gradient(135deg, #eff6ff, #ffffff); border: 1px solid #dbeafe; }
          .verify-shell .summary-label { color: #6b7280; font-size: 12px; }
          .verify-shell .summary-value { font-size: 25px; font-weight: 700; margin-top: 8px; }
          .verify-shell .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .verify-shell .badge-blue { background: #dbeafe; color: #1d4ed8; }
          .verify-shell .badge-green { background: #dcfce7; color: #15803d; }
          .verify-shell .badge-orange { background: #ffedd5; color: #c2410c; }
          .verify-shell .badge-red { background: #fee2e2; color: #b91c1c; }
          .verify-shell .badge-purple { background: #ede9fe; color: #6d28d9; }
          .verify-shell .badge-gray { background: #f3f4f6; color: #4b5563; }
          .verify-shell .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
          .verify-shell .btn-primary { background: #1d4ed8; color: #fff; }
          .verify-shell .btn-secondary { background: #eff6ff; color: #1d4ed8; }
          .verify-shell .btn-muted { background: #f3f4f6; color: #374151; }
          .verify-shell .btn-danger { background: #fee2e2; color: #b91c1c; }
          .verify-shell .btn-link { background: transparent; color: #1d4ed8; padding: 0; }
          .verify-shell .input, .verify-shell .select, .verify-shell textarea { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
          .verify-shell textarea { min-height: 88px; resize: vertical; }
          .verify-shell .table-wrap { overflow: auto; }
          .verify-shell table { width: 100%; border-collapse: collapse; }
          .verify-shell th, .verify-shell td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; font-size: 13px; }
          .verify-shell th { background: #f8fafc; font-weight: 700; }
          .verify-shell .toggle { width: 42px; height: 22px; background: #d1d5db; border-radius: 999px; position: relative; cursor: pointer; display: inline-block; }
          .verify-shell .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: all .2s ease; }
          .verify-shell .toggle.on { background: #2563eb; }
          .verify-shell .toggle.on::after { left: 23px; }
          .verify-shell .progress { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; min-width: 100px; }
          .verify-shell .progress-bar { height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); }
          .verify-shell .gauge { width: 180px; height: 180px; border-radius: 50%; margin: 0 auto; display: grid; place-items: center; background: conic-gradient(#2563eb calc(var(--value) * 1%), #dbeafe 0); }
          .verify-shell .gauge-inner { width: 130px; height: 130px; border-radius: 50%; background: #fff; display: grid; place-items: center; text-align: center; }
          .verify-shell .timeline-shell { position: relative; height: 120px; border: 1px solid #e5e7eb; border-radius: 12px; background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%); overflow: hidden; }
          .verify-shell .timeline-axis { display: grid; grid-template-columns: repeat(12, 1fr); font-size: 12px; color: #64748b; padding: 10px 12px; }
          .verify-shell .timeline-bar { position: absolute; height: 26px; border-radius: 999px; color: #fff; padding: 4px 10px; font-size: 12px; display: flex; align-items: center; overflow: hidden; white-space: nowrap; }
          .verify-shell .bar-running { background: linear-gradient(90deg, #2563eb, #0ea5e9); }
          .verify-shell .bar-waiting { background: linear-gradient(90deg, #94a3b8, #64748b); }
          .verify-shell .bar-blocked { background: linear-gradient(90deg, #f97316, #ef4444); }
          .verify-shell .bar-paused { background: linear-gradient(90deg, #6b7280, #475569); }
          .verify-shell .dep-graph { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .verify-shell .dep-node { position: relative; padding: 14px; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; text-align: center; font-size: 13px; min-height: 78px; }
          .verify-shell .dep-node::after { content: '→'; position: absolute; right: -16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 18px; }
          .verify-shell .dep-node:last-child::after { display: none; }
          .verify-shell .history-bars { display: flex; align-items: end; gap: 8px; height: 140px; }
          .verify-shell .history-bar { flex: 1; border-radius: 10px 10px 0 0; background: linear-gradient(180deg, #60a5fa, #1d4ed8); position: relative; }
          .verify-shell .history-bar span { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #475569; }
          .verify-shell .flow-box { padding: 16px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f8fafc; font-weight: 700; }
          .verify-shell .flow-arrow { font-size: 20px; color: #94a3b8; align-self: center; }
          .verify-shell .alert-item, .verify-shell .detail-block { padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; }
          .verify-shell .alert-list { display: grid; gap: 12px; }
          .verify-shell .severity-icon { font-size: 18px; }
          .verify-shell .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
          .verify-shell .modal-card { background: #fff; border-radius: 16px; width: min(960px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
          @media (max-width: 1200px) {
            .verify-shell .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .verify-shell .rule-top, .verify-shell .two-col, .verify-shell .form-grid, .verify-shell .dep-graph { grid-template-columns: 1fr; }
          }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px;">
          <div>
            <h1 class="page-title">数据核验规则及跑批管理</h1>
            <div class="subtle">覆盖质量规则、跑批作业、阻断联动与告警处置，保障银行数据批处理链路稳定可控。</div>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" @click="refreshRules">刷新指标</button>
            <button class="btn btn-primary" @click="showRuleModal = true">新增规则</button>
          </div>
        </div>

        <div class="tab-row" style="margin-bottom:16px;">
          <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>

        <div v-if="activeTab === 'rules'">
          <div class="summary-grid" style="margin-bottom:16px;">
            <div class="summary-card" v-for="item in ruleStats" :key="item.label">
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </div>

          <div class="rule-top">
            <div class="card panel table-wrap">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:10px;">
                <h2 style="margin:0; font-size:18px;">质量规则清单</h2>
                <span class="subtle">规则编号 / 类型 / 阻断级别 / 历史执行结果</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>规则编号</th>
                    <th>规则名称</th>
                    <th>规则类型</th>
                    <th>目标表</th>
                    <th>目标字段</th>
                    <th>阻断级别</th>
                    <th>启用状态</th>
                    <th>通过率</th>
                    <th>最后执行时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rule in qualityRules" :key="rule.id">
                    <td><strong>{{ rule.id }}</strong></td>
                    <td>{{ rule.name }}</td>
                    <td><span class="badge" :class="ruleTypeClass(rule.type)">{{ rule.type }}</span></td>
                    <td>{{ rule.targetTable }}</td>
                    <td>{{ rule.targetField }}</td>
                    <td><span class="badge" :class="blockingClass(rule.blockingLevel)">{{ rule.blockingLevel }}</span></td>
                    <td><span class="toggle" :class="{ on: rule.enabled }" @click="rule.enabled = !rule.enabled"></span></td>
                    <td>
                      <div class="progress"><div class="progress-bar" :style="{ width: rule.passRate + '%' }"></div></div>
                      <div class="subtle" style="margin-top:4px;">{{ rule.passRate }}%</div>
                    </td>
                    <td>{{ rule.lastRun }}</td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-link" @click="editRule(rule)">编辑</button>
                        <button class="btn btn-link" @click="runRule(rule)">立即执行</button>
                        <button class="btn btn-link" @click="openRuleHistory(rule)">历史</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="card panel" style="text-align:center;">
              <h2 style="margin:0 0 12px; font-size:18px;">今日平均质量得分</h2>
              <div class="gauge" :style="{ '--value': overallQualityScore }">
                <div class="gauge-inner">
                  <div>
                    <div style="font-size:30px; font-weight:700;">{{ overallQualityScore }}%</div>
                    <div class="subtle">整体质量</div>
                  </div>
                </div>
              </div>
              <div class="detail-block" style="margin-top:16px; text-align:left;">
                <div><strong>高风险规则：</strong>{{ qualityRules.filter(rule => rule.blockingLevel !== '警告').length }} 条</div>
                <div style="margin-top:8px;"><strong>当前阻断作业：</strong>{{ batchJobs.filter(job => job.status === '阻断中').length }} 个</div>
                <div style="margin-top:8px;"><strong>建议：</strong>优先处置 QR-002 与 QR-003 对应的批任务阻断。</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'jobs'" class="two-col">
          <div>
            <div class="card panel" style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px;">
                <h2 style="margin:0; font-size:18px;">今日跑批甘特视图</h2>
                <span class="subtle">07:00 - 18:00 重点批次执行窗口</span>
              </div>
              <div class="timeline-shell">
                <div class="timeline-axis">
                  <span v-for="hour in timelineHours" :key="hour">{{ hour }}</span>
                </div>
                <div v-for="(job, index) in batchJobs" :key="job.id + '-bar'" class="timeline-bar" :class="jobBarClass(job.status)" :style="timelineStyle(job, index)">
                  {{ job.name }}｜{{ job.status }}
                </div>
              </div>
            </div>

            <div class="card panel table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>作业名称</th>
                    <th>作业代码</th>
                    <th>调度周期</th>
                    <th>状态</th>
                    <th>上次执行</th>
                    <th>下次执行</th>
                    <th>耗时</th>
                    <th>依赖作业</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="job in batchJobs" :key="job.id">
                    <td><strong>{{ job.name }}</strong></td>
                    <td>{{ job.code }}</td>
                    <td>{{ job.cycle }}</td>
                    <td><span class="badge" :class="jobStatusClass(job.status)">{{ job.status }}</span></td>
                    <td>{{ job.lastRun }}</td>
                    <td>{{ job.nextRun }}</td>
                    <td>{{ job.duration }}</td>
                    <td>{{ job.dependency }}</td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-link" @click="runJob(job)">立即执行</button>
                        <button class="btn btn-link" @click="pauseJob(job)">暂停</button>
                        <button class="btn btn-link" @click="openJobDetail(job)">详情</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div class="card panel" style="margin-bottom:16px;">
              <h2 style="margin:0 0 12px; font-size:18px;">作业依赖链路</h2>
              <div class="dep-graph">
                <div class="dep-node">raw_customer_sync<br /><span class="subtle">源数据同步</span></div>
                <div class="dep-node">customer_profile_load<br /><span class="subtle">宽表装载</span></div>
                <div class="dep-node">marketing_tag_refresh<br /><span class="subtle">标签刷新</span></div>
                <div class="dep-node">ads_tag_push<br /><span class="subtle">结果推送</span></div>
              </div>
            </div>

            <div class="card panel">
              <h2 style="margin:0 0 12px; font-size:18px;">跑批联动提示</h2>
              <div class="detail-block">
                <div><strong>当前被阻断链路：</strong>marketing_tag_refresh → ads_tag_push</div>
                <div style="margin-top:8px;"><strong>阻断原因：</strong>QR-003 营销标签值域校验通过率低于 95%</div>
                <div style="margin-top:8px;"><strong>建议动作：</strong>修正标签映射后重新执行质量规则并恢复批次。</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'blocking'">
          <div class="card panel" style="margin-bottom:16px;">
            <h2 style="margin:0 0 8px; font-size:18px;">阻断规则说明</h2>
            <div class="subtle">当数据质量规则触发阻断时，系统将暂停依赖该数据的跑批作业。</div>
          </div>

          <div class="two-col">
            <div class="card panel table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>阻断触发规则</th>
                    <th>影响的作业</th>
                    <th>阻断级别</th>
                    <th>通知方式</th>
                    <th>恢复条件</th>
                    <th>启用状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in blockingRules" :key="item.triggerRule">
                    <td>{{ item.triggerRule }}</td>
                    <td>{{ item.impactedJobs }}</td>
                    <td><span class="badge" :class="blockingClass(item.level)">{{ item.level }}</span></td>
                    <td>{{ item.notify }}</td>
                    <td>{{ item.recover }}</td>
                    <td>{{ item.enabled ? '已启用' : '未启用' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div class="card panel" style="margin-bottom:16px;">
                <h2 style="margin:0 0 12px; font-size:18px;">阻断流程图</h2>
                <div class="flow-row" style="justify-content:space-between; align-items:center;">
                  <div class="flow-box">Quality Rule</div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-box">triggers</div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-box">Blocking</div>
                  <div class="flow-arrow">→</div>
                  <div class="flow-box">pauses Batch Jobs</div>
                </div>
              </div>

              <div class="card panel">
                <h2 style="margin:0 0 12px; font-size:18px;">紧急放行</h2>
                <div class="detail-block" style="margin-bottom:12px;">适用于监管窗口、核心业务高峰等特殊场景，需填写原因并输入授权码。</div>
                <div class="form-grid">
                  <div style="grid-column:1 / -1;">
                    <label class="subtle">放行原因</label>
                    <textarea v-model="bypassForm.reason" placeholder="请输入紧急放行原因，例如：监管报送窗口临近，允许带警告继续执行"></textarea>
                  </div>
                  <div>
                    <label class="subtle">授权码</label>
                    <input class="input" v-model="bypassForm.authCode" placeholder="例如 AUTH-8888" />
                  </div>
                  <div>
                    <label class="subtle">影响作业</label>
                    <select class="select" v-model="bypassForm.jobCode">
                      <option v-for="job in batchJobs" :key="job.id" :value="job.code">{{ job.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="actions" style="margin-top:12px;">
                  <button class="btn btn-danger" @click="submitBypass">紧急放行</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'alerts'">
          <div class="card panel" style="margin-bottom:16px;">
            <div class="form-grid">
              <div>
                <label class="subtle">告警级别</label>
                <select class="select" v-model="alertFilter.severity">
                  <option value="">全部</option>
                  <option value="危急">危急</option>
                  <option value="严重">严重</option>
                  <option value="警告">警告</option>
                  <option value="提示">提示</option>
                </select>
              </div>
              <div>
                <label class="subtle">日期</label>
                <input class="input" type="date" v-model="alertFilter.date" />
              </div>
            </div>
          </div>

          <div class="alert-list">
            <div class="alert-item" v-for="alert in filteredAlerts" :key="alert.id">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
                <div style="display:flex; gap:12px; align-items:flex-start;">
                  <span class="severity-icon">{{ severityIcon(alert.severity) }}</span>
                  <div>
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
                      <span class="badge" :class="severityClass(alert.severity)">{{ alert.severity }}</span>
                      <strong>{{ alert.title }}</strong>
                    </div>
                    <div class="subtle">关联对象：{{ alert.related }}｜发生时间：{{ alert.time }}</div>
                    <div class="subtle" style="margin-top:6px;">状态：{{ alert.status }}</div>
                  </div>
                </div>
                <div class="actions">
                  <button class="btn btn-secondary" @click="acknowledgeAlert(alert)">确认告警</button>
                  <button class="btn btn-muted" @click="resolveAlert(alert)">标记解决</button>
                </div>
              </div>
              <div style="margin-top:12px;">
                <label class="subtle">处置备注</label>
                <textarea v-model="alert.note" placeholder="补充处理进展、责任人或临时措施"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-mask" v-if="showRuleModal">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">{{ editingRuleId ? '编辑规则' : '新增规则' }}</h2>
                <div class="subtle">定义规则类型、目标元数据、SQL 条件、阈值与通知策略。</div>
              </div>
              <button class="btn btn-muted" @click="closeRuleModal">关闭</button>
            </div>
            <div class="form-grid">
              <div>
                <label class="subtle">规则名称</label>
                <input class="input" v-model="ruleForm.name" />
              </div>
              <div>
                <label class="subtle">规则编码</label>
                <input class="input" v-model="ruleForm.id" />
              </div>
              <div>
                <label class="subtle">规则类型</label>
                <select class="select" v-model="ruleForm.type">
                  <option v-for="item in ruleTypes" :key="item" :value="item">{{ item }}</option>
                </select>
              </div>
              <div>
                <label class="subtle">目标表</label>
                <select class="select" v-model="ruleForm.targetTable" @change="syncTargetFields">
                  <option v-for="item in metadataTableOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                </select>
              </div>
              <div>
                <label class="subtle">目标字段</label>
                <select class="select" v-model="ruleForm.targetField">
                  <option v-for="field in currentTargetFields" :key="field" :value="field">{{ field }}</option>
                </select>
              </div>
              <div>
                <label class="subtle">阈值 (%)</label>
                <input class="input" type="number" min="0" max="100" v-model.number="ruleForm.threshold" />
              </div>
              <div>
                <label class="subtle">阻断级别</label>
                <select class="select" v-model="ruleForm.blockingLevel">
                  <option value="警告">警告</option>
                  <option value="软阻断">软阻断</option>
                  <option value="硬阻断">硬阻断</option>
                </select>
              </div>
              <div>
                <label class="subtle">优先级</label>
                <select class="select" v-model="ruleForm.priority">
                  <option value="P0">P0</option>
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </div>
              <div style="grid-column:1 / -1;">
                <label class="subtle">SQL 条件</label>
                <textarea v-model="ruleForm.sqlCondition" placeholder="示例：cust_id IS NOT NULL\n示例：trade_date >= business_date"></textarea>
              </div>
              <div style="grid-column:1 / -1;">
                <label class="subtle">通知设置（邮件 / 钉钉 / 短信）</label>
                <input class="input" v-model="ruleForm.notify" placeholder="dataops@bank.com; 钉钉群；138****8888" />
              </div>
            </div>
            <div class="actions" style="margin-top:14px;">
              <button class="btn btn-primary" @click="saveRule">保存规则</button>
            </div>
          </div>
        </div>

        <div class="modal-mask" v-if="showHistoryModal && selectedRule">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">{{ selectedRule.name }} 执行历史</h2>
                <div class="subtle">最近 {{ selectedRule.history.length }} 次运行结果、失败记录数与样例数据</div>
              </div>
              <button class="btn btn-muted" @click="showHistoryModal = false">关闭</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>执行时间</th>
                    <th>通过率</th>
                    <th>失败记录数</th>
                    <th>样例失败记录</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in selectedRule.history" :key="row.time">
                    <td>{{ row.time }}</td>
                    <td>{{ row.passRate }}%</td>
                    <td>{{ row.failedCount }}</td>
                    <td>{{ row.samples.join('；') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-mask" v-if="showJobModal && selectedJob">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">{{ selectedJob.name }}</h2>
                <div class="subtle">{{ selectedJob.code }}｜状态：{{ selectedJob.status }}</div>
              </div>
              <button class="btn btn-muted" @click="showJobModal = false">关闭</button>
            </div>
            <div class="two-col" style="grid-template-columns:1fr 1fr;">
              <div>
                <div class="detail-block" style="margin-bottom:12px;">
                  <strong>执行日志</strong>
                  <div style="margin-top:8px; background:#0f172a; color:#e2e8f0; border-radius:12px; padding:14px; font-family:Consolas, monospace; white-space:pre-wrap;">{{ selectedJob.logs.join('\n') }}</div>
                </div>
                <div class="detail-block">
                  <strong>输入 / 输出统计</strong>
                  <div style="margin-top:10px; display:grid; gap:8px; font-size:13px;">
                    <div>输入记录数：{{ selectedJob.ioStats.inputRows }}</div>
                    <div>输出记录数：{{ selectedJob.ioStats.outputRows }}</div>
                    <div>拒绝记录数：{{ selectedJob.ioStats.rejects }}</div>
                  </div>
                </div>
              </div>
              <div class="detail-block">
                <strong>执行历史趋势</strong>
                <div class="history-bars" style="margin-top:18px;">
                  <div v-for="(item, index) in selectedJob.historyBars" :key="index" class="history-bar" :style="{ height: item + '%' }"><span>{{ item }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        tabs: [
          { key: 'rules', label: '质量规则管理' },
          { key: 'jobs', label: '跑批作业管理' },
          { key: 'blocking', label: '阻断规则配置' },
          { key: 'alerts', label: '告警管理' }
        ],
        activeTab: 'rules',
        metadataTables,
        qualityRules: pickArray('qualityRules', defaultRules),
        batchJobs: pickArray('batchJobs', defaultJobs),
        blockingRules: pickArray('blockingRules', defaultBlockingRules),
        alerts: pickArray('verificationAlerts', defaultAlerts),
        timelineHours: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        showRuleModal: false,
        showHistoryModal: false,
        showJobModal: false,
        selectedRuleId: null,
        selectedJobId: null,
        editingRuleId: '',
        alertFilter: { severity: '', date: '' },
        bypassForm: { reason: '', authCode: '', jobCode: 'customer_profile_load' },
        ruleTypes: ['非空校验', '唯一性校验', '值域校验', '格式校验', '关联性校验', '完整性校验', '时效性校验'],
        ruleForm: {
          id: 'QR-NEW',
          name: '',
          type: '非空校验',
          targetTable: metadataTables[0] ? metadataTables[0].schema + '.' + metadataTables[0].tableName : '',
          targetField: metadataTables[0] && metadataTables[0].fields[0] ? metadataTables[0].fields[0] : '',
          sqlCondition: 'cust_id IS NOT NULL',
          threshold: 99,
          blockingLevel: '警告',
          priority: 'P2',
          notify: ''
        }
      };
    },
    computed: {
      overallQualityScore() {
        if (!this.qualityRules.length) {
          return '0.0';
        }
        const total = this.qualityRules.reduce((sum, item) => sum + Number(item.passRate || 0), 0);
        return (total / this.qualityRules.length).toFixed(1);
      },
      ruleStats() {
        return [
          { label: '规则总数', value: this.qualityRules.length },
          { label: '已启用', value: this.qualityRules.filter(item => item.enabled).length },
          { label: '告警规则', value: this.qualityRules.filter(item => item.blockingLevel === '警告').length },
          { label: '阻断规则', value: this.qualityRules.filter(item => item.blockingLevel !== '警告').length },
          { label: '今日平均质量得分', value: this.overallQualityScore + '%' }
        ];
      },
      metadataTableOptions() {
        return this.metadataTables.map(item => ({
          value: item.schema + '.' + item.tableName,
          label: item.schema + '.' + item.tableName + '｜' + item.cnName
        }));
      },
      currentTargetFields() {
        const found = this.metadataTables.find(item => item.schema + '.' + item.tableName === this.ruleForm.targetTable);
        return found ? found.fields : [];
      },
      selectedRule() {
        return this.qualityRules.find(item => item.id === this.selectedRuleId) || null;
      },
      selectedJob() {
        return this.batchJobs.find(item => item.id === this.selectedJobId) || null;
      },
      filteredAlerts() {
        return this.alerts.filter(item => {
          const severityMatch = !this.alertFilter.severity || item.severity === this.alertFilter.severity;
          const dateMatch = !this.alertFilter.date || item.time.indexOf(this.alertFilter.date) === 0;
          return severityMatch && dateMatch;
        });
      }
    },
    methods: {
      ruleTypeClass(type) {
        return {
          '非空校验': 'badge-blue',
          '唯一性校验': 'badge-purple',
          '值域校验': 'badge-orange',
          '格式校验': 'badge-blue',
          '关联性校验': 'badge-green',
          '完整性校验': 'badge-purple',
          '时效性校验': 'badge-red'
        }[type] || 'badge-gray';
      },
      blockingClass(level) {
        return {
          '警告': 'badge-orange',
          '软阻断': 'badge-purple',
          '硬阻断': 'badge-red'
        }[level] || 'badge-gray';
      },
      jobStatusClass(status) {
        return {
          '运行中': 'badge-blue',
          '待执行': 'badge-gray',
          '阻断中': 'badge-red',
          '已暂停': 'badge-orange',
          '成功': 'badge-green'
        }[status] || 'badge-gray';
      },
      jobBarClass(status) {
        return {
          '运行中': 'bar-running',
          '待执行': 'bar-waiting',
          '阻断中': 'bar-blocked',
          '已暂停': 'bar-paused',
          '成功': 'bar-running'
        }[status] || 'bar-waiting';
      },
      timelineStyle(job, index) {
        const left = Math.max(((job.timelineStart - 7) / 11) * 100, 0);
        const width = Math.max((job.timelineDuration / 60) * 100, 8);
        return { left: left + '%', width: width + '%', top: (40 + index * 16) + 'px' };
      },
      severityClass(level) {
        return {
          '危急': 'badge-red',
          '严重': 'badge-purple',
          '警告': 'badge-orange',
          '提示': 'badge-blue'
        }[level] || 'badge-gray';
      },
      severityIcon(level) {
        return {
          '危急': '🚨',
          '严重': '⛔',
          '警告': '⚠️',
          '提示': 'ℹ️'
        }[level] || 'ℹ️';
      },
      syncTargetFields() {
        if (this.currentTargetFields.length) {
          this.ruleForm.targetField = this.currentTargetFields[0];
        }
      },
      refreshRules() {
        this.qualityRules.forEach(rule => {
          rule.passRate = Math.max(90, Math.min(100, Number((rule.passRate + (Math.random() * 2 - 1)).toFixed(1))));
          rule.lastRun = '2024-09-20 10:0' + Math.floor(Math.random() * 9);
        });
      },
      editRule(rule) {
        this.editingRuleId = rule.id;
        this.ruleForm = clone(rule);
        this.showRuleModal = true;
      },
      closeRuleModal() {
        this.showRuleModal = false;
        this.editingRuleId = '';
        this.ruleForm = {
          id: 'QR-' + String(this.qualityRules.length + 1).padStart(3, '0'),
          name: '',
          type: '非空校验',
          targetTable: this.metadataTableOptions[0] ? this.metadataTableOptions[0].value : '',
          targetField: this.metadataTables[0] && this.metadataTables[0].fields[0] ? this.metadataTables[0].fields[0] : '',
          sqlCondition: 'cust_id IS NOT NULL',
          threshold: 99,
          blockingLevel: '警告',
          priority: 'P2',
          notify: ''
        };
      },
      saveRule() {
        const payload = clone(this.ruleForm);
        payload.enabled = payload.enabled !== false;
        payload.passRate = payload.passRate || 100;
        payload.lastRun = payload.lastRun || '未执行';
        payload.history = payload.history || [{ time: '未执行', passRate: payload.passRate, failedCount: 0, samples: ['暂无执行记录'] }];
        const index = this.qualityRules.findIndex(item => item.id === this.editingRuleId);
        if (index >= 0) {
          this.qualityRules.splice(index, 1, payload);
        } else {
          this.qualityRules.unshift(payload);
        }
        this.closeRuleModal();
      },
      runRule(rule) {
        rule.lastRun = '2024-09-20 10:05';
        rule.passRate = Math.max(90, Number((rule.passRate + (Math.random() * 1.4 - 0.4)).toFixed(1)));
        rule.history.unshift({ time: '10:05', passRate: rule.passRate, failedCount: Math.max(0, Math.round((100 - rule.passRate) * 10)), samples: ['sample_id=20240920X001', 'sample_id=20240920X018'] });
        this.alerts.unshift({ id: 'ALT-' + String(this.alerts.length + 1).padStart(3, '0'), severity: rule.blockingLevel === '硬阻断' ? '危急' : '警告', title: rule.name + ' 已手动执行', related: '规则 ' + rule.id, time: '2024-09-20 10:05', status: '处理中', note: '' });
      },
      openRuleHistory(rule) {
        this.selectedRuleId = rule.id;
        this.showHistoryModal = true;
      },
      runJob(job) {
        job.status = '运行中';
        job.lastRun = '2024-09-20 10:06';
        job.nextRun = '执行后刷新';
      },
      pauseJob(job) {
        job.status = '已暂停';
      },
      openJobDetail(job) {
        this.selectedJobId = job.id;
        this.showJobModal = true;
      },
      submitBypass() {
        if (!this.bypassForm.reason || !this.bypassForm.authCode) {
          alert('请填写放行原因和授权码');
          return;
        }
        const target = this.batchJobs.find(job => job.code === this.bypassForm.jobCode);
        if (target) {
          target.status = '待执行';
        }
        alert('已提交紧急放行：' + this.bypassForm.jobCode + '\n授权码：' + this.bypassForm.authCode);
        this.bypassForm.reason = '';
        this.bypassForm.authCode = '';
      },
      acknowledgeAlert(alert) {
        alert.status = '处理中';
      },
      resolveAlert(alert) {
        alert.status = '已解决';
      }
    }
  };
})();
