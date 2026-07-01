window.DevSpecView = {
  template: `
    <div class="devspec-view spec-shell">
      <style>
        .spec-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
        .spec-layout { display: grid; grid-template-columns: 30% 70%; gap: 16px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); }
        .panel { padding: 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
        .subtle { color: #6b7280; font-size: 13px; }
        .toolbar, .form-grid, .meta-grid { display: grid; gap: 12px; }
        .toolbar { grid-template-columns: 1fr 160px; }
        .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .meta-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .input, .select, textarea { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
        textarea { min-height: 90px; resize: vertical; }
        .list-item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 10px; cursor: pointer; background: #fff; }
        .list-item.active { border-color: #2563eb; background: #eff6ff; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-green { background: #dcfce7; color: #15803d; }
        .badge-orange { background: #ffedd5; color: #c2410c; }
        .badge-red { background: #fee2e2; color: #b91c1c; }
        .badge-gray { background: #f3f4f6; color: #4b5563; }
        .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #1d4ed8; color: #fff; }
        .btn-secondary { background: #eff6ff; color: #1d4ed8; }
        .btn-muted { background: #f3f4f6; color: #374151; }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .tab-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
        .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
        .tab-btn.active { border-color: #1d4ed8; background: #1d4ed8; color: #fff; }
        .detail-block { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .section-title { margin: 0 0 10px; font-size: 18px; font-weight: 700; }
        .code-block { background: #0f172a; color: #e2e8f0; border-radius: 12px; padding: 16px; white-space: pre-wrap; font-family: Consolas, monospace; overflow: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
        th { background: #f9fafb; font-weight: 700; }
        .timeline { position: relative; margin-left: 8px; }
        .timeline:before { content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px; width: 2px; background: #dbeafe; }
        .timeline-item { position: relative; padding-left: 28px; margin-bottom: 16px; }
        .timeline-item:before { content: ''; position: absolute; left: 0; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #dbeafe; }
        .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
        .modal-card { background: #fff; border-radius: 16px; width: min(960px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
        .empty-state { display: flex; align-items: center; justify-content: center; min-height: 480px; text-align: center; color: #6b7280; }
        @media (max-width: 1100px) { .spec-layout, .toolbar, .form-grid, .meta-grid { grid-template-columns: 1fr; } }
      </style>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px;">
        <div>
          <h1 class="page-title">数据规范开发</h1>
          <div class="subtle">围绕需求、表结构、加工逻辑、质量规则与复核意见形成全生命周期规范文档。</div>
        </div>
        <button class="btn btn-primary" @click="openNewSpecModal">新建规范</button>
      </div>

      <div class="spec-layout">
        <div class="card panel">
          <div class="toolbar" style="margin-bottom:14px;">
            <input class="input" v-model="searchKeyword" placeholder="搜索规范编号 / 标题 / 需求" />
            <select class="select" v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="编制中">编制中</option>
              <option value="待复核">待复核</option>
              <option value="已发布">已发布</option>
            </select>
          </div>

          <div v-for="spec in filteredSpecs" :key="spec.id" class="list-item" :class="{ active: spec.id === selectedSpecId }" @click="selectedSpecId = spec.id">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
              <strong>{{ spec.number }}</strong>
              <span class="badge badge-blue">{{ spec.version }}</span>
            </div>
            <div style="font-weight:700; margin:8px 0 6px;">{{ spec.title }}</div>
            <div class="actions" style="justify-content:space-between; align-items:center;">
              <span class="badge" :class="statusClass(spec.status)">{{ spec.status }}</span>
              <span class="subtle">{{ spec.requirementId }}</span>
            </div>
          </div>
        </div>

        <div class="card panel" v-if="selectedSpec">
          <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap;">
            <div>
              <h2 class="section-title" style="font-size:24px; margin-bottom:6px;">{{ selectedSpec.title }}</h2>
              <div class="actions">
                <span class="badge badge-blue">{{ selectedSpec.version }}</span>
                <span class="badge" :class="statusClass(selectedSpec.status)">{{ selectedSpec.status }}</span>
                <span class="subtle">作者：{{ selectedSpec.author }}</span>
                <span class="subtle">创建：{{ selectedSpec.createdAt }}</span>
                <span class="subtle">更新：{{ selectedSpec.updatedAt }}</span>
              </div>
            </div>
            <div class="actions">
              <button class="btn btn-secondary" @click="selectedSpec.status = '编制中'">编辑</button>
              <button class="btn btn-secondary" @click="submitReview">提交复核</button>
              <button class="btn btn-muted" @click="exportSpec">导出PDF</button>
            </div>
          </div>

          <div class="tab-row">
            <button class="tab-btn" :class="{ active: detailTab === 'basic' }" @click="detailTab = 'basic'">基本信息</button>
            <button class="tab-btn" :class="{ active: detailTab === 'ddl' }" @click="detailTab = 'ddl'">表结构设计</button>
            <button class="tab-btn" :class="{ active: detailTab === 'logic' }" @click="detailTab = 'logic'">加工逻辑</button>
            <button class="tab-btn" :class="{ active: detailTab === 'quality' }" @click="detailTab = 'quality'">质量规则</button>
            <button class="tab-btn" :class="{ active: detailTab === 'history' }" @click="detailTab = 'history'">版本历史</button>
            <button class="tab-btn" :class="{ active: detailTab === 'review' }" @click="detailTab = 'review'">复核意见</button>
          </div>

          <div v-if="detailTab === 'basic'">
            <div class="detail-block meta-grid">
              <div><strong>需求编号：</strong>{{ selectedSpec.requirementId }}</div>
              <div><strong>目标用途：</strong>{{ selectedSpec.basicInfo.targetUse }}</div>
              <div><strong>数据域：</strong>{{ selectedSpec.basicInfo.domain }}</div>
              <div><strong>建设范围：</strong>{{ selectedSpec.basicInfo.scope }}</div>
            </div>
            <div class="detail-block">
              <strong>业务描述</strong>
              <p style="line-height:1.8; margin:8px 0 0;">{{ selectedSpec.basicInfo.businessDescription }}</p>
            </div>
            <div class="detail-block">
              <strong>数据血缘描述</strong>
              <p style="line-height:1.8; margin:8px 0 0;">{{ selectedSpec.basicInfo.lineageDescription }}</p>
            </div>
          </div>

          <div v-if="detailTab === 'ddl'">
            <div class="detail-block">
              <strong>DDL 设计</strong>
              <pre class="code-block">{{ selectedSpec.ddl }}</pre>
            </div>
            <div class="detail-block">
              <strong>字段说明</strong>
              <table>
                <thead>
                  <tr>
                    <th>字段名</th>
                    <th>类型</th>
                    <th>说明</th>
                    <th>标准映射</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="col in selectedSpec.columns" :key="col.name">
                    <td>{{ col.name }}</td>
                    <td>{{ col.type }}</td>
                    <td>{{ col.description }}</td>
                    <td>{{ col.standardRef }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="detailTab === 'logic'">
            <div class="detail-block">
              <strong>源表 → 转换规则 → 目标字段</strong>
              <table>
                <thead>
                  <tr>
                    <th>源表</th>
                    <th>转换规则</th>
                    <th>目标字段</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedSpec.transformations" :key="item.sourceTable + item.targetField">
                    <td>{{ item.sourceTable }}</td>
                    <td>{{ item.rule }}</td>
                    <td>{{ item.targetField }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-block">
              <strong>业务规则</strong>
              <ol style="margin:10px 0 0; padding-left:18px; line-height:1.9;">
                <li v-for="rule in selectedSpec.businessRules" :key="rule">{{ rule }}</li>
              </ol>
            </div>
          </div>

          <div v-if="detailTab === 'quality'">
            <div class="detail-block">
              <table>
                <thead>
                  <tr>
                    <th>规则编码</th>
                    <th>规则描述</th>
                    <th>阻断级别</th>
                    <th>阈值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rule in selectedSpec.qualityRules" :key="rule.code">
                    <td>{{ rule.code }}</td>
                    <td>{{ rule.description }}</td>
                    <td><span class="badge" :class="rule.level === '阻断' ? 'badge-red' : 'badge-orange'">{{ rule.level }}</span></td>
                    <td>{{ rule.threshold }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="detailTab === 'history'" class="timeline">
            <div class="timeline-item" v-for="item in selectedSpec.versionHistory" :key="item.version">
              <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <strong>{{ item.version }}</strong>
                <span class="subtle">{{ item.date }}｜{{ item.author }}</span>
              </div>
              <div style="margin-top:6px; line-height:1.8;">{{ item.summary }}</div>
            </div>
          </div>

          <div v-if="detailTab === 'review'" class="timeline">
            <div class="timeline-item" v-for="item in selectedSpec.reviews" :key="item.date + item.reviewer">
              <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <strong>{{ item.reviewer }}</strong>
                <span class="subtle">{{ item.date }}</span>
              </div>
              <div style="margin-top:6px; line-height:1.8;">{{ item.comment }}</div>
            </div>
          </div>
        </div>

        <div class="card panel empty-state" v-else>
          <div>
            <div style="font-size:20px; font-weight:700; margin-bottom:8px;">请选择左侧数据规范</div>
            <div>可查看表结构设计、加工逻辑、质量规则与复核过程。</div>
          </div>
        </div>
      </div>

      <div class="modal-mask" v-if="showNewSpecModal">
        <div class="modal-card">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
            <div>
              <h2 class="section-title">新建规范</h2>
              <div class="subtle">选择需求与模板后，可一键生成标准化 DDL 和加工逻辑骨架。</div>
            </div>
            <button class="btn btn-muted" @click="showNewSpecModal = false">关闭</button>
          </div>

          <div class="form-grid">
            <div>
              <label class="subtle">关联需求</label>
              <select class="select" v-model="newSpec.requirementId">
                <option v-for="req in requirements" :key="req.id" :value="req.id">{{ req.id }}｜{{ req.name }}</option>
              </select>
            </div>
            <div>
              <label class="subtle">模板选择</label>
              <select class="select" v-model="newSpec.template">
                <option v-for="item in templates" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div style="grid-column:1 / -1;">
              <label class="subtle">规范标题</label>
              <input class="input" v-model="newSpec.title" placeholder="例如：零售客户统一视图维度表规范" />
            </div>
            <div style="grid-column:1 / -1;">
              <label class="subtle">规范描述</label>
              <textarea v-model="newSpec.description" placeholder="描述规范建设目标、范围及应用场景"></textarea>
            </div>
          </div>

          <div class="actions" style="margin:16px 0; justify-content:flex-end;">
            <button class="btn btn-secondary" @click="generateFromTemplate">从模板生成</button>
            <button class="btn btn-primary" @click="saveNewSpec">保存规范</button>
          </div>

          <div class="detail-block" v-if="newSpecPreview">
            <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center;">
              <strong>模板预览：{{ newSpec.template }}</strong>
              <span class="badge badge-blue">{{ newSpecPreview.version }}</span>
            </div>
            <pre class="code-block" style="margin-top:12px;">{{ newSpecPreview.ddl }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  data: function () {
    var mock = window.MockData || {};
    var clone = function (value, fallback) {
      return JSON.parse(JSON.stringify(value || fallback));
    };
    var requirements = clone(mock.requirements, [
      { id: 'REQ-2025-001', name: '零售客户统一视图建设' },
      { id: 'REQ-2025-014', name: '对公账户全量画像整合' },
      { id: 'REQ-2025-027', name: '监管报送字段标准化整改' }
    ]);
    var specs = clone(mock.specs, [
      {
        id: 'spec-001', number: 'SPEC-2025-001', title: '零售客户统一视图维度表规范', version: 'v1.3', status: '待复核', requirementId: 'REQ-2025-001',
        author: '张敏', createdAt: '2025-03-01', updatedAt: '2025-03-28',
        basicInfo: {
          targetUse: '客户 360 画像、营销触达、监管抽数', domain: '客户', scope: 'ODS → DWD → ADS',
          businessDescription: '整合核心、CRM、手机银行等客户主数据，统一形成零售客户维度主表，提供客户标签和统计报送基础。',
          lineageDescription: '源于 core.cust_master、crm.customer_profile、app.user_identity，经过去重、并户、标签标准化后写入 dwd.dim_retail_customer。'
        },
        ddl: 'CREATE TABLE dwd.dim_retail_customer (\n  customer_unified_id VARCHAR(32) NOT NULL COMMENT \'客户统一编号\',\n  customer_name VARCHAR(128) COMMENT \'客户名称\',\n  cert_no VARCHAR(18) COMMENT \'证件号码\',\n  customer_level VARCHAR(16) COMMENT \'客户分层\',\n  data_dt DATE NOT NULL COMMENT \'数据日期\'\n) COMMENT \'零售客户统一视图维度表\';',
        columns: [
          { name: 'customer_unified_id', type: 'VARCHAR(32)', description: '跨系统统一客户标识', standardRef: 'CUST-001' },
          { name: 'customer_name', type: 'VARCHAR(128)', description: '客户法定/实名名称', standardRef: 'CUST-013' },
          { name: 'cert_no', type: 'VARCHAR(18)', description: '身份证件号码', standardRef: 'CUST-021' },
          { name: 'customer_level', type: 'VARCHAR(16)', description: '客户分层标签', standardRef: 'RISK-011' },
          { name: 'data_dt', type: 'DATE', description: '数据生效日期', standardRef: 'PUB-001' }
        ],
        transformations: [
          { sourceTable: 'core.cust_master', rule: '按证件号与手机号做客户并户，保留最新主档记录', targetField: 'customer_unified_id' },
          { sourceTable: 'crm.customer_profile', rule: '映射营销分层标签并按优先级标准化', targetField: 'customer_level' },
          { sourceTable: 'app.user_identity', rule: '补充实名认证信息，缺失时回退核心主档', targetField: 'cert_no' }
        ],
        businessRules: [
          '客户统一编号按主索引系统返回结果落表，不允许在下游重新生成。',
          '同一证件号且手机号一致时优先判定为同一自然人客户。',
          '客户分层标签按营销、财富、风险优先级合并，保留最高优先级结果。'
        ],
        qualityRules: [
          { code: 'QR-CUST-001', description: '客户统一编号不能为空', level: '阻断', threshold: '空值率 = 0' },
          { code: 'QR-CUST-002', description: '证件号码需满足 18 位规则', level: '预警', threshold: '异常率 < 0.5%' },
          { code: 'QR-CUST-003', description: '客户分层必须存在标准映射', level: '预警', threshold: '未映射率 < 1%' }
        ],
        versionHistory: [
          { version: 'v1.3', date: '2025-03-28', author: '张敏', summary: '补充客户并户规则与标签优先级说明。' },
          { version: 'v1.2', date: '2025-03-18', author: '张敏', summary: '增加证件号码质量校验规则。' },
          { version: 'v1.0', date: '2025-03-01', author: '张敏', summary: '初始化客户维度表开发规范。' }
        ],
        reviews: [
          { reviewer: '李复核', date: '2025-03-29', comment: '建议在客户并户规则中补充一人多号场景的处理顺序。' },
          { reviewer: '王架构', date: '2025-03-30', comment: 'DDL 建议补充分区说明，方便大表归档。' }
        ]
      },
      {
        id: 'spec-002', number: 'SPEC-2025-014', title: '对公账户交易事实表规范', version: 'v2.0', status: '已发布', requirementId: 'REQ-2025-014',
        author: '陈超', createdAt: '2025-02-10', updatedAt: '2025-03-22',
        basicInfo: {
          targetUse: '经营分析、对公客户画像、监管抽样', domain: '交易', scope: 'ODS → DWD',
          businessDescription: '汇总企业账户交易流水，统一清洗出入账金额、交易对手和渠道信息，形成事实表。',
          lineageDescription: '源于 core.public_trade_flow、ebank.public_channel_txn，经交易类型归一化、账户维表关联后写入 dwd.fact_corp_trade_detail。'
        },
        ddl: 'CREATE TABLE dwd.fact_corp_trade_detail (\n  txn_id VARCHAR(64) NOT NULL COMMENT \'交易流水号\',\n  core_account_no VARCHAR(24) NOT NULL COMMENT \'核心账号\',\n  transaction_amount DECIMAL(18,2) NOT NULL COMMENT \'交易金额\',\n  txn_direction VARCHAR(8) COMMENT \'收支方向\',\n  txn_dt DATE NOT NULL COMMENT \'交易日期\'\n) COMMENT \'对公账户交易事实表\';',
        columns: [
          { name: 'txn_id', type: 'VARCHAR(64)', description: '交易流水唯一标识', standardRef: 'TRAN-001' },
          { name: 'core_account_no', type: 'VARCHAR(24)', description: '核心系统账号', standardRef: 'ACCT-008' },
          { name: 'transaction_amount', type: 'DECIMAL(18,2)', description: '统一交易金额', standardRef: 'TRAN-015' },
          { name: 'txn_direction', type: 'VARCHAR(8)', description: '交易方向', standardRef: 'TRAN-016' },
          { name: 'txn_dt', type: 'DATE', description: '交易日期', standardRef: 'PUB-001' }
        ],
        transformations: [
          { sourceTable: 'core.public_trade_flow', rule: '按交易码识别收支方向并转换金额正负号', targetField: 'transaction_amount' },
          { sourceTable: 'ebank.public_channel_txn', rule: '补充渠道来源字段，映射统一渠道枚举', targetField: 'txn_direction' }
        ],
        businessRules: [
          '冲正交易须与原交易双向关联，并在事实表中保留冲正标识。',
          '跨币种交易统一折算成人民币金额，同时保留原币金额字段。'
        ],
        qualityRules: [
          { code: 'QR-TRAN-001', description: '交易流水号不可重复', level: '阻断', threshold: '重复率 = 0' },
          { code: 'QR-TRAN-002', description: '金额方向需与交易类型一致', level: '预警', threshold: '异常率 < 0.2%' }
        ],
        versionHistory: [
          { version: 'v2.0', date: '2025-03-22', author: '陈超', summary: '发布正式版本并补充跨币种折算规则。' },
          { version: 'v1.5', date: '2025-03-08', author: '陈超', summary: '新增冲正规则与渠道统一映射。' }
        ],
        reviews: [
          { reviewer: '赵复核', date: '2025-03-10', comment: '建议增加交易方向与交易码的映射附录。' }
        ]
      }
    ]);
    return {
      requirements: requirements,
      templates: ['维度表', '事实表', '汇总表', '快照表', '临时加工表'],
      specs: specs,
      searchKeyword: '',
      statusFilter: '',
      selectedSpecId: specs[0] ? specs[0].id : '',
      detailTab: 'basic',
      showNewSpecModal: false,
      newSpec: {
        requirementId: requirements[0] ? requirements[0].id : '',
        title: '',
        description: '',
        template: '维度表'
      },
      newSpecPreview: null
    };
  },
  computed: {
    filteredSpecs: function () {
      var keyword = (this.searchKeyword || '').toLowerCase();
      var status = this.statusFilter;
      return this.specs.filter(function (item) {
        var hitKeyword = !keyword || [item.number, item.title, item.requirementId].join(' ').toLowerCase().indexOf(keyword) > -1;
        var hitStatus = !status || item.status === status;
        return hitKeyword && hitStatus;
      });
    },
    selectedSpec: function () {
      var current = null;
      for (var i = 0; i < this.specs.length; i += 1) {
        if (this.specs[i].id === this.selectedSpecId) {
          current = this.specs[i];
          break;
        }
      }
      return current;
    }
  },
  methods: {
    statusClass: function (status) {
      return {
        'badge-orange': status === '编制中',
        'badge-blue': status === '待复核',
        'badge-green': status === '已发布',
        'badge-gray': !status
      };
    },
    openNewSpecModal: function () {
      this.newSpec = {
        requirementId: this.requirements[0] ? this.requirements[0].id : '',
        title: '',
        description: '',
        template: '维度表'
      };
      this.newSpecPreview = null;
      this.showNewSpecModal = true;
    },
    templatePayload: function (template, title, requirementId, description) {
      var author = '当前用户';
      var today = new Date().toISOString().slice(0, 10);
      var base = {
        id: 'spec-' + Date.now(),
        number: 'SPEC-' + today.replace(/-/g, ''),
        title: title,
        version: 'v1.0',
        status: '编制中',
        requirementId: requirementId,
        author: author,
        createdAt: today,
        updatedAt: today,
        basicInfo: {
          targetUse: '数据建模、开发交付、复核发布',
          domain: template,
          scope: 'ODS → DWD/ADS',
          businessDescription: description || ('基于“' + template + '”模板自动生成的开发规范，用于支撑银行 DataOps 研发交付。'),
          lineageDescription: '源自业务系统明细表，经标准映射、清洗转换、质量校验后落地目标层。'
        },
        ddl: '',
        columns: [],
        transformations: [],
        businessRules: [],
        qualityRules: [],
        versionHistory: [{ version: 'v1.0', date: today, author: author, summary: '由模板自动生成初始规范。' }],
        reviews: [{ reviewer: '待分配', date: today, comment: '待提交复核后由审核人补充意见。' }]
      };
      if (template === '维度表') {
        base.ddl = 'CREATE TABLE dwd.dim_bank_customer_profile (\n  customer_unified_id VARCHAR(32) NOT NULL COMMENT \'客户统一编号\',\n  customer_name VARCHAR(128) COMMENT \'客户名称\',\n  customer_segment VARCHAR(16) COMMENT \'客户分层\',\n  branch_code VARCHAR(12) COMMENT \'归属机构号\',\n  data_dt DATE NOT NULL COMMENT \'数据日期\'\n) COMMENT \'银行客户维度表\';';
        base.columns = [
          { name: 'customer_unified_id', type: 'VARCHAR(32)', description: '主键，客户统一标识', standardRef: 'CUST-001' },
          { name: 'customer_name', type: 'VARCHAR(128)', description: '客户名称', standardRef: 'CUST-013' },
          { name: 'customer_segment', type: 'VARCHAR(16)', description: '客户分层标签', standardRef: 'RISK-011' },
          { name: 'branch_code', type: 'VARCHAR(12)', description: '归属机构号', standardRef: 'ORG-002' },
          { name: 'data_dt', type: 'DATE', description: '数据日期', standardRef: 'PUB-001' }
        ];
        base.transformations = [
          { sourceTable: 'core.cust_master', rule: '统一客户主键并补充机构归属', targetField: 'customer_unified_id' },
          { sourceTable: 'crm.customer_tag', rule: '客户标签标准化映射', targetField: 'customer_segment' }
        ];
        base.businessRules = ['同一客户多渠道记录按统一客户编号汇总。', '机构归属优先取开户机构，缺失时回退最近服务机构。'];
      } else if (template === '事实表') {
        base.ddl = 'CREATE TABLE dwd.fact_bank_transaction (\n  txn_id VARCHAR(64) NOT NULL COMMENT \'交易流水号\',\n  customer_unified_id VARCHAR(32) NOT NULL COMMENT \'客户统一编号\',\n  transaction_amount DECIMAL(18,2) NOT NULL COMMENT \'交易金额\',\n  txn_channel VARCHAR(16) COMMENT \'交易渠道\',\n  txn_dt DATE NOT NULL COMMENT \'交易日期\'\n) COMMENT \'银行交易事实表\';';
        base.columns = [
          { name: 'txn_id', type: 'VARCHAR(64)', description: '交易主键', standardRef: 'TRAN-001' },
          { name: 'customer_unified_id', type: 'VARCHAR(32)', description: '客户统一编号', standardRef: 'CUST-001' },
          { name: 'transaction_amount', type: 'DECIMAL(18,2)', description: '交易金额', standardRef: 'TRAN-015' },
          { name: 'txn_channel', type: 'VARCHAR(16)', description: '渠道编码', standardRef: 'TRAN-022' },
          { name: 'txn_dt', type: 'DATE', description: '交易日期', standardRef: 'PUB-001' }
        ];
        base.transformations = [
          { sourceTable: 'ods.txn_detail', rule: '转换出入账方向并统一金额币种', targetField: 'transaction_amount' },
          { sourceTable: 'ods.channel_txn', rule: '渠道字典映射', targetField: 'txn_channel' }
        ];
        base.businessRules = ['冲正交易需与原交易关联。', '跨币种交易按日汇率折算人民币。'];
      } else if (template === '汇总表') {
        base.ddl = 'CREATE TABLE ads.ads_branch_customer_summary (\n  branch_code VARCHAR(12) NOT NULL COMMENT \'机构号\',\n  stat_dt DATE NOT NULL COMMENT \'统计日期\',\n  retail_customer_cnt BIGINT COMMENT \'零售客户数\',\n  aum_balance DECIMAL(18,2) COMMENT \'AUM 余额\'\n) COMMENT \'机构客户汇总表\';';
        base.columns = [
          { name: 'branch_code', type: 'VARCHAR(12)', description: '机构号', standardRef: 'ORG-002' },
          { name: 'stat_dt', type: 'DATE', description: '统计日期', standardRef: 'PUB-001' },
          { name: 'retail_customer_cnt', type: 'BIGINT', description: '客户数', standardRef: 'CUST-STAT-001' },
          { name: 'aum_balance', type: 'DECIMAL(18,2)', description: 'AUM 余额', standardRef: 'FIN-009' }
        ];
        base.transformations = [{ sourceTable: 'dwd.dim_bank_customer_profile', rule: '按机构与日期聚合客户数及 AUM', targetField: 'retail_customer_cnt / aum_balance' }];
        base.businessRules = ['客户统计以 T+1 日终口径为准。', 'AUM 余额取各账户日终余额汇总。'];
      } else if (template === '快照表') {
        base.ddl = 'CREATE TABLE dws.dws_account_snapshot (\n  core_account_no VARCHAR(24) NOT NULL COMMENT \'核心账号\',\n  snapshot_dt DATE NOT NULL COMMENT \'快照日期\',\n  balance DECIMAL(18,2) COMMENT \'日终余额\',\n  account_status VARCHAR(12) COMMENT \'账户状态\'\n) COMMENT \'账户日终快照表\';';
        base.columns = [
          { name: 'core_account_no', type: 'VARCHAR(24)', description: '核心账号', standardRef: 'ACCT-008' },
          { name: 'snapshot_dt', type: 'DATE', description: '快照日期', standardRef: 'PUB-001' },
          { name: 'balance', type: 'DECIMAL(18,2)', description: '日终余额', standardRef: 'FIN-002' },
          { name: 'account_status', type: 'VARCHAR(12)', description: '账户状态', standardRef: 'ACCT-011' }
        ];
        base.transformations = [{ sourceTable: 'core.account_balance', rule: '取日终最后一笔余额状态写入快照', targetField: 'balance / account_status' }];
        base.businessRules = ['快照表按自然日保留全量历史。'];
      } else {
        base.ddl = 'CREATE TABLE tmp.tmp_risk_feature_prepare (\n  customer_unified_id VARCHAR(32),\n  feature_code VARCHAR(32),\n  feature_value VARCHAR(128),\n  batch_no VARCHAR(32)\n) COMMENT \'风险特征临时加工表\';';
        base.columns = [
          { name: 'customer_unified_id', type: 'VARCHAR(32)', description: '客户统一编号', standardRef: 'CUST-001' },
          { name: 'feature_code', type: 'VARCHAR(32)', description: '特征编码', standardRef: 'RISK-020' },
          { name: 'feature_value', type: 'VARCHAR(128)', description: '特征值', standardRef: 'RISK-021' },
          { name: 'batch_no', type: 'VARCHAR(32)', description: '批次号', standardRef: 'PUB-007' }
        ];
        base.transformations = [{ sourceTable: 'dwd.fact_bank_transaction', rule: '提取风控特征并写入临时宽表', targetField: 'feature_value' }];
        base.businessRules = ['临时加工表仅保留 7 天。', '批次号需与调度实例一一对应。'];
      }
      base.qualityRules = [
        { code: 'QR-AUTO-001', description: '主键字段不能为空', level: '阻断', threshold: '空值率 = 0' },
        { code: 'QR-AUTO-002', description: '关键维度需存在标准映射', level: '预警', threshold: '异常率 < 1%' }
      ];
      return base;
    },
    generateFromTemplate: function () {
      if (!this.newSpec.title) {
        window.alert('请先输入规范标题');
        return;
      }
      this.newSpecPreview = this.templatePayload(this.newSpec.template, this.newSpec.title, this.newSpec.requirementId, this.newSpec.description);
    },
    saveNewSpec: function () {
      if (!this.newSpecPreview) {
        this.generateFromTemplate();
      }
      if (!this.newSpecPreview) {
        return;
      }
      this.specs.unshift(this.newSpecPreview);
      this.selectedSpecId = this.newSpecPreview.id;
      this.detailTab = 'basic';
      this.showNewSpecModal = false;
    },
    submitReview: function () {
      if (!this.selectedSpec) {
        return;
      }
      this.selectedSpec.status = '待复核';
      this.selectedSpec.updatedAt = new Date().toISOString().slice(0, 10);
      this.selectedSpec.reviews.unshift({ reviewer: '系统提示', date: this.selectedSpec.updatedAt, comment: '规范已提交复核，请数据架构组处理。' });
    },
    exportSpec: function () {
      if (!this.selectedSpec) {
        return;
      }
      var spec = this.selectedSpec;
      var html = '<html><head><meta charset="utf-8"><title>' + spec.title + '</title></head><body>' +
        '<h1>' + spec.title + '</h1>' +
        '<p>版本：' + spec.version + '｜状态：' + spec.status + '</p>' +
        '<h2>DDL</h2><pre>' + spec.ddl.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>' +
        '<h2>业务描述</h2><p>' + spec.basicInfo.businessDescription + '</p>' +
        '</body></html>';
      var w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    }
  }
};
