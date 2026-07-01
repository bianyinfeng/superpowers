window.ScriptsView = {
  template: `
    <div class="scripts-view script-shell">
      <style>
        .script-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
        .layout { display: grid; grid-template-columns: 35% 65%; gap: 16px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); }
        .panel { padding: 16px; }
        .page-title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
        .subtle { color: #6b7280; font-size: 13px; }
        .toolbar, .meta-grid, .form-grid { display: grid; gap: 12px; }
        .toolbar { grid-template-columns: 1fr 1fr; margin-bottom: 14px; }
        .meta-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .input, .select, textarea { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; }
        textarea { min-height: 140px; resize: vertical; }
        .list-item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 10px; cursor: pointer; }
        .list-item.active { background: #eff6ff; border-color: #1d4ed8; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-green { background: #dcfce7; color: #15803d; }
        .badge-orange { background: #ffedd5; color: #c2410c; }
        .badge-red { background: #fee2e2; color: #b91c1c; }
        .badge-purple { background: #ede9fe; color: #6d28d9; }
        .badge-gray { background: #f3f4f6; color: #4b5563; }
        .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #1d4ed8; color: #fff; }
        .btn-secondary { background: #eff6ff; color: #1d4ed8; }
        .btn-muted { background: #f3f4f6; color: #374151; }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .tab-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
        .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
        .tab-btn.active { background: #1d4ed8; border-color: #1d4ed8; color: #fff; }
        .detail-block { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .section-title { margin: 0 0 10px; font-size: 18px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
        th { background: #f9fafb; font-weight: 700; }
        .code-view { background: #0f172a; color: #e2e8f0; border-radius: 12px; padding: 12px 0; overflow: auto; font-family: Consolas, monospace; }
        .code-line { display: grid; grid-template-columns: 56px 1fr; gap: 0; }
        .line-no { color: #64748b; text-align: right; padding: 0 12px 0 0; user-select: none; border-right: 1px solid rgba(148, 163, 184, 0.25); }
        .line-code { padding: 0 16px; white-space: pre; }
        .kw { color: #93c5fd; font-weight: 700; }
        .str { color: #86efac; }
        .com { color: #94a3b8; font-style: italic; }
        .num { color: #fca5a5; }
        .banner { border-radius: 12px; padding: 12px 14px; font-weight: 700; margin-bottom: 12px; }
        .banner-success { background: #dcfce7; color: #166534; }
        .banner-warning { background: #fef3c7; color: #92400e; }
        .banner-error { background: #fee2e2; color: #991b1b; }
        .progress { height: 10px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #0ea5e9); }
        .timeline { position: relative; margin-left: 8px; }
        .timeline:before { content: ''; position: absolute; left: 7px; top: 4px; bottom: 4px; width: 2px; background: #dbeafe; }
        .timeline-item { position: relative; padding-left: 28px; margin-bottom: 16px; }
        .timeline-item:before { content: ''; position: absolute; left: 0; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 3px solid #dbeafe; }
        .diff-view { background: #0f172a; color: #e2e8f0; border-radius: 12px; padding: 16px; font-family: Consolas, monospace; white-space: pre-wrap; }
        .diff-add { background: rgba(34, 197, 94, 0.2); display: block; }
        .diff-del { background: rgba(239, 68, 68, 0.18); display: block; }
        .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
        .modal-card { background: #fff; border-radius: 16px; width: min(980px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
        .empty-state { min-height: 520px; display: flex; align-items: center; justify-content: center; color: #6b7280; text-align: center; }
        @media (max-width: 1100px) { .layout, .toolbar, .meta-grid, .form-grid { grid-template-columns: 1fr; } }
      </style>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px;">
        <div>
          <h1 class="page-title">脚本复核及解析管理</h1>
          <div class="subtle">统一管理 SQL / Python / Shell 脚本的提交、解析、复核和版本对比过程。</div>
        </div>
      </div>

      <div class="layout">
        <div class="card panel">
          <div class="actions" style="margin-bottom:14px;">
            <button class="btn btn-primary" @click="openSubmitModal">提交新脚本</button>
          </div>
          <div class="toolbar">
            <select class="select" v-model="typeFilter">
              <option value="">全部类型</option>
              <option value="SQL">SQL</option>
              <option value="Python">Python</option>
              <option value="Shell">Shell</option>
            </select>
            <select class="select" v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="待解析">待解析</option>
              <option value="待复核">待复核</option>
              <option value="已复核">已复核</option>
            </select>
          </div>

          <div v-for="script in filteredScripts" :key="script.id" class="list-item" :class="{ active: script.id === selectedScriptId }" @click="selectedScriptId = script.id">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
              <strong>{{ script.name }}</strong>
              <span class="badge" :class="typeClass(script.type)">{{ script.type }}</span>
            </div>
            <div class="actions" style="justify-content:space-between; margin-top:8px;">
              <span class="badge badge-blue">{{ script.version }}</span>
              <span class="badge" :class="statusClass(script.status)">{{ script.status }}</span>
            </div>
            <div class="subtle" style="margin-top:8px;">{{ script.author }}｜{{ script.submitDate }}</div>
          </div>
        </div>

        <div class="card panel" v-if="selectedScript">
          <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap;">
            <div>
              <h2 class="section-title" style="font-size:24px; margin-bottom:8px;">{{ selectedScript.name }}</h2>
              <div class="actions">
                <span class="badge" :class="typeClass(selectedScript.type)">{{ selectedScript.type }}</span>
                <span class="badge badge-blue">{{ selectedScript.version }}</span>
                <span class="badge" :class="statusClass(selectedScript.status)">{{ selectedScript.status }}</span>
                <span class="subtle">规范引用：{{ selectedScript.specRef }}</span>
                <span class="subtle">提交日期：{{ selectedScript.submitDate }}</span>
              </div>
            </div>
          </div>

          <div class="tab-row">
            <button class="tab-btn" :class="{ active: activeTab === 'content' }" @click="activeTab = 'content'">脚本内容</button>
            <button class="tab-btn" :class="{ active: activeTab === 'parse' }" @click="activeTab = 'parse'">解析结果</button>
            <button class="tab-btn" :class="{ active: activeTab === 'review' }" @click="activeTab = 'review'">复核清单</button>
            <button class="tab-btn" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">版本历史</button>
          </div>

          <div v-if="activeTab === 'content'">
            <div class="detail-block meta-grid">
              <div><strong>脚本名称：</strong>{{ selectedScript.name }}</div>
              <div><strong>脚本类型：</strong>{{ selectedScript.type }}</div>
              <div><strong>版本号：</strong>{{ selectedScript.version }}</div>
              <div><strong>规范引用：</strong>{{ selectedScript.specRef }}</div>
            </div>
            <div class="code-view" v-html="highlightCode(selectedScript.code, selectedScript.type)"></div>
          </div>

          <div v-if="activeTab === 'parse'">
            <div class="banner" :class="parseBannerClass(selectedScript.parse.status)">{{ selectedScript.parse.status }}：{{ selectedScript.parse.summary }}</div>
            <div class="detail-block">
              <strong>源表清单</strong>
              <table>
                <thead>
                  <tr>
                    <th>表名</th>
                    <th>数据库</th>
                    <th>操作</th>
                    <th>预估数据量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedScript.parse.sourceTables" :key="item.tableName + item.operation">
                    <td>{{ item.tableName }}</td>
                    <td>{{ item.database }}</td>
                    <td>{{ item.operation }}</td>
                    <td>{{ item.rowEstimate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-block">
              <strong>字段血缘</strong>
              <table>
                <thead>
                  <tr>
                    <th>源字段</th>
                    <th>转换逻辑</th>
                    <th>目标字段</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedScript.parse.lineage" :key="item.source + item.target">
                    <td>{{ item.source }}</td>
                    <td>{{ item.transform }}</td>
                    <td>{{ item.target }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="detail-block meta-grid">
              <div><strong>表数量：</strong>{{ selectedScript.parse.metrics.tableCount }}</div>
              <div><strong>Join 数：</strong>{{ selectedScript.parse.metrics.joinCount }}</div>
              <div><strong>子查询深度：</strong>{{ selectedScript.parse.metrics.subqueryDepth }}</div>
              <div><strong>执行计划提示：</strong>{{ selectedScript.parse.metrics.planNotes }}</div>
            </div>
            <div class="detail-block">
              <strong>潜在问题</strong>
              <ul style="margin:10px 0 0; padding-left:18px; line-height:1.8;">
                <li v-for="issue in selectedScript.parse.issues" :key="issue">{{ issue }}</li>
              </ul>
            </div>
          </div>

          <div v-if="activeTab === 'review'">
            <div class="detail-block">
              <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:10px; flex-wrap:wrap;">
                <strong>复核进度</strong>
                <span>{{ reviewCompleted }}/{{ selectedScript.reviewChecklist.length }}（{{ reviewPercent }}%）</span>
              </div>
              <div class="progress"><div class="progress-bar" :style="{ width: reviewPercent + '%' }"></div></div>
            </div>
            <div class="detail-block" v-for="item in selectedScript.reviewChecklist" :key="item.code">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="checkbox" v-model="item.checked" />
                <strong>{{ item.title }}</strong>
              </div>
              <div class="subtle" style="margin-bottom:8px;">{{ item.description }}</div>
              <input class="input" v-model="item.note" placeholder="填写复核备注" />
            </div>
            <div class="actions" style="justify-content:flex-end;">
              <button class="btn btn-primary" @click="submitReviewOpinion">提交复核意见</button>
            </div>
          </div>

          <div v-if="activeTab === 'history'" class="timeline">
            <div class="timeline-item" v-for="(item, index) in selectedScript.versions" :key="item.version">
              <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center;">
                <div>
                  <strong>{{ item.version }}</strong>
                  <div class="subtle">{{ item.author }}｜{{ item.date }}</div>
                </div>
                <button class="btn btn-secondary" v-if="index > 0" @click="showDiff(selectedScript.versions[index - 1], item)">Diff</button>
              </div>
              <div style="margin-top:8px; line-height:1.8;">{{ item.summary }}</div>
            </div>
          </div>
        </div>

        <div class="card panel empty-state" v-else>
          <div>请选择脚本查看解析、复核及版本信息。</div>
        </div>
      </div>

      <div class="modal-mask" v-if="showSubmitScriptModal">
        <div class="modal-card">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
            <div>
              <h2 class="section-title">提交新脚本</h2>
              <div class="subtle">提交开发脚本并绑定对应规范，进入自动解析和复核流程。</div>
            </div>
            <button class="btn btn-muted" @click="showSubmitScriptModal = false">关闭</button>
          </div>

          <div class="form-grid">
            <div>
              <label class="subtle">脚本名称</label>
              <input class="input" v-model="newScript.name" />
            </div>
            <div>
              <label class="subtle">脚本类型</label>
              <select class="select" v-model="newScript.type">
                <option>SQL</option>
                <option>Python</option>
                <option>Shell</option>
              </select>
            </div>
            <div>
              <label class="subtle">关联规范</label>
              <select class="select" v-model="newScript.specRef">
                <option v-for="item in specOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="subtle">描述</label>
              <input class="input" v-model="newScript.description" />
            </div>
            <div style="grid-column:1 / -1;">
              <label class="subtle">脚本代码</label>
              <textarea v-model="newScript.code" placeholder="粘贴 SQL / Python / Shell 脚本"></textarea>
            </div>
            <div>
              <label style="display:flex; align-items:center; gap:8px; margin-top:20px;"><input type="checkbox" v-model="newScript.attachTestData" /> 附带测试数据样例</label>
            </div>
          </div>

          <div class="actions" style="justify-content:flex-end; margin-top:16px;">
            <button class="btn btn-secondary" @click="fillCodeTemplate">填充示例代码</button>
            <button class="btn btn-primary" @click="saveNewScript">提交脚本</button>
          </div>
        </div>
      </div>

      <div class="modal-mask" v-if="showDiffModal">
        <div class="modal-card">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:14px;">
            <div>
              <h2 class="section-title">版本差异对比</h2>
              <div class="subtle">{{ diffTitle }}</div>
            </div>
            <button class="btn btn-muted" @click="showDiffModal = false">关闭</button>
          </div>
          <div class="diff-view" v-html="diffHtml"></div>
        </div>
      </div>
    </div>
  `,
  data: function () {
    var mock = window.MockData || {};
    var clone = function (value, fallback) {
      return JSON.parse(JSON.stringify(value || fallback));
    };
    var defaultChecklist = function () {
      return [
        { code: 'naming', title: '命名规范检查', description: 'table / column naming follows bank standards', checked: false, note: '' },
        { code: 'auth', title: '数据权限检查', description: 'accessing authorized data sources only', checked: false, note: '' },
        { code: 'performance', title: '性能评估', description: 'estimated run time and resource usage', checked: false, note: '' },
        { code: 'exception', title: '异常处理', description: 'error handling present', checked: false, note: '' },
        { code: 'quality', title: '数据质量埋点', description: 'quality checkpoints embedded', checked: false, note: '' },
        { code: 'comment', title: '注释完整性', description: 'all major logic blocks commented', checked: false, note: '' },
        { code: 'logging', title: '日志记录', description: 'logging statements present', checked: false, note: '' },
        { code: 'idempotent', title: '幂等性验证', description: 'script is idempotent', checked: false, note: '' }
      ];
    };
    var scripts = clone(mock.scripts, [
      {
        id: 'script-001', name: 'retail_customer_dim_load.sql', type: 'SQL', version: 'v1.4', status: '待复核', author: '张敏', submitDate: '2025-03-30', specRef: 'SPEC-2025-001',
        code: '-- 零售客户维度装载\nINSERT OVERWRITE TABLE dwd.dim_retail_customer PARTITION (data_dt = ${bizdate})\nSELECT\n  c.customer_unified_id,\n  c.customer_name,\n  i.cert_no,\n  COALESCE(t.customer_segment, \'普通\') AS customer_segment,\n  ${bizdate} AS data_dt\nFROM dws.customer_master c\nLEFT JOIN dws.customer_identity i ON c.customer_unified_id = i.customer_unified_id\nLEFT JOIN dim.customer_tag_map t ON c.tag_code = t.tag_code\nWHERE c.data_dt = ${bizdate};',
        parse: {
          status: '成功', summary: '识别出 3 张源表、1 张目标表，血缘链路完整。',
          sourceTables: [
            { tableName: 'dws.customer_master', database: 'bank_dws', operation: 'READ', rowEstimate: '1,240 万' },
            { tableName: 'dws.customer_identity', database: 'bank_dws', operation: 'READ', rowEstimate: '1,100 万' },
            { tableName: 'dim.customer_tag_map', database: 'bank_dim', operation: 'READ', rowEstimate: '120' },
            { tableName: 'dwd.dim_retail_customer', database: 'bank_dwd', operation: 'WRITE', rowEstimate: '1,240 万' }
          ],
          lineage: [
            { source: 'c.customer_unified_id', transform: '直接映射', target: 'customer_unified_id' },
            { source: 'i.cert_no', transform: '左关联补充实名信息', target: 'cert_no' },
            { source: 't.customer_segment', transform: 'COALESCE 缺省为普通', target: 'customer_segment' }
          ],
          metrics: { tableCount: 4, joinCount: 2, subqueryDepth: 0, planNotes: '建议对 customer_identity 使用分区过滤。' },
          issues: ['customer_identity 未显式声明分区过滤条件。', '目标表覆盖写入前建议增加批次幂等校验。']
        },
        reviewChecklist: defaultChecklist(),
        versions: [
          { version: 'v1.4', author: '张敏', date: '2025-03-30', summary: '增加客户标签默认值处理。', code: '-- 零售客户维度装载\nINSERT OVERWRITE TABLE dwd.dim_retail_customer PARTITION (data_dt = ${bizdate})\nSELECT\n  c.customer_unified_id,\n  c.customer_name,\n  i.cert_no,\n  COALESCE(t.customer_segment, \'普通\') AS customer_segment,\n  ${bizdate} AS data_dt\nFROM dws.customer_master c\nLEFT JOIN dws.customer_identity i ON c.customer_unified_id = i.customer_unified_id\nLEFT JOIN dim.customer_tag_map t ON c.tag_code = t.tag_code\nWHERE c.data_dt = ${bizdate};' },
          { version: 'v1.3', author: '张敏', date: '2025-03-27', summary: '补充实名信息关联。', code: '-- 零售客户维度装载\nINSERT OVERWRITE TABLE dwd.dim_retail_customer PARTITION (data_dt = ${bizdate})\nSELECT\n  c.customer_unified_id,\n  c.customer_name,\n  i.cert_no,\n  ${bizdate} AS data_dt\nFROM dws.customer_master c\nLEFT JOIN dws.customer_identity i ON c.customer_unified_id = i.customer_unified_id\nWHERE c.data_dt = ${bizdate};' }
        ]
      },
      {
        id: 'script-002', name: 'corp_trade_quality_check.py', type: 'Python', version: 'v1.1', status: '待解析', author: '陈超', submitDate: '2025-03-28', specRef: 'SPEC-2025-014',
        code: '# 对公交易质量校验\nimport pandas as pd\n\ndef validate_trade(df):\n    duplicated = df[df.duplicated(["txn_id"])]\n    if not duplicated.empty:\n        print("duplicate txn found")\n    df["amount_flag"] = df["transaction_amount"].apply(lambda x: "NEG" if x < 0 else "POS")\n    return df\n\nif __name__ == "__main__":\n    data = pd.read_csv("corp_trade_sample.csv")\n    validate_trade(data)',
        parse: {
          status: '警告', summary: 'Python AST 解析成功，但缺少异常处理与日志上下文。',
          sourceTables: [
            { tableName: 'corp_trade_sample.csv', database: 'local_file', operation: 'READ', rowEstimate: '5 万' }
          ],
          lineage: [
            { source: 'transaction_amount', transform: 'lambda 判断正负', target: 'amount_flag' }
          ],
          metrics: { tableCount: 1, joinCount: 0, subqueryDepth: 0, planNotes: '建议补充 DataFrame 字段合法性校验。' },
          issues: ['脚本缺少 try/except 异常处理。', '仅使用 print，建议改为统一日志组件。']
        },
        reviewChecklist: defaultChecklist(),
        versions: [
          { version: 'v1.1', author: '陈超', date: '2025-03-28', summary: '新增金额方向标识字段。', code: '# 对公交易质量校验\nimport pandas as pd\n\ndef validate_trade(df):\n    duplicated = df[df.duplicated(["txn_id"])]\n    if not duplicated.empty:\n        print("duplicate txn found")\n    df["amount_flag"] = df["transaction_amount"].apply(lambda x: "NEG" if x < 0 else "POS")\n    return df\n' },
          { version: 'v1.0', author: '陈超', date: '2025-03-25', summary: '初始化交易质量校验脚本。', code: '# 对公交易质量校验\nimport pandas as pd\n\ndef validate_trade(df):\n    duplicated = df[df.duplicated(["txn_id"])]\n    return df\n' }
        ]
      },
      {
        id: 'script-003', name: 'risk_feature_prepare.sh', type: 'Shell', version: 'v2.0', status: '已复核', author: '王磊', submitDate: '2025-03-18', specRef: 'SPEC-2025-027',
        code: '#!/bin/bash\nset -e\nBIZDATE=$1\necho "start prepare ${BIZDATE}"\nhive -e "INSERT OVERWRITE TABLE tmp.tmp_risk_feature_prepare SELECT customer_unified_id, feature_code, feature_value, ${BIZDATE} FROM dwd.fact_bank_transaction WHERE data_dt=${BIZDATE};"\necho "finish prepare ${BIZDATE}"',
        parse: {
          status: '成功', summary: 'Shell 控制作业入口清晰，依赖单一 Hive SQL 执行。',
          sourceTables: [
            { tableName: 'dwd.fact_bank_transaction', database: 'bank_dwd', operation: 'READ', rowEstimate: '8,000 万' },
            { tableName: 'tmp.tmp_risk_feature_prepare', database: 'bank_tmp', operation: 'WRITE', rowEstimate: '2,000 万' }
          ],
          lineage: [
            { source: 'customer_unified_id / feature_code / feature_value', transform: '直接透传到临时表', target: 'tmp columns' }
          ],
          metrics: { tableCount: 2, joinCount: 0, subqueryDepth: 0, planNotes: '建议在 shell 中增加参数校验。' },
          issues: ['未对空参执行场景进行防御。']
        },
        reviewChecklist: defaultChecklist().map(function (item) { item.checked = true; item.note = '已通过'; return item; }),
        versions: [
          { version: 'v2.0', author: '王磊', date: '2025-03-18', summary: '优化日志输出并调整目标临时表。', code: '#!/bin/bash\nset -e\nBIZDATE=$1\necho "start prepare ${BIZDATE}"\nhive -e "INSERT OVERWRITE TABLE tmp.tmp_risk_feature_prepare SELECT customer_unified_id, feature_code, feature_value, ${BIZDATE} FROM dwd.fact_bank_transaction WHERE data_dt=${BIZDATE};"\necho "finish prepare ${BIZDATE}"' },
          { version: 'v1.7', author: '王磊', date: '2025-03-10', summary: '初版风险特征提取脚本。', code: '#!/bin/bash\nset -e\nBIZDATE=$1\nhive -e "INSERT OVERWRITE TABLE tmp.tmp_feature_prepare SELECT * FROM dwd.fact_bank_transaction WHERE data_dt=${BIZDATE};"' }
        ]
      }
    ]);
    return {
      scripts: scripts,
      specOptions: ['SPEC-2025-001', 'SPEC-2025-014', 'SPEC-2025-027'],
      typeFilter: '',
      statusFilter: '',
      selectedScriptId: scripts[0] ? scripts[0].id : '',
      activeTab: 'content',
      showSubmitScriptModal: false,
      newScript: {
        name: '',
        type: 'SQL',
        specRef: 'SPEC-2025-001',
        description: '',
        code: '',
        attachTestData: false
      },
      showDiffModal: false,
      diffHtml: '',
      diffTitle: ''
    };
  },
  computed: {
    filteredScripts: function () {
      var type = this.typeFilter;
      var status = this.statusFilter;
      return this.scripts.filter(function (item) {
        var hitType = !type || item.type === type;
        var hitStatus = !status || item.status === status;
        return hitType && hitStatus;
      });
    },
    selectedScript: function () {
      for (var i = 0; i < this.scripts.length; i += 1) {
        if (this.scripts[i].id === this.selectedScriptId) {
          return this.scripts[i];
        }
      }
      return null;
    },
    reviewCompleted: function () {
      if (!this.selectedScript) {
        return 0;
      }
      return this.selectedScript.reviewChecklist.filter(function (item) { return item.checked; }).length;
    },
    reviewPercent: function () {
      if (!this.selectedScript || !this.selectedScript.reviewChecklist.length) {
        return 0;
      }
      return Math.round((this.reviewCompleted / this.selectedScript.reviewChecklist.length) * 100);
    }
  },
  methods: {
    typeClass: function (type) {
      return {
        'badge-blue': type === 'SQL',
        'badge-green': type === 'Python',
        'badge-purple': type === 'Shell'
      };
    },
    statusClass: function (status) {
      return {
        'badge-orange': status === '待解析',
        'badge-blue': status === '待复核',
        'badge-green': status === '已复核'
      };
    },
    parseBannerClass: function (status) {
      return {
        'banner-success': status === '成功',
        'banner-warning': status === '警告',
        'banner-error': status === '错误'
      };
    },
    escapeHtml: function (text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },
    highlightCode: function (code, type) {
      var keywords = type === 'Python'
        ? ['import', 'def', 'return', 'if', 'not', 'in', '__main__', 'lambda', 'print']
        : type === 'Shell'
          ? ['set', 'echo', 'if', 'then', 'fi', 'for', 'do', 'done', 'hive']
          : ['SELECT', 'FROM', 'LEFT', 'JOIN', 'WHERE', 'INSERT', 'OVERWRITE', 'TABLE', 'AS', 'ON', 'PARTITION', 'COALESCE'];
      var lines = String(code || '').split('\n');
      var html = '';
      for (var i = 0; i < lines.length; i += 1) {
        var rendered = this.escapeHtml(lines[i]);
        rendered = rendered.replace(/(--.*$|#.*$)/g, '<span class="com">$1</span>');
        rendered = rendered.replace(/("[^"]*"|'[^']*')/g, '<span class="str">$1</span>');
        rendered = rendered.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
        for (var j = 0; j < keywords.length; j += 1) {
          var word = keywords[j].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          rendered = rendered.replace(new RegExp('\\b' + word + '\\b', 'g'), '<span class="kw">' + keywords[j] + '</span>');
        }
        html += '<div class="code-line"><span class="line-no">' + (i + 1) + '</span><span class="line-code">' + rendered + '</span></div>';
      }
      return html;
    },
    openSubmitModal: function () {
      this.newScript = {
        name: '',
        type: 'SQL',
        specRef: this.specOptions[0],
        description: '',
        code: '',
        attachTestData: false
      };
      this.showSubmitScriptModal = true;
    },
    fillCodeTemplate: function () {
      if (this.newScript.type === 'Python') {
        this.newScript.code = 'import logging\n\nlogger = logging.getLogger(__name__)\n\ndef main():\n    logger.info("start script")\n    return True\n\nif __name__ == "__main__":\n    main()';
      } else if (this.newScript.type === 'Shell') {
        this.newScript.code = '#!/bin/bash\nset -e\nBIZDATE=$1\necho "run ${BIZDATE}"\n';
      } else {
        this.newScript.code = 'INSERT OVERWRITE TABLE dwd.sample_table\nSELECT *\nFROM ods.sample_source\nWHERE data_dt = ${bizdate};';
      }
    },
    saveNewScript: function () {
      if (!this.newScript.name || !this.newScript.code) {
        window.alert('请填写脚本名称和代码');
        return;
      }
      var today = new Date().toISOString().slice(0, 10);
      var script = {
        id: 'script-' + Date.now(),
        name: this.newScript.name,
        type: this.newScript.type,
        version: 'v1.0',
        status: '待解析',
        author: '当前用户',
        submitDate: today,
        specRef: this.newScript.specRef,
        code: this.newScript.code,
        description: this.newScript.description,
        parse: {
          status: '警告',
          summary: this.newScript.attachTestData ? '已附测试数据，待解析引擎进一步校验。' : '已入库，等待自动解析。',
          sourceTables: [],
          lineage: [],
          metrics: { tableCount: 0, joinCount: 0, subqueryDepth: 0, planNotes: '待解析完成后生成。' },
          issues: ['新提交脚本尚未完成静态解析。']
        },
        reviewChecklist: [
          { code: 'naming', title: '命名规范检查', description: 'table / column naming follows bank standards', checked: false, note: '' },
          { code: 'auth', title: '数据权限检查', description: 'accessing authorized data sources only', checked: false, note: '' },
          { code: 'performance', title: '性能评估', description: 'estimated run time and resource usage', checked: false, note: '' },
          { code: 'exception', title: '异常处理', description: 'error handling present', checked: false, note: '' },
          { code: 'quality', title: '数据质量埋点', description: 'quality checkpoints embedded', checked: false, note: '' },
          { code: 'comment', title: '注释完整性', description: 'all major logic blocks commented', checked: false, note: '' },
          { code: 'logging', title: '日志记录', description: 'logging statements present', checked: false, note: '' },
          { code: 'idempotent', title: '幂等性验证', description: 'script is idempotent', checked: false, note: '' }
        ],
        versions: [{ version: 'v1.0', author: '当前用户', date: today, summary: '新脚本提交。', code: this.newScript.code }]
      };
      this.scripts.unshift(script);
      this.selectedScriptId = script.id;
      this.activeTab = 'content';
      this.showSubmitScriptModal = false;
    },
    submitReviewOpinion: function () {
      if (!this.selectedScript) {
        return;
      }
      this.selectedScript.status = '已复核';
      this.selectedScript.versions.unshift({
        version: this.bumpVersion(this.selectedScript.version),
        author: '复核人',
        date: new Date().toISOString().slice(0, 10),
        summary: '提交复核意见并完成复核归档。',
        code: this.selectedScript.code
      });
      this.selectedScript.version = this.selectedScript.versions[0].version;
      window.alert('复核意见已提交');
    },
    bumpVersion: function (version) {
      var num = Number(String(version || 'v1.0').replace('v', ''));
      return 'v' + (num + 0.1).toFixed(1);
    },
    showDiff: function (current, previous) {
      this.diffTitle = previous.version + ' → ' + current.version;
      this.diffHtml = this.buildDiff(previous.code, current.code);
      this.showDiffModal = true;
    },
    buildDiff: function (oldCode, newCode) {
      var oldLines = String(oldCode || '').split('\n');
      var newLines = String(newCode || '').split('\n');
      var html = '';
      var max = Math.max(oldLines.length, newLines.length);
      for (var i = 0; i < max; i += 1) {
        var oldLine = oldLines[i];
        var newLine = newLines[i];
        if (oldLine === newLine) {
          if (typeof newLine !== 'undefined') {
            html += '<span>' + this.escapeHtml('  ' + newLine) + '</span>';
          }
        } else {
          if (typeof oldLine !== 'undefined') {
            html += '<span class="diff-del">- ' + this.escapeHtml(oldLine) + '</span>';
          }
          if (typeof newLine !== 'undefined') {
            html += '<span class="diff-add">+ ' + this.escapeHtml(newLine) + '</span>';
          }
        }
      }
      return html;
    }
  }
};
