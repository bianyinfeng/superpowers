window.StandardsView = {
  template: `
    <div class="standards-view page-shell">
      <style>
        .page-shell { font-family: "Microsoft YaHei", Arial, sans-serif; color: #1f2937; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04); }
        .toolbar, .summary-grid, .two-col, .rule-grid, .drawer-grid, .field-grid { display: grid; gap: 12px; }
        .toolbar { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: end; }
        .summary-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .two-col { grid-template-columns: 1.5fr 1fr; align-items: start; }
        .rule-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .drawer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .field-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .page-title { font-size: 28px; font-weight: 700; margin: 0 0 16px; }
        .section-title { font-size: 18px; font-weight: 700; margin: 0; }
        .subtle { color: #6b7280; font-size: 13px; }
        .tab-row { display: flex; gap: 8px; margin-bottom: 18px; }
        .tab-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 8px 16px; cursor: pointer; }
        .tab-btn.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
        .panel { padding: 16px; margin-bottom: 16px; }
        .summary-card { padding: 16px; border-radius: 12px; background: linear-gradient(135deg, #eff6ff, #ffffff); border: 1px solid #dbeafe; }
        .summary-label { color: #6b7280; font-size: 12px; }
        .summary-value { font-size: 24px; font-weight: 700; margin-top: 6px; }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .btn { border: none; border-radius: 8px; padding: 9px 14px; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #1d4ed8; color: #fff; }
        .btn-secondary { background: #eff6ff; color: #1d4ed8; }
        .btn-muted { background: #f3f4f6; color: #374151; }
        .btn-danger { background: #fee2e2; color: #b91c1c; }
        .btn-link { background: transparent; color: #1d4ed8; padding: 0; }
        .table-wrap { overflow: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; font-size: 13px; }
        th { background: #f9fafb; color: #374151; font-weight: 700; position: sticky; top: 0; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .badge-green { background: #dcfce7; color: #15803d; }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-orange { background: #ffedd5; color: #c2410c; }
        .badge-purple { background: #ede9fe; color: #6d28d9; }
        .badge-red { background: #fee2e2; color: #b91c1c; }
        .badge-gray { background: #f3f4f6; color: #4b5563; }
        .progress { height: 10px; background: #e5e7eb; border-radius: 999px; overflow: hidden; min-width: 120px; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #2563eb, #0ea5e9); }
        .progress-text { font-size: 12px; color: #374151; margin-top: 4px; }
        .filter-label, .form-label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; font-weight: 700; }
        .input, .select, textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; font-size: 13px; box-sizing: border-box; background: #fff; }
        textarea { min-height: 88px; resize: vertical; }
        .drawer { position: sticky; top: 16px; }
        .detail-block { padding: 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e7eb; margin-bottom: 12px; }
        .modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
        .modal-card { background: #fff; border-radius: 16px; width: min(900px, 100%); max-height: 92vh; overflow: auto; padding: 20px; }
        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .list-inline { display: flex; flex-wrap: wrap; gap: 8px; }
        .pill { background: #f3f4f6; padding: 5px 10px; border-radius: 999px; font-size: 12px; }
        .rule-item { padding: 16px; }
        .rule-item h4 { margin: 0 0 12px; font-size: 16px; }
        .synonym-row { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
        .empty { padding: 32px 16px; text-align: center; color: #6b7280; }
        @media (max-width: 1100px) { .two-col, .rule-grid, .summary-grid, .drawer-grid, .field-grid { grid-template-columns: 1fr; } }
      </style>

      <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:18px;">
        <div>
          <h1 class="page-title">数据标准匹配与管理</h1>
          <div class="subtle">围绕监管标准、银行主数据口径和字段级映射关系，统一管理匹配结果、标准库与自动匹配规则。</div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" @click="confirmHighConfidence">一键确认</button>
          <button class="btn btn-muted" @click="exportResults">导出结果</button>
        </div>
      </div>

      <div class="tab-row">
        <button class="tab-btn" :class="{ active: activeTab === 'results' }" @click="activeTab = 'results'">标准匹配结果</button>
        <button class="tab-btn" :class="{ active: activeTab === 'library' }" @click="activeTab = 'library'">标准库管理</button>
        <button class="tab-btn" :class="{ active: activeTab === 'rules' }" @click="activeTab = 'rules'">匹配规则配置</button>
      </div>

      <div v-if="activeTab === 'results'">
        <div class="card panel">
          <div style="display:flex; justify-content:space-between; gap:16px; align-items:end; flex-wrap:wrap;">
            <div>
              <h2 class="section-title">自动匹配结果</h2>
              <div class="subtle">根据需求选择查看字段标准自动匹配情况，并对结果进行确认或人工调整。</div>
            </div>
            <div style="min-width:280px;">
              <label class="filter-label">需求选择</label>
              <select class="select" v-model="selectedRequirementId">
                <option v-for="req in requirements" :key="req.id" :value="req.id">{{ req.id }}｜{{ req.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="summary-grid" style="margin-bottom:16px;">
          <div class="summary-card">
            <div class="summary-label">已匹配</div>
            <div class="summary-value">{{ summary.matched }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">待确认</div>
            <div class="summary-value">{{ summary.pending }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">需调整</div>
            <div class="summary-value">{{ summary.needAdjust }}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">匹配率</div>
            <div class="summary-value">{{ summary.matchRate }}%</div>
          </div>
        </div>

        <div class="card panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>源字段名</th>
                <th>源字段描述</th>
                <th>匹配标准代码</th>
                <th>匹配标准名称</th>
                <th>数据类型</th>
                <th>匹配方式</th>
                <th>置信度</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredResults" :key="row.id">
                <td><strong>{{ row.sourceField }}</strong></td>
                <td>{{ row.sourceDescription }}</td>
                <td>{{ row.standardCode || '未匹配' }}</td>
                <td>{{ row.standardName || '-' }}</td>
                <td>{{ row.dataType }}</td>
                <td><span class="badge" :class="matchTypeClass(row.matchType)">{{ row.matchType || '未识别' }}</span></td>
                <td>
                  <div class="progress"><div class="progress-bar" :style="{ width: row.confidence + '%' }"></div></div>
                  <div class="progress-text">{{ row.confidence }}%</div>
                </td>
                <td><span class="badge" :class="statusClass(row.status)">{{ row.status }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn btn-link" @click="confirmResult(row)">确认</button>
                    <button class="btn btn-link" @click="openAdjustModal(row)">调整</button>
                    <button class="btn btn-link" style="color:#b91c1c;" @click="ignoreResult(row)">忽略</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredResults.length">
                <td colspan="9" class="empty">当前筛选条件下暂无匹配结果</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'library'">
        <div class="card panel">
          <div class="toolbar">
            <div>
              <label class="filter-label">关键字搜索</label>
              <input class="input" v-model="libraryKeyword" placeholder="标准代码 / 中文名称 / 英文字段名" />
            </div>
            <div>
              <label class="filter-label">业务分类</label>
              <select class="select" v-model="libraryCategory">
                <option value="">全部分类</option>
                <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="filter-label">敏感级别</label>
              <select class="select" v-model="librarySensitivity">
                <option value="">全部级别</option>
                <option v-for="item in sensitivityLevels" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div class="actions" style="justify-content:flex-end;">
              <button class="btn btn-primary" @click="openAddStandardModal">新增标准</button>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="card panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>标准代码</th>
                  <th>中文名称</th>
                  <th>英文字段名</th>
                  <th>数据类型</th>
                  <th>长度</th>
                  <th>可空</th>
                  <th>敏感级别</th>
                  <th>业务分类</th>
                  <th>监管引用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="std in filteredStandards" :key="std.code">
                  <td><strong>{{ std.code }}</strong></td>
                  <td>{{ std.cnName }}</td>
                  <td>{{ std.enName }}</td>
                  <td>{{ std.dataType }}</td>
                  <td>{{ std.length }}</td>
                  <td>{{ std.nullable ? '是' : '否' }}</td>
                  <td><span class="badge" :class="sensitivityClass(std.sensitivity)">{{ std.sensitivity }}</span></td>
                  <td>{{ std.category }}</td>
                  <td>{{ std.regulatoryRef }}</td>
                  <td>
                    <div class="actions">
                      <button class="btn btn-link" @click="selectedStandard = std">查看</button>
                      <button class="btn btn-link" @click="editStandard(std)">编辑</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="card panel drawer" v-if="selectedStandard">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:12px;">
              <div>
                <h2 class="section-title">标准详情</h2>
                <div class="subtle">{{ selectedStandard.code }}｜{{ selectedStandard.cnName }}</div>
              </div>
              <span class="badge" :class="sensitivityClass(selectedStandard.sensitivity)">{{ selectedStandard.sensitivity }}</span>
            </div>

            <div class="detail-block drawer-grid">
              <div><strong>中文名称：</strong>{{ selectedStandard.cnName }}</div>
              <div><strong>英文字段名：</strong>{{ selectedStandard.enName }}</div>
              <div><strong>数据类型：</strong>{{ selectedStandard.dataType }}</div>
              <div><strong>字段长度：</strong>{{ selectedStandard.length }}</div>
              <div><strong>默认值：</strong>{{ selectedStandard.defaultValue || '-' }}</div>
              <div><strong>可空：</strong>{{ selectedStandard.nullable ? '是' : '否' }}</div>
              <div><strong>业务分类：</strong>{{ selectedStandard.category }}</div>
              <div><strong>监管引用：</strong>{{ selectedStandard.regulatoryRef }}</div>
            </div>

            <div class="detail-block">
              <strong>业务说明</strong>
              <p style="margin:8px 0 0; line-height:1.7;">{{ selectedStandard.description }}</p>
            </div>

            <div class="detail-block">
              <strong>使用示例</strong>
              <div class="list-inline" style="margin-top:8px;">
                <span class="pill" v-for="item in selectedStandard.examples" :key="item">{{ item }}</span>
              </div>
            </div>

            <div class="detail-block">
              <strong>监管合规引用</strong>
              <ul style="margin:8px 0 0; padding-left:18px; line-height:1.8;">
                <li v-for="item in selectedStandard.complianceRefs" :key="item">{{ item }}</li>
              </ul>
            </div>

            <div class="detail-block">
              <strong>版本历史</strong>
              <ul style="margin:8px 0 0; padding-left:18px; line-height:1.8;">
                <li v-for="item in selectedStandard.versionHistory" :key="item.version">{{ item.version }}｜{{ item.date }}｜{{ item.summary }}</li>
              </ul>
            </div>

            <div class="detail-block">
              <strong>使用统计</strong>
              <div style="margin-top:8px; line-height:1.8;">
                已在 <strong>{{ selectedStandard.usedTables }}</strong> 张表中使用，覆盖 <strong>{{ selectedStandard.usedProjects }}</strong> 个数据集成任务。
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'rules'">
        <div class="rule-grid">
          <div class="card panel rule-item">
            <h4>精确匹配</h4>
            <label style="display:block; margin-bottom:10px;"><input type="checkbox" v-model="ruleConfig.exact.fieldName" /> 字段名完全一致</label>
            <label style="display:block; margin-bottom:10px;"><input type="checkbox" v-model="ruleConfig.exact.dataType" /> 数据类型一致校验</label>
            <div class="subtle">优先用于核心主数据、监管报送字段及关键主键识别。</div>
          </div>

          <div class="card panel rule-item">
            <h4>模糊匹配</h4>
            <label class="form-label">Levenshtein 距离阈值：{{ ruleConfig.fuzzy.threshold }}</label>
            <input type="range" min="60" max="98" v-model.number="ruleConfig.fuzzy.threshold" style="width:100%;" />
            <div style="margin-top:12px;" class="subtle">同义词词库命中后提升相似度，适用于不同系统字段缩写、拼音与英文混用场景。</div>
          </div>

          <div class="card panel rule-item">
            <h4>语义匹配</h4>
            <label style="display:block; margin-bottom:10px;"><input type="checkbox" v-model="ruleConfig.semantic.enabled" /> 启用语义匹配</label>
            <label class="form-label">置信度阈值：{{ ruleConfig.semantic.threshold }}%</label>
            <input type="range" min="70" max="98" v-model.number="ruleConfig.semantic.threshold" style="width:100%;" />
            <div class="subtle" style="margin-top:12px;">用于识别“客户编号/客户号/核心客户ID”等跨系统语义等价字段。</div>
          </div>
        </div>

        <div class="card panel" style="margin-top:16px;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
            <div>
              <h2 class="section-title">同义词组管理</h2>
              <div class="subtle">支持新增、移除同义词组，动态参与模糊匹配规则计算。</div>
            </div>
            <div class="actions" style="min-width:360px;">
              <input class="input" v-model="newSynonymGroup" placeholder="输入同义词，使用逗号分隔，例如：客户号,客户编号,cust_no" />
              <button class="btn btn-primary" @click="addSynonymGroup">新增词组</button>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style="width:90px;">序号</th>
                  <th>同义词组</th>
                  <th style="width:120px;">词条数量</th>
                  <th style="width:120px;">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in synonymGroups" :key="group.id">
                  <td>{{ group.id }}</td>
                  <td>
                    <div class="list-inline">
                      <span class="pill" v-for="word in group.words" :key="word">{{ word }}</span>
                    </div>
                  </td>
                  <td>{{ group.words.length }}</td>
                  <td><button class="btn btn-link" style="color:#b91c1c;" @click="removeSynonymGroup(group.id)">移除</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card panel" style="margin-top:16px;">
          <h2 class="section-title">敏感字段自动分类规则</h2>
          <div class="subtle" style="margin:6px 0 14px;">结合正则表达式、标准分类和监管场景自动识别敏感级别。</div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>规则名称</th>
                  <th>识别条件</th>
                  <th>自动分类结果</th>
                  <th>适用场景</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rule in sensitivityRules" :key="rule.name">
                  <td>{{ rule.name }}</td>
                  <td>{{ rule.condition }}</td>
                  <td><span class="badge" :class="sensitivityClass(rule.level)">{{ rule.level }}</span></td>
                  <td>{{ rule.scene }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-mask" v-if="showAdjustModal">
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <h2 class="section-title">调整匹配结果</h2>
              <div class="subtle">支持从标准库搜索选择，或输入人工覆盖说明进行修正。</div>
            </div>
            <button class="btn btn-muted" @click="closeAdjustModal">关闭</button>
          </div>

          <div class="detail-block" v-if="selectedResult">
            <div><strong>源字段：</strong>{{ selectedResult.sourceField }}</div>
            <div><strong>源字段描述：</strong>{{ selectedResult.sourceDescription }}</div>
            <div><strong>当前匹配：</strong>{{ selectedResult.standardCode || '未匹配' }} / {{ selectedResult.standardName || '-' }}</div>
          </div>

          <div class="field-grid">
            <div>
              <label class="form-label">搜索标准</label>
              <input class="input" v-model="adjustSearch" placeholder="按标准代码 / 名称搜索" />
            </div>
            <div>
              <label class="form-label">候选标准</label>
              <select class="select" v-model="adjustStandardCode">
                <option value="">请选择标准</option>
                <option v-for="std in standardsForAdjust" :key="std.code" :value="std.code">{{ std.code }}｜{{ std.cnName }}</option>
              </select>
            </div>
            <div style="grid-column:1 / -1;">
              <label class="form-label">人工覆盖说明</label>
              <input class="input" v-model="manualOverride" placeholder="例如：按照监管报送口径，强制映射为客户统一编号" />
            </div>
          </div>

          <div class="actions" style="justify-content:flex-end; margin-top:16px;">
            <button class="btn btn-muted" @click="closeAdjustModal">取消</button>
            <button class="btn btn-primary" @click="applyAdjustment">确认调整</button>
          </div>
        </div>
      </div>

      <div class="modal-mask" v-if="showAddStandardModal">
        <div class="modal-card">
          <div class="modal-head">
            <div>
              <h2 class="section-title">新增标准</h2>
              <div class="subtle">新增字段级数据标准并纳入后续自动匹配候选集。</div>
            </div>
            <button class="btn btn-muted" @click="showAddStandardModal = false">关闭</button>
          </div>

          <div class="field-grid">
            <div>
              <label class="form-label">标准代码</label>
              <input class="input" v-model="newStandard.code" readonly />
            </div>
            <div>
              <label class="form-label">中文名称</label>
              <input class="input" v-model="newStandard.cnName" placeholder="例如：客户统一编号" />
            </div>
            <div>
              <label class="form-label">英文字段名</label>
              <input class="input" v-model="newStandard.enName" placeholder="例如：customer_unified_id" />
            </div>
            <div>
              <label class="form-label">数据类型</label>
              <select class="select" v-model="newStandard.dataType">
                <option>VARCHAR</option>
                <option>CHAR</option>
                <option>DECIMAL</option>
                <option>DATE</option>
                <option>TIMESTAMP</option>
                <option>INTEGER</option>
              </select>
            </div>
            <div>
              <label class="form-label">长度</label>
              <input class="input" v-model="newStandard.length" />
            </div>
            <div>
              <label class="form-label">默认值</label>
              <input class="input" v-model="newStandard.defaultValue" />
            </div>
            <div>
              <label class="form-label">业务分类</label>
              <select class="select" v-model="newStandard.category" @change="regenerateStandardCode">
                <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">敏感级别</label>
              <select class="select" v-model="newStandard.sensitivity">
                <option v-for="item in sensitivityLevels" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">可空</label>
              <select class="select" v-model="newStandard.nullable">
                <option :value="true">是</option>
                <option :value="false">否</option>
              </select>
            </div>
            <div>
              <label class="form-label">监管引用</label>
              <input class="input" v-model="newStandard.regulatoryRef" placeholder="CBIRC / PBOC" />
            </div>
            <div style="grid-column:1 / -1;">
              <label class="form-label">描述</label>
              <textarea v-model="newStandard.description"></textarea>
            </div>
            <div style="grid-column:1 / -1;">
              <label class="form-label">示例（逗号分隔）</label>
              <input class="input" v-model="newStandard.examplesText" placeholder="例如：客户主表、账户开户、监管报送台账" />
            </div>
          </div>

          <div class="actions" style="justify-content:flex-end; margin-top:16px;">
            <button class="btn btn-muted" @click="showAddStandardModal = false">取消</button>
            <button class="btn btn-primary" @click="saveStandard">保存标准</button>
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
    var standards = clone(mock.standards, [
      {
        code: 'CUST-001', cnName: '客户统一编号', enName: 'customer_unified_id', dataType: 'VARCHAR', length: '32', nullable: false,
        defaultValue: '', sensitivity: '高敏', category: '客户', regulatoryRef: 'CBIRC 客户信息治理指引',
        description: '用于贯通零售、对公、财富等系统客户主键的统一客户标识。',
        examples: ['客户主档', '授信客户画像', 'CRM 客户标签'],
        complianceRefs: ['银保监会客户信息治理要求', '人民银行金融统计标准化规范'],
        versionHistory: [{ version: 'v2.1', date: '2025-03-18', summary: '补充客户并户场景说明' }, { version: 'v2.0', date: '2024-12-09', summary: '统一全行客户主键口径' }],
        usedTables: 38, usedProjects: 12
      },
      {
        code: 'ACCT-008', cnName: '核心账号', enName: 'core_account_no', dataType: 'VARCHAR', length: '24', nullable: false,
        defaultValue: '', sensitivity: '高敏', category: '账户', regulatoryRef: 'PBOC 账户管理规范',
        description: '账户在核心系统中的唯一账号，用于跨系统账户穿透分析。',
        examples: ['账户余额快照', '交易流水', '对账台账'],
        complianceRefs: ['人民银行账户管理规范', '数据安全分级分类要求'],
        versionHistory: [{ version: 'v1.4', date: '2025-02-10', summary: '增加虚拟账号映射说明' }],
        usedTables: 52, usedProjects: 18
      },
      {
        code: 'TRAN-015', cnName: '交易金额', enName: 'transaction_amount', dataType: 'DECIMAL', length: '18,2', nullable: false,
        defaultValue: '0', sensitivity: '中敏', category: '交易', regulatoryRef: 'PBOC 支付清算数据标准',
        description: '统一定义入账/出账交易金额的精度与币种处理规则。',
        examples: ['支付清算', '信用卡交易', '反洗钱监测'],
        complianceRefs: ['人民银行支付清算标准', '反洗钱监测指标口径'],
        versionHistory: [{ version: 'v3.0', date: '2025-01-22', summary: '统一含税金额口径' }],
        usedTables: 64, usedProjects: 26
      },
      {
        code: 'RISK-011', cnName: '风险暴露等级', enName: 'risk_exposure_level', dataType: 'VARCHAR', length: '16', nullable: true,
        defaultValue: '', sensitivity: '内部', category: '风险', regulatoryRef: 'CBIRC 风险数据加总规范',
        description: '用于标识客户或账户在风险管理中的暴露等级和分层结果。',
        examples: ['授信风险分层', '预警名单', '贷后检查'],
        complianceRefs: ['银保监会风险数据加总要求'],
        versionHistory: [{ version: 'v1.1', date: '2024-11-03', summary: '补充贷后预警分级映射' }],
        usedTables: 17, usedProjects: 7
      }
    ]);
    var matchResults = clone(mock.standardMatches, [
      { id: 1, requirementId: 'REQ-2025-001', sourceField: 'cust_no', sourceDescription: '客户号', standardCode: 'CUST-001', standardName: '客户统一编号', dataType: 'VARCHAR(32)', matchType: '精确匹配', confidence: 98, status: '待确认' },
      { id: 2, requirementId: 'REQ-2025-001', sourceField: 'acct_id', sourceDescription: '客户主账户标识', standardCode: 'ACCT-008', standardName: '核心账号', dataType: 'VARCHAR(24)', matchType: '模糊匹配', confidence: 88, status: '已匹配' },
      { id: 3, requirementId: 'REQ-2025-001', sourceField: 'client_level', sourceDescription: '客户分层等级', standardCode: 'RISK-011', standardName: '风险暴露等级', dataType: 'VARCHAR(16)', matchType: '语义匹配', confidence: 79, status: '需调整' },
      { id: 4, requirementId: 'REQ-2025-014', sourceField: 'core_acct_no', sourceDescription: '核心系统账号', standardCode: 'ACCT-008', standardName: '核心账号', dataType: 'VARCHAR(24)', matchType: '精确匹配', confidence: 96, status: '待确认' },
      { id: 5, requirementId: 'REQ-2025-027', sourceField: 'txn_amt', sourceDescription: '原始交易金额', standardCode: 'TRAN-015', standardName: '交易金额', dataType: 'DECIMAL(18,2)', matchType: '模糊匹配', confidence: 92, status: '待确认' },
      { id: 6, requirementId: 'REQ-2025-027', sourceField: 'identity_no', sourceDescription: '证件号码', standardCode: '', standardName: '', dataType: 'VARCHAR(18)', matchType: '语义匹配', confidence: 67, status: '需调整' }
    ]);
    return {
      activeTab: 'results',
      requirements: requirements,
      standards: standards,
      matchResults: matchResults,
      categories: ['客户', '产品', '账户', '交易', '风险', '监管'],
      sensitivityLevels: ['公开', '内部', '中敏', '高敏'],
      selectedRequirementId: requirements[0] ? requirements[0].id : '',
      selectedResult: null,
      showAdjustModal: false,
      adjustSearch: '',
      adjustStandardCode: '',
      manualOverride: '',
      libraryKeyword: '',
      libraryCategory: '',
      librarySensitivity: '',
      selectedStandard: standards[0] || null,
      showAddStandardModal: false,
      newStandard: {
        code: 'CUST-005', cnName: '', enName: '', dataType: 'VARCHAR', length: '64', nullable: true, defaultValue: '',
        category: '客户', sensitivity: '内部', regulatoryRef: '', description: '', examplesText: ''
      },
      ruleConfig: {
        exact: { fieldName: true, dataType: true },
        fuzzy: { threshold: 82 },
        semantic: { enabled: true, threshold: 88 }
      },
      synonymGroups: clone(mock.synonymGroups, [
        { id: 1, words: ['客户号', '客户编号', 'cust_no'] },
        { id: 2, words: ['账户号', '账号', 'core_account_no'] },
        { id: 3, words: ['证件号码', '身份证号', 'identity_no'] }
      ]),
      newSynonymGroup: '',
      sensitivityRules: clone(mock.sensitivityRules, [
        { name: '身份证号识别', condition: '字段名包含 cert / identity，且长度=18', level: '高敏', scene: '客户主数据、开户资料' },
        { name: '账号类字段识别', condition: '分类为账户且字段名包含 acct/account', level: '高敏', scene: '核心账户、子账户、卡号' },
        { name: '监管指标识别', condition: '监管引用非空且分类=监管', level: '中敏', scene: 'EAST/1104/人行报送' }
      ])
    };
  },
  computed: {
    filteredResults: function () {
      var self = this;
      return this.matchResults.filter(function (row) {
        return !self.selectedRequirementId || row.requirementId === self.selectedRequirementId;
      });
    },
    summary: function () {
      var total = this.filteredResults.length || 1;
      var matched = this.filteredResults.filter(function (row) { return !!row.standardCode && row.status !== '已忽略'; }).length;
      var pending = this.filteredResults.filter(function (row) { return row.status === '待确认'; }).length;
      var needAdjust = this.filteredResults.filter(function (row) { return row.status === '需调整'; }).length;
      return {
        matched: matched,
        pending: pending,
        needAdjust: needAdjust,
        matchRate: Math.round((matched / total) * 100)
      };
    },
    filteredStandards: function () {
      var keyword = (this.libraryKeyword || '').toLowerCase();
      var category = this.libraryCategory;
      var sensitivity = this.librarySensitivity;
      return this.standards.filter(function (item) {
        var hitKeyword = !keyword || [item.code, item.cnName, item.enName].join(' ').toLowerCase().indexOf(keyword) > -1;
        var hitCategory = !category || item.category === category;
        var hitSensitivity = !sensitivity || item.sensitivity === sensitivity;
        return hitKeyword && hitCategory && hitSensitivity;
      });
    },
    standardsForAdjust: function () {
      var keyword = (this.adjustSearch || '').toLowerCase();
      return this.standards.filter(function (item) {
        return !keyword || [item.code, item.cnName, item.enName].join(' ').toLowerCase().indexOf(keyword) > -1;
      });
    }
  },
  methods: {
    matchTypeClass: function (type) {
      return {
        'badge-green': type === '精确匹配',
        'badge-blue': type === '模糊匹配',
        'badge-orange': type === '语义匹配',
        'badge-gray': type === '人工调整'
      };
    },
    sensitivityClass: function (level) {
      return {
        'badge-red': level === '高敏',
        'badge-orange': level === '中敏',
        'badge-purple': level === '内部',
        'badge-green': level === '公开'
      };
    },
    statusClass: function (status) {
      return {
        'badge-blue': status === '待确认',
        'badge-green': status === '已确认' || status === '已匹配',
        'badge-orange': status === '需调整',
        'badge-gray': status === '已忽略'
      };
    },
    confirmResult: function (row) {
      row.status = '已确认';
      if (!row.standardCode && this.standards.length) {
        row.standardCode = this.standards[0].code;
        row.standardName = this.standards[0].cnName;
      }
    },
    ignoreResult: function (row) {
      row.status = '已忽略';
    },
    openAdjustModal: function (row) {
      this.selectedResult = row;
      this.adjustSearch = row.standardName || row.sourceField;
      this.adjustStandardCode = row.standardCode || '';
      this.manualOverride = row.manualNote || '';
      this.showAdjustModal = true;
    },
    closeAdjustModal: function () {
      this.showAdjustModal = false;
      this.selectedResult = null;
      this.adjustSearch = '';
      this.adjustStandardCode = '';
      this.manualOverride = '';
    },
    applyAdjustment: function () {
      if (!this.selectedResult) {
        return;
      }
      var target = null;
      for (var i = 0; i < this.standards.length; i += 1) {
        if (this.standards[i].code === this.adjustStandardCode) {
          target = this.standards[i];
          break;
        }
      }
      if (target) {
        this.selectedResult.standardCode = target.code;
        this.selectedResult.standardName = target.cnName;
        this.selectedResult.dataType = target.dataType + '(' + target.length + ')';
      }
      this.selectedResult.matchType = '人工调整';
      this.selectedResult.status = '已确认';
      this.selectedResult.confidence = 100;
      this.selectedResult.manualNote = this.manualOverride;
      this.closeAdjustModal();
    },
    confirmHighConfidence: function () {
      var count = 0;
      this.filteredResults.forEach(function (row) {
        if (row.confidence > 90 && row.status !== '已确认') {
          row.status = '已确认';
          count += 1;
        }
      });
      window.alert('已确认 ' + count + ' 条高置信度匹配结果');
    },
    exportResults: function () {
      var headers = ['需求编号', '源字段名', '源字段描述', '匹配标准代码', '匹配标准名称', '数据类型', '匹配方式', '置信度', '状态'];
      var lines = [headers.join(',')];
      this.filteredResults.forEach(function (row) {
        lines.push([
          row.requirementId,
          row.sourceField,
          row.sourceDescription,
          row.standardCode,
          row.standardName,
          row.dataType,
          row.matchType,
          row.confidence,
          row.status
        ].join(','));
      });
      var blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'standard-match-results-' + (this.selectedRequirementId || 'all') + '.csv';
      link.click();
      URL.revokeObjectURL(url);
    },
    editStandard: function (std) {
      this.selectedStandard = std;
      this.newStandard = {
        code: std.code,
        cnName: std.cnName,
        enName: std.enName,
        dataType: std.dataType,
        length: std.length,
        nullable: std.nullable,
        defaultValue: std.defaultValue,
        category: std.category,
        sensitivity: std.sensitivity,
        regulatoryRef: std.regulatoryRef,
        description: std.description,
        examplesText: (std.examples || []).join('，')
      };
      this.showAddStandardModal = true;
    },
    openAddStandardModal: function () {
      this.newStandard = {
        code: this.generateStandardCode('客户'),
        cnName: '', enName: '', dataType: 'VARCHAR', length: '64', nullable: true, defaultValue: '',
        category: '客户', sensitivity: '内部', regulatoryRef: '', description: '', examplesText: ''
      };
      this.showAddStandardModal = true;
    },
    regenerateStandardCode: function () {
      this.newStandard.code = this.generateStandardCode(this.newStandard.category);
    },
    generateStandardCode: function (category) {
      var prefixMap = { '客户': 'CUST', '产品': 'PROD', '账户': 'ACCT', '交易': 'TRAN', '风险': 'RISK', '监管': 'REG' };
      var prefix = prefixMap[category] || 'STD';
      var count = this.standards.filter(function (item) { return item.code.indexOf(prefix + '-') === 0; }).length + 1;
      return prefix + '-' + String(count).padStart(3, '0');
    },
    saveStandard: function () {
      if (!this.newStandard.cnName || !this.newStandard.enName) {
        window.alert('请补充中文名称和英文字段名');
        return;
      }
      var examples = (this.newStandard.examplesText || '').split(/[，,]/).map(function (item) { return item.trim(); }).filter(Boolean);
      var payload = {
        code: this.newStandard.code,
        cnName: this.newStandard.cnName,
        enName: this.newStandard.enName,
        dataType: this.newStandard.dataType,
        length: this.newStandard.length,
        nullable: this.newStandard.nullable === true || this.newStandard.nullable === 'true',
        defaultValue: this.newStandard.defaultValue,
        sensitivity: this.newStandard.sensitivity,
        category: this.newStandard.category,
        regulatoryRef: this.newStandard.regulatoryRef,
        description: this.newStandard.description,
        examples: examples,
        complianceRefs: [this.newStandard.regulatoryRef || '待补充监管引用', '行内数据标准委员会审核通过后生效'],
        versionHistory: [{ version: 'v1.0', date: new Date().toISOString().slice(0, 10), summary: '新增数据标准' }],
        usedTables: 0,
        usedProjects: 0
      };
      var index = this.standards.findIndex(function (item) { return item.code === payload.code; });
      if (index > -1) {
        this.standards.splice(index, 1, payload);
      } else {
        this.standards.unshift(payload);
      }
      this.selectedStandard = payload;
      this.showAddStandardModal = false;
    },
    addSynonymGroup: function () {
      var words = (this.newSynonymGroup || '').split(/[，,、\s]+/).map(function (item) { return item.trim(); }).filter(Boolean);
      if (words.length < 2) {
        window.alert('请至少输入两个同义词');
        return;
      }
      this.synonymGroups.unshift({ id: this.synonymGroups.length ? this.synonymGroups[0].id + 1 : 1, words: words });
      this.newSynonymGroup = '';
    },
    removeSynonymGroup: function (id) {
      this.synonymGroups = this.synonymGroups.filter(function (item) { return item.id !== id; });
    }
  }
};
