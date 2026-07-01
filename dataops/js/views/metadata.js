(function () {
  const mock = window.MockData || {};

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pickArray(name, fallback) {
    return Array.isArray(mock[name]) && mock[name].length ? clone(mock[name]) : clone(fallback);
  }

  const defaultCatalog = [
    {
      key: 'dw_ods',
      name: 'dw_ods',
      label: 'ODS 层',
      color: '#9ca3af',
      expanded: true,
      tables: [
        {
          key: 'dw_ods.ods_core_customer',
          name: 'ods_core_customer',
          cnName: '核心客户原始表',
          type: '事实表',
          owner: '零售数据组',
          sensitivity: '内部敏感',
          rowCount: '2.4 亿',
          storageSize: '1.8 TB',
          partitions: '365',
          columnCount: 8,
          lastUpdated: '2024-09-20 09:12',
          tags: ['客户主数据', '核心系统', '增量同步'],
          columns: [
            { name: 'cust_id', type: 'string', nullable: '否', comment: '客户编号', sample: 'C2024091001', sensitivity: '高' },
            { name: 'cust_name', type: 'string', nullable: '否', comment: '客户姓名', sample: '张三', sensitivity: '高' },
            { name: 'mobile_no', type: 'string', nullable: '是', comment: '手机号', sample: '138****1024', sensitivity: '高' },
            { name: 'branch_no', type: 'string', nullable: '否', comment: '开户机构', sample: '3101', sensitivity: '中' }
          ],
          sampleRows: [
            { cust_id: 'C2024091001', cust_name: '张三', mobile_no: '138****1024', branch_no: '3101' },
            { cust_id: 'C2024091002', cust_name: '李四', mobile_no: '139****2048', branch_no: '3102' },
            { cust_id: 'C2024091003', cust_name: '王五', mobile_no: '136****7788', branch_no: '2201' },
            { cust_id: 'C2024091004', cust_name: '赵六', mobile_no: '137****0211', branch_no: '3301' },
            { cust_id: 'C2024091005', cust_name: '孙七', mobile_no: '135****5566', branch_no: '4401' }
          ],
          freshness: [92, 95, 97, 96, 98, 99, 98],
          trend: [210, 214, 220, 225, 228, 232, 240]
        }
      ]
    },
    {
      key: 'dw_dwd',
      name: 'dw_dwd',
      label: 'DWD 层',
      color: '#2563eb',
      expanded: true,
      tables: [
        {
          key: 'dw_dwd.dwd_customer_profile',
          name: 'dwd_customer_profile',
          cnName: '客户画像明细表',
          type: '维度表',
          owner: '客户经营组',
          sensitivity: '受限',
          rowCount: '8,900 万',
          storageSize: '620 GB',
          partitions: '180',
          columnCount: 10,
          lastUpdated: '2024-09-20 08:58',
          tags: ['画像', '零售客户', '标签底座'],
          columns: [
            { name: 'cust_id', type: 'string', nullable: '否', comment: '客户编号', sample: 'C2024091001', sensitivity: '高' },
            { name: 'risk_level', type: 'string', nullable: '是', comment: '风险等级', sample: 'R2', sensitivity: '中' },
            { name: 'aum_amt', type: 'decimal(18,2)', nullable: '是', comment: '资产余额', sample: '128900.00', sensitivity: '高' },
            { name: 'branch_no', type: 'string', nullable: '否', comment: '归属机构', sample: '3101', sensitivity: '中' }
          ],
          sampleRows: [
            { cust_id: 'C2024091001', risk_level: 'R2', aum_amt: '128900.00', branch_no: '3101' },
            { cust_id: 'C2024091002', risk_level: 'R3', aum_amt: '88200.50', branch_no: '3102' },
            { cust_id: 'C2024091003', risk_level: 'R1', aum_amt: '560000.00', branch_no: '2201' },
            { cust_id: 'C2024091004', risk_level: 'R4', aum_amt: '23000.10', branch_no: '3301' },
            { cust_id: 'C2024091005', risk_level: 'R2', aum_amt: '91020.00', branch_no: '4401' }
          ],
          freshness: [88, 90, 92, 93, 95, 97, 96],
          trend: [82, 84, 85, 86, 87, 88, 89]
        }
      ]
    },
    {
      key: 'dw_dws',
      name: 'dw_dws',
      label: 'DWS 层',
      color: '#16a34a',
      expanded: true,
      tables: [
        {
          key: 'dw_dws.dws_public_trade_summary',
          name: 'dws_public_trade_summary',
          cnName: '对公交易汇总表',
          type: '汇总表',
          owner: '公司金融组',
          sensitivity: '内部敏感',
          rowCount: '1,240 万',
          storageSize: '180 GB',
          partitions: '90',
          columnCount: 7,
          lastUpdated: '2024-09-20 09:05',
          tags: ['交易汇总', '公司金融', '对账'],
          columns: [
            { name: 'trade_date', type: 'date', nullable: '否', comment: '交易日期', sample: '2024-09-20', sensitivity: '低' },
            { name: 'org_no', type: 'string', nullable: '否', comment: '机构号', sample: '3101', sensitivity: '中' },
            { name: 'trade_cnt', type: 'bigint', nullable: '否', comment: '交易笔数', sample: '12030', sensitivity: '低' },
            { name: 'trade_amt', type: 'decimal(18,2)', nullable: '否', comment: '交易金额', sample: '820012399.00', sensitivity: '中' }
          ],
          sampleRows: [
            { trade_date: '2024-09-20', org_no: '3101', trade_cnt: '12030', trade_amt: '820012399.00' },
            { trade_date: '2024-09-20', org_no: '3102', trade_cnt: '9801', trade_amt: '610129992.10' },
            { trade_date: '2024-09-20', org_no: '2201', trade_cnt: '7621', trade_amt: '420893112.30' },
            { trade_date: '2024-09-20', org_no: '3301', trade_cnt: '11420', trade_amt: '710339901.42' },
            { trade_date: '2024-09-20', org_no: '4401', trade_cnt: '8300', trade_amt: '502112832.20' }
          ],
          freshness: [85, 87, 89, 90, 92, 93, 94],
          trend: [11, 11.3, 11.5, 11.7, 11.9, 12.1, 12.4]
        }
      ]
    },
    {
      key: 'dw_ads',
      name: 'dw_ads',
      label: 'ADS 层',
      color: '#f59e0b',
      expanded: true,
      tables: [
        {
          key: 'dw_ads.ads_mobile_marketing_tag',
          name: 'ads_mobile_marketing_tag',
          cnName: '手机银行营销标签表',
          type: '汇总表',
          owner: '营销分析组',
          sensitivity: '受限',
          rowCount: '2,980 万',
          storageSize: '95 GB',
          partitions: '60',
          columnCount: 6,
          lastUpdated: '2024-09-20 07:36',
          tags: ['营销标签', 'APP 运营', '外呼圈选'],
          columns: [
            { name: 'cust_id', type: 'string', nullable: '否', comment: '客户编号', sample: 'C2024091001', sensitivity: '高' },
            { name: 'tag_code', type: 'string', nullable: '否', comment: '标签编码', sample: 'TAG_AUM', sensitivity: '中' },
            { name: 'tag_value', type: 'string', nullable: '是', comment: '标签值', sample: 'Y', sensitivity: '中' },
            { name: 'batch_date', type: 'date', nullable: '否', comment: '批次日期', sample: '2024-09-20', sensitivity: '低' }
          ],
          sampleRows: [
            { cust_id: 'C2024091001', tag_code: 'TAG_AUM', tag_value: 'Y', batch_date: '2024-09-20' },
            { cust_id: 'C2024091002', tag_code: 'TAG_LOAN', tag_value: 'N', batch_date: '2024-09-20' },
            { cust_id: 'C2024091003', tag_code: 'TAG_RISK', tag_value: 'A', batch_date: '2024-09-20' },
            { cust_id: 'C2024091004', tag_code: 'TAG_APP', tag_value: 'Y', batch_date: '2024-09-20' },
            { cust_id: 'C2024091005', tag_code: 'TAG_LIFE', tag_value: 'N', batch_date: '2024-09-20' }
          ],
          freshness: [82, 84, 85, 88, 86, 90, 87],
          trend: [25, 26, 26.4, 27.2, 28.1, 29, 29.8]
        }
      ]
    }
  ];

  const defaultScanConfigs = [
    { name: '核心客户 MySQL 扫描', db: 'mysql_core_customer', cycle: '每日', lastScan: '2024-09-20 06:00', nextScan: '2024-09-21 06:00', status: '成功', changes: 2, autoUpdate: true, progress: 100 },
    { name: 'Hive 数仓层扫描', db: 'hive_dw_bank', cycle: '每周', lastScan: '2024-09-19 23:30', nextScan: '2024-09-26 23:30', status: '成功', changes: 6, autoUpdate: true, progress: 100 },
    { name: '营销标签 PostgreSQL 扫描', db: 'pg_marketing', cycle: '变更触发', lastScan: '2024-09-20 07:20', nextScan: '等待触发', status: '运行中', changes: 1, autoUpdate: false, progress: 64 }
  ];

  const defaultChanges = [
    { time: '2024-09-20 09:15', type: '修改字段', target: 'dw_ads.ads_mobile_marketing_tag.tag_value', operator: '自动扫描', before: 'varchar(8)', after: 'varchar(16)' },
    { time: '2024-09-20 08:58', type: '新增表', target: 'dw_dwd.dwd_customer_asset_feature', operator: '人工', before: '-', after: '新增 12 个字段' },
    { time: '2024-09-19 23:32', type: '新增分区', target: 'dw_dws.dws_public_trade_summary', operator: '自动扫描', before: '2024-09-18', after: '2024-09-19' },
    { time: '2024-09-19 22:10', type: '删除字段', target: 'dw_ods.ods_core_customer.old_flag', operator: '人工', before: 'string', after: '已删除' }
  ];

  const lineageColumns = [
    { layer: 'source', title: 'Source System', color: '#e5e7eb', nodes: ['核心系统', '网银系统', '手机银行'] },
    { layer: 'ods', title: 'ODS', color: '#d1d5db', nodes: ['ods_core_customer', 'ods_public_trade', 'ods_app_event'] },
    { layer: 'dwd', title: 'DWD', color: '#dbeafe', nodes: ['dwd_customer_profile', 'dwd_trade_detail', 'dwd_app_customer'] },
    { layer: 'dws', title: 'DWS', color: '#dcfce7', nodes: ['dws_public_trade_summary', 'dws_customer_asset_summary'] },
    { layer: 'ads', title: 'ADS / Report', color: '#ffedd5', nodes: ['ads_mobile_marketing_tag', '零售客户经营报表'] }
  ];

  window.MetadataView = {
    template: `
      <div class="metadata-view meta-shell">
        <style>
          .meta-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
          .meta-shell .page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
          .meta-shell .subtle { color: #6b7280; font-size: 13px; }
          .meta-shell .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05); }
          .meta-shell .panel { padding: 16px; }
          .meta-shell .tab-row, .meta-shell .actions, .meta-shell .legend-row, .meta-shell .tree-title { display: flex; gap: 8px; flex-wrap: wrap; }
          .meta-shell .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 16px; cursor: pointer; font-weight: 600; }
          .meta-shell .tab-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
          .meta-shell .catalog-layout, .meta-shell .stats-grid, .meta-shell .two-col, .meta-shell .scan-toolbar, .meta-shell .form-grid, .meta-shell .lineage-grid { display: grid; gap: 14px; }
          .meta-shell .catalog-layout { grid-template-columns: 25% 75%; }
          .meta-shell .stats-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .meta-shell .two-col { grid-template-columns: 1.1fr 0.9fr; align-items: start; }
          .meta-shell .scan-toolbar { grid-template-columns: 1fr auto auto; align-items: end; }
          .meta-shell .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .meta-shell .lineage-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: start; }
          .meta-shell .input, .meta-shell .select, .meta-shell textarea { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
          .meta-shell textarea { min-height: 88px; resize: vertical; }
          .meta-shell .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .meta-shell .badge-blue { background: #dbeafe; color: #1d4ed8; }
          .meta-shell .badge-green { background: #dcfce7; color: #15803d; }
          .meta-shell .badge-orange { background: #ffedd5; color: #c2410c; }
          .meta-shell .badge-red { background: #fee2e2; color: #b91c1c; }
          .meta-shell .badge-gray { background: #f3f4f6; color: #4b5563; }
          .meta-shell .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
          .meta-shell .btn-primary { background: #1d4ed8; color: #fff; }
          .meta-shell .btn-secondary { background: #eff6ff; color: #1d4ed8; }
          .meta-shell .btn-muted { background: #f3f4f6; color: #374151; }
          .meta-shell .tree-node { border-radius: 12px; padding: 12px; border: 1px solid #e5e7eb; background: #f8fafc; margin-bottom: 12px; }
          .meta-shell .tree-table { padding: 8px 10px; border-radius: 10px; margin-top: 8px; cursor: pointer; background: #fff; border: 1px solid transparent; }
          .meta-shell .tree-table.active { border-color: #93c5fd; background: #eff6ff; }
          .meta-shell .detail-block { padding: 14px; border-radius: 12px; border: 1px solid #e5e7eb; background: #f8fafc; }
          .meta-shell .inner-tabs { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
          .meta-shell .inner-tab { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 7px 14px; cursor: pointer; }
          .meta-shell .inner-tab.active { background: #eff6ff; border-color: #60a5fa; color: #1d4ed8; }
          .meta-shell .table-wrap { overflow: auto; }
          .meta-shell table { width: 100%; border-collapse: collapse; }
          .meta-shell th, .meta-shell td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; font-size: 13px; }
          .meta-shell th { background: #f8fafc; font-weight: 700; }
          .meta-shell .trend-bars, .meta-shell .fresh-bars { display: flex; align-items: end; gap: 8px; height: 150px; }
          .meta-shell .bar { flex: 1; border-radius: 10px 10px 0 0; position: relative; }
          .meta-shell .bar span { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #475569; }
          .meta-shell .fresh { background: linear-gradient(180deg, #86efac, #16a34a); }
          .meta-shell .trend { background: linear-gradient(180deg, #93c5fd, #2563eb); }
          .meta-shell .pill-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .meta-shell .pill { background: #eef2ff; color: #4338ca; padding: 5px 10px; border-radius: 999px; font-size: 12px; }
          .meta-shell .lineage-col { position: relative; padding-top: 10px; }
          .meta-shell .lineage-col:not(:last-child)::after { content: ''; position: absolute; right: -7px; top: 86px; width: 14px; border-top: 2px dashed #cbd5e1; }
          .meta-shell .lineage-node { position: relative; margin-bottom: 16px; padding: 14px; border-radius: 12px; text-align: center; cursor: pointer; border: 1px solid #d1d5db; }
          .meta-shell .lineage-node.highlight { outline: 2px solid #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12); }
          .meta-shell .legend-box { width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
          .meta-shell .progress { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; }
          .meta-shell .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #0ea5e9); }
          .meta-shell .timeline { position: relative; margin-left: 8px; }
          .meta-shell .timeline::before { content: ''; position: absolute; left: 7px; top: 6px; bottom: 6px; width: 2px; background: #dbeafe; }
          .meta-shell .timeline-item { position: relative; padding-left: 28px; margin-bottom: 16px; }
          .meta-shell .timeline-item::before { content: ''; position: absolute; left: 0; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #dbeafe; }
          .meta-shell .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
          .meta-shell .modal-card { background: #fff; border-radius: 16px; width: min(920px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
          @media (max-width: 1200px) {
            .meta-shell .catalog-layout, .meta-shell .stats-grid, .meta-shell .two-col, .meta-shell .scan-toolbar, .meta-shell .form-grid, .meta-shell .lineage-grid { grid-template-columns: 1fr; }
          }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px;">
          <div>
            <h1 class="page-title">元数据库自动扫描与管理</h1>
            <div class="subtle">统一呈现元数据目录、表级血缘、自动扫描配置与结构变更历史。</div>
          </div>
          <div class="actions">
            <button class="btn btn-secondary" @click="triggerManualScan">手动触发扫描</button>
            <button class="btn btn-primary" @click="showScanModal = true">新增扫描配置</button>
          </div>
        </div>

        <div class="tab-row" style="margin-bottom:16px;">
          <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
        </div>

        <div v-if="activeTab === 'catalog'" class="catalog-layout">
          <div class="card panel">
            <h2 style="margin:0 0 12px; font-size:18px;">元数据目录</h2>
            <div class="tree-node" v-for="layer in catalog" :key="layer.key">
              <div class="tree-title" style="justify-content:space-between; align-items:center; cursor:pointer;" @click="layer.expanded = !layer.expanded">
                <div>
                  <strong>{{ layer.name }}</strong>
                  <div class="subtle">{{ layer.label }}</div>
                </div>
                <span class="badge badge-gray">{{ layer.tables.length }} 张表</span>
              </div>
              <div v-if="layer.expanded" style="margin-top:8px;">
                <div v-for="table in layer.tables" :key="table.key" class="tree-table" :class="{ active: selectedTableKey === table.key }" @click="selectTable(table.key)">
                  <div style="font-weight:700;">{{ table.name }}</div>
                  <div class="subtle">{{ table.cnName }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card panel" v-if="activeTable">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">{{ activeTable.key }}</h2>
                <div class="actions">
                  <span class="badge" :class="tableTypeClass(activeTable.type)">{{ activeTable.type }}</span>
                  <span class="subtle">中文名：{{ activeTable.cnName }}</span>
                  <span class="subtle">负责人：{{ activeTable.owner }}</span>
                  <span class="subtle">敏感级别：{{ activeTable.sensitivity }}</span>
                </div>
              </div>
              <button class="btn btn-secondary" @click="activeTab = 'lineage'">查看血缘</button>
            </div>

            <div class="stats-grid" style="margin-bottom:16px;">
              <div class="detail-block"><strong>行数</strong><div style="font-size:22px; font-weight:700; margin-top:8px;">{{ activeTable.rowCount }}</div></div>
              <div class="detail-block"><strong>存储大小</strong><div style="font-size:22px; font-weight:700; margin-top:8px;">{{ activeTable.storageSize }}</div></div>
              <div class="detail-block"><strong>分区数</strong><div style="font-size:22px; font-weight:700; margin-top:8px;">{{ activeTable.partitions }}</div></div>
              <div class="detail-block"><strong>字段数</strong><div style="font-size:22px; font-weight:700; margin-top:8px;">{{ activeTable.columnCount }}</div></div>
              <div class="detail-block"><strong>最近更新</strong><div style="font-size:18px; font-weight:700; margin-top:8px;">{{ activeTable.lastUpdated }}</div></div>
            </div>

            <div class="inner-tabs">
              <button class="inner-tab" :class="{ active: detailTab === 'columns' }" @click="detailTab = 'columns'">字段信息</button>
              <button class="inner-tab" :class="{ active: detailTab === 'sample' }" @click="detailTab = 'sample'">样例数据</button>
              <button class="inner-tab" :class="{ active: detailTab === 'stats' }" @click="detailTab = 'stats'">统计分析</button>
            </div>

            <div v-if="detailTab === 'columns'" class="two-col">
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>字段名</th>
                      <th>数据类型</th>
                      <th>可空</th>
                      <th>中文注释</th>
                      <th>样例值</th>
                      <th>敏感级别</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in activeTable.columns" :key="column.name">
                      <td><strong>{{ column.name }}</strong></td>
                      <td>{{ column.type }}</td>
                      <td>{{ column.nullable }}</td>
                      <td>{{ column.comment }}</td>
                      <td>{{ column.sample }}</td>
                      <td><span class="badge" :class="sensitivityClass(column.sensitivity)">{{ column.sensitivity }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="detail-block">
                <strong>标签 / 分类</strong>
                <div class="pill-list" style="margin-top:10px;">
                  <span class="pill" v-for="tag in activeTable.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
            </div>

            <div v-if="detailTab === 'sample'" class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th v-for="key in sampleColumns" :key="key">{{ key }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in activeTable.sampleRows" :key="index">
                    <td v-for="key in sampleColumns" :key="key + index">{{ row[key] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="detailTab === 'stats'" class="two-col">
              <div class="detail-block">
                <strong>近 7 天新鲜度</strong>
                <div class="fresh-bars" style="margin-top:18px;">
                  <div v-for="(value, index) in activeTable.freshness" :key="index" class="bar fresh" :style="{ height: value + '%' }"><span>{{ value }}</span></div>
                </div>
              </div>
              <div class="detail-block">
                <strong>近 7 天行数趋势（百万）</strong>
                <div class="trend-bars" style="margin-top:18px;">
                  <div v-for="(value, index) in activeTable.trend" :key="index" class="bar trend" :style="{ height: (value / maxTrendValue) * 100 + '%' }"><span>{{ value }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'lineage'" class="card panel">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:16px; flex-wrap:wrap;">
            <div>
              <h2 style="margin:0 0 6px; font-size:18px;">数据血缘视图</h2>
              <div class="subtle">Source system → ODS → DWD → DWS → ADS/Report</div>
            </div>
            <div style="min-width:300px;">
              <label class="subtle">按表名搜索</label>
              <input class="input" v-model="lineageSearch" placeholder="例如：dwd_customer_profile" />
            </div>
          </div>

          <div class="legend-row" style="margin-bottom:16px; align-items:center;">
            <span><span class="legend-box" style="background:#d1d5db;"></span> ODS</span>
            <span><span class="legend-box" style="background:#dbeafe;"></span> DWD</span>
            <span><span class="legend-box" style="background:#dcfce7;"></span> DWS</span>
            <span><span class="legend-box" style="background:#ffedd5;"></span> ADS</span>
          </div>

          <div class="lineage-grid">
            <div class="lineage-col" v-for="column in lineageColumns" :key="column.layer">
              <div class="detail-block" style="text-align:center; margin-bottom:12px;"><strong>{{ column.title }}</strong></div>
              <div v-for="node in column.nodes" :key="node" class="lineage-node" :class="{ highlight: isLineageMatch(node) }" :style="{ background: column.color }" @click="showLineageNode(node)">
                {{ node }}
              </div>
            </div>
          </div>

          <div class="detail-block" style="margin-top:16px;" v-if="lineageNodeInfo">
            <strong>节点详情</strong>
            <div style="margin-top:8px;">{{ lineageNodeInfo }}</div>
          </div>
        </div>

        <div v-if="activeTab === 'scan'">
          <div class="card panel" style="margin-bottom:16px;">
            <div class="scan-toolbar">
              <div>
                <label class="subtle">扫描状态概览</label>
                <div class="detail-block" style="margin-top:6px;">当前共 {{ scanConfigs.length }} 个扫描配置，{{ scanConfigs.filter(item => item.status === '运行中').length }} 个正在运行。</div>
              </div>
              <button class="btn btn-secondary" @click="triggerManualScan">手动扫描</button>
              <button class="btn btn-primary" @click="showScanModal = true">新增配置</button>
            </div>
          </div>

          <div class="card panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>配置名称</th>
                  <th>目标数据库</th>
                  <th>扫描周期</th>
                  <th>上次扫描</th>
                  <th>下次扫描</th>
                  <th>扫描状态</th>
                  <th>发现变更</th>
                  <th>自动更新</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in scanConfigs" :key="item.name">
                  <td><strong>{{ item.name }}</strong></td>
                  <td>{{ item.db }}</td>
                  <td>{{ item.cycle }}</td>
                  <td>{{ item.lastScan }}</td>
                  <td>{{ item.nextScan }}</td>
                  <td>
                    <span class="badge" :class="scanStatusClass(item.status)">{{ item.status }}</span>
                    <div class="progress" style="margin-top:6px;"><div class="progress-bar" :style="{ width: item.progress + '%' }"></div></div>
                  </td>
                  <td>{{ item.changes }}</td>
                  <td>{{ item.autoUpdate ? '是' : '否' }}</td>
                  <td><button class="btn btn-link" @click="runScan(item)">立即执行</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="activeTab === 'history'">
          <div class="card panel" style="margin-bottom:16px;">
            <div class="form-grid">
              <div>
                <label class="subtle">表名过滤</label>
                <input class="input" v-model="historyFilter.table" placeholder="例如：ads_mobile_marketing_tag" />
              </div>
              <div>
                <label class="subtle">变更类型</label>
                <select class="select" v-model="historyFilter.type">
                  <option value="">全部</option>
                  <option value="新增表">新增表</option>
                  <option value="修改字段">修改字段</option>
                  <option value="删除字段">删除字段</option>
                  <option value="新增分区">新增分区</option>
                </select>
              </div>
              <div>
                <label class="subtle">开始日期</label>
                <input class="input" type="date" v-model="historyFilter.start" />
              </div>
              <div>
                <label class="subtle">结束日期</label>
                <input class="input" type="date" v-model="historyFilter.end" />
              </div>
            </div>
            <div class="actions" style="margin-top:12px; justify-content:flex-end;">
              <button class="btn btn-secondary" @click="exportHistory">导出变更历史</button>
            </div>
          </div>

          <div class="card panel timeline">
            <div class="timeline-item" v-for="item in filteredChanges" :key="item.time + item.target">
              <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <strong>{{ item.type }}｜{{ item.target }}</strong>
                <span class="subtle">{{ item.time }}｜{{ item.operator }}</span>
              </div>
              <div style="margin-top:8px; line-height:1.8;">
                <div><strong>Before：</strong>{{ item.before }}</div>
                <div><strong>After：</strong>{{ item.after }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-mask" v-if="showScanModal">
          <div class="modal-card">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
              <div>
                <h2 style="margin:0 0 6px; font-size:22px;">新增扫描配置</h2>
                <div class="subtle">配置连接类型、JDBC 信息、扫描范围、调度周期与通知策略。</div>
              </div>
              <button class="btn btn-muted" @click="showScanModal = false">关闭</button>
            </div>
            <div class="form-grid">
              <div>
                <label class="subtle">连接类型</label>
                <select class="select" v-model="scanForm.dbType">
                  <option>MySQL</option>
                  <option>Oracle</option>
                  <option>Hive</option>
                  <option>PostgreSQL</option>
                </select>
              </div>
              <div>
                <label class="subtle">配置名称</label>
                <input class="input" v-model="scanForm.name" placeholder="例如：Hive 数仓层扫描" />
              </div>
              <div>
                <label class="subtle">Host</label>
                <input class="input" v-model="scanForm.host" placeholder="10.10.10.10" />
              </div>
              <div>
                <label class="subtle">Port</label>
                <input class="input" v-model="scanForm.port" placeholder="3306" />
              </div>
              <div>
                <label class="subtle">数据库名</label>
                <input class="input" v-model="scanForm.dbName" placeholder="dw_bank" />
              </div>
              <div>
                <label class="subtle">扫描范围</label>
                <select class="select" v-model="scanForm.scope">
                  <option>all schemas</option>
                  <option>selected schemas</option>
                </select>
              </div>
              <div>
                <label class="subtle">调度周期</label>
                <select class="select" v-model="scanForm.schedule">
                  <option>daily</option>
                  <option>weekly</option>
                  <option>on-change trigger</option>
                </select>
              </div>
              <div>
                <label class="subtle">自动更新元数据</label>
                <select class="select" v-model="scanForm.autoUpdate">
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </div>
              <div style="grid-column:1 / -1;">
                <label class="subtle">通知设置</label>
                <input class="input" v-model="scanForm.notify" placeholder="metadata@bank.com; 钉钉元数据群" />
              </div>
            </div>
            <div class="actions" style="margin-top:14px;">
              <button class="btn btn-primary" @click="saveScanConfig">保存配置</button>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      const catalog = pickArray('metadataCatalog', defaultCatalog);
      const firstTable = catalog[0] && catalog[0].tables[0] ? catalog[0].tables[0].key : '';
      return {
        tabs: [
          { key: 'catalog', label: '元数据目录' },
          { key: 'lineage', label: '数据血缘' },
          { key: 'scan', label: '扫描配置' },
          { key: 'history', label: '变更历史' }
        ],
        activeTab: 'catalog',
        catalog,
        detailTab: 'columns',
        selectedTableKey: firstTable,
        lineageColumns,
        lineageSearch: '',
        lineageNodeInfo: '',
        scanConfigs: pickArray('scanConfigs', defaultScanConfigs),
        changeHistory: pickArray('metadataChanges', defaultChanges),
        historyFilter: { table: '', type: '', start: '', end: '' },
        showScanModal: false,
        scanForm: {
          dbType: 'MySQL',
          name: '',
          host: '',
          port: '3306',
          dbName: '',
          scope: 'all schemas',
          schedule: 'daily',
          autoUpdate: 'true',
          notify: ''
        },
        scanTimer: null
      };
    },
    computed: {
      flatTables() {
        return this.catalog.reduce((all, layer) => all.concat(layer.tables), []);
      },
      activeTable() {
        return this.flatTables.find(item => item.key === this.selectedTableKey) || null;
      },
      sampleColumns() {
        return this.activeTable && this.activeTable.sampleRows[0] ? Object.keys(this.activeTable.sampleRows[0]) : [];
      },
      maxTrendValue() {
        return this.activeTable ? Math.max.apply(null, this.activeTable.trend) : 100;
      },
      filteredChanges() {
        return this.changeHistory.filter(item => {
          const tableMatch = !this.historyFilter.table || item.target.indexOf(this.historyFilter.table) > -1;
          const typeMatch = !this.historyFilter.type || item.type === this.historyFilter.type;
          const startMatch = !this.historyFilter.start || item.time >= this.historyFilter.start;
          const endMatch = !this.historyFilter.end || item.time <= this.historyFilter.end + ' 23:59';
          return tableMatch && typeMatch && startMatch && endMatch;
        });
      }
    },
    methods: {
      selectTable(key) {
        this.selectedTableKey = key;
      },
      tableTypeClass(type) {
        return {
          '事实表': 'badge-gray',
          '维度表': 'badge-blue',
          '汇总表': 'badge-green'
        }[type] || 'badge-gray';
      },
      sensitivityClass(level) {
        return {
          '高': 'badge-red',
          '中': 'badge-orange',
          '低': 'badge-blue'
        }[level] || 'badge-gray';
      },
      isLineageMatch(node) {
        if (!this.lineageSearch) {
          return false;
        }
        return node.toLowerCase().indexOf(this.lineageSearch.toLowerCase()) > -1;
      },
      showLineageNode(node) {
        const table = this.flatTables.find(item => item.name === node || item.key === node);
        this.lineageNodeInfo = table ? (table.key + '｜' + table.cnName + '｜负责人：' + table.owner + '｜最近更新：' + table.lastUpdated) : (node + '：上游 / 下游链路节点，点击后可结合目录查看明细。');
      },
      scanStatusClass(status) {
        return {
          '成功': 'badge-green',
          '运行中': 'badge-blue',
          '失败': 'badge-red'
        }[status] || 'badge-gray';
      },
      runScan(item) {
        item.status = '运行中';
        item.progress = 10;
        const timer = setInterval(() => {
          item.progress = Math.min(item.progress + 30, 100);
          if (item.progress === 100) {
            item.status = '成功';
            item.lastScan = '2024-09-20 10:08';
            item.nextScan = item.cycle === '每日' ? '2024-09-21 10:08' : item.nextScan;
            clearInterval(timer);
          }
        }, 600);
      },
      triggerManualScan() {
        this.scanConfigs.forEach(item => {
          if (item.status !== '运行中') {
            this.runScan(item);
          }
        });
      },
      saveScanConfig() {
        this.scanConfigs.unshift({
          name: this.scanForm.name || this.scanForm.dbType + ' 扫描',
          db: this.scanForm.dbName || this.scanForm.host,
          cycle: this.scanForm.schedule,
          lastScan: '未执行',
          nextScan: '待调度',
          status: '成功',
          changes: 0,
          autoUpdate: this.scanForm.autoUpdate === 'true',
          progress: 100
        });
        this.showScanModal = false;
        this.scanForm = { dbType: 'MySQL', name: '', host: '', port: '3306', dbName: '', scope: 'all schemas', schedule: 'daily', autoUpdate: 'true', notify: '' };
      },
      exportHistory() {
        alert('已导出 ' + this.filteredChanges.length + ' 条元数据变更历史记录');
      }
    },
    beforeUnmount() {
      clearInterval(this.scanTimer);
    }
  };
})();
