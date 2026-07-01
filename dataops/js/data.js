/**
 * 数据中台 DataOps - 商业银行业务数据（Mock）
 * 所有数据仅供演示，不含真实敏感信息
 */
window.MockData = {

  /* ─────────────────────── 当前用户 ─────────────────────── */
  currentUser: {
    id: 'U005', name: '张建国', role: '数据工程师',
    dept: '数据中台部', avatar: '张', email: 'zhang.jianguo@bank.com'
  },

  /* ─────────────────────── 数据需求 ─────────────────────── */
  requirements: [
    { id:'REQ-2024-001', reqNo:'REQ-2024-001', title:'零售客户资产日汇总宽表', description:'整合零售客户在行内存款、理财、基金、贵金属等全品类资产数据，构建每日快照宽表，为客户资产排名、AUM统计及精准营销提供数据基础。', businessUnit:'零售银行部', dataSource:'核心银行系统/理财系统/基金销售系统', targetTable:'dw_dws.dws_cust_asset_d', targetPurpose:'客户资产排名、AUM统计、精准营销', priority:'高', status:'正式上线', submitter:'李明', submitDate:'2024-01-08', deadline:'2024-02-01', currentStep:'已完成', tags:['零售','资产','AUM','营销'] },
    { id:'REQ-2024-002', reqNo:'REQ-2024-002', title:'贷款逾期预警早发现模型数据集', description:'整合贷款合同、还款记录、客户行为数据，构建贷款逾期风险预警数据集，支持风险模型特征工程和逾期率监控。', businessUnit:'风险管理部', dataSource:'贷款系统/核心银行系统/风控系统', targetTable:'dw_ads.ads_risk_early_warn', targetPurpose:'贷款风险预警模型', priority:'高', status:'灰度上线', submitter:'王芳', submitDate:'2024-01-15', deadline:'2024-02-15', currentStep:'灰度验证中', tags:['风控','贷款','预警'] },
    { id:'REQ-2024-003', reqNo:'REQ-2024-003', title:'对公客户授信额度利用率统计', description:'统计对公客户各类授信产品（流动资金贷款、银行承兑汇票、信用证等）的额度使用情况，按机构、行业、产品维度汇总。', businessUnit:'对公银行部', dataSource:'授信系统/核心银行系统', targetTable:'dw_dws.dws_corp_credit_usage_m', targetPurpose:'对公客户额度管理、机构绩效考核', priority:'中', status:'技术审核中', submitter:'赵磊', submitDate:'2024-01-20', deadline:'2024-03-01', currentStep:'技术审核', tags:['对公','授信','额度'] },
    { id:'REQ-2024-004', reqNo:'REQ-2024-004', title:'监管报送EAST数据质量核验', description:'按银保监EAST4.0标准对101张报表数据进行质量校验，包括数据完整性、时效性、一致性检查，生成质量检测报告。', businessUnit:'合规监管部', dataSource:'监管报送系统/核心银行系统/贷款系统', targetTable:'dw_ads.ads_east_quality_check', targetPurpose:'监管报送数据质量保障', priority:'高', status:'合规审核中', submitter:'刘静', submitDate:'2024-01-22', deadline:'2024-02-10', currentStep:'合规审核', tags:['EAST','监管','数据质量'] },
    { id:'REQ-2024-005', reqNo:'REQ-2024-005', title:'网点客户行为分析数据集', description:'整合网点客户到访记录、业务办理数据、客户满意度评价，分析客户网点服务偏好及迁移趋势，支持网点布局优化。', businessUnit:'零售银行部', dataSource:'CRM系统/柜面系统/满意度系统', targetTable:'dw_dws.dws_branch_cust_behavior_m', targetPurpose:'网点优化、客户服务提升', priority:'中', status:'数据审核中', submitter:'陈志远', submitDate:'2024-01-25', deadline:'2024-03-15', currentStep:'数据审核', tags:['网点','CRM','行为分析'] },
    { id:'REQ-2024-006', reqNo:'REQ-2024-006', title:'FTP资金转移定价每日计算', description:'依据资金转移定价规则，计算各业务条线、各产品每日FTP价格及收益，支撑内部绩效考核及产品定价决策。', businessUnit:'财务管理部', dataSource:'FTP系统/核心银行系统', targetTable:'dw_ads.ads_ftp_daily_calc', targetPurpose:'FTP利润核算、绩效考核', priority:'高', status:'开发中', submitter:'吴建平', submitDate:'2024-01-28', deadline:'2024-02-20', currentStep:'规范开发中', tags:['FTP','定价','财务'] },
    { id:'REQ-2024-007', reqNo:'REQ-2024-007', title:'个人客户360画像更新优化', description:'在现有客户画像基础上新增投资风险偏好标签、生命周期阶段标签及近6个月交易行为特征，提升画像精准度。', businessUnit:'数据治理部', dataSource:'核心银行系统/理财系统/CRM系统/APP行为数据', targetTable:'dw_ads.ads_cust_360', targetPurpose:'精准营销、风险定价、智能客服', priority:'高', status:'脚本复核中', submitter:'孙瑞', submitDate:'2024-02-01', deadline:'2024-03-01', currentStep:'脚本复核', tags:['客户画像','标签','营销'] },
    { id:'REQ-2024-008', reqNo:'REQ-2024-008', title:'同业负债结构分析数据集', description:'整合同业存款、同业拆借、债券回购等负债数据，按期限结构、交易对手类型分析同业负债占比及趋势。', businessUnit:'金融市场部', dataSource:'资金系统/债券系统/核心银行系统', targetTable:'dw_dws.dws_interbank_liab_d', targetPurpose:'流动性风险管理、同业业务分析', priority:'中', status:'测试中', submitter:'周浩', submitDate:'2024-02-03', deadline:'2024-03-10', currentStep:'SIT测试', tags:['同业','流动性','金融市场'] },
    { id:'REQ-2024-009', reqNo:'REQ-2024-009', title:'反洗钱可疑交易特征数据集', description:'从交易数据中提取可疑交易特征指标（大额现金、频繁转账、异常时段等），为反洗钱模型提供特征数据。', businessUnit:'合规监管部', dataSource:'核心银行系统/清算系统/外汇系统', targetTable:'dw_ads.ads_aml_feature', targetPurpose:'反洗钱模型训练、可疑交易识别', priority:'高', status:'审核通过', submitter:'马晓峰', submitDate:'2024-02-05', deadline:'2024-02-28', currentStep:'开发待启动', tags:['反洗钱','合规','特征工程'] },
    { id:'REQ-2024-010', reqNo:'REQ-2024-010', title:'净息差NIM分析数据集', description:'计算全行及各条线净息差，拆解生息资产收益率和付息负债成本率，按产品、客群、期限维度进行多维分析。', businessUnit:'财务管理部', dataSource:'核心银行系统/FTP系统', targetTable:'dw_ads.ads_nim_analysis_m', targetPurpose:'利差管理、资产负债管理', priority:'中', status:'业务审核中', submitter:'郑华', submitDate:'2024-02-08', deadline:'2024-03-20', currentStep:'业务审核', tags:['NIM','利差','资产负债'] },
    { id:'REQ-2024-011', reqNo:'REQ-2024-011', title:'信用卡交易风险实时特征', description:'构建信用卡实时交易风险特征计算逻辑，包括IP位置偏移、消费金额异常、设备指纹变更等20个特征。', businessUnit:'风险管理部', dataSource:'信用卡系统/APP行为数据/设备指纹系统', targetTable:'dw_ads.ads_cc_risk_feature_rt', targetPurpose:'信用卡实时风控拦截', priority:'高', status:'草稿', submitter:'黄磊', submitDate:'2024-02-10', deadline:'2024-03-05', currentStep:'需求草稿', tags:['信用卡','实时风控','特征'] },
    { id:'REQ-2024-012', reqNo:'REQ-2024-012', title:'理财产品到期提醒数据集', description:'整合理财产品持有客户数据，提前T-7、T-3、T-1天生成到期提醒数据集，支持客户经理主动触达。', businessUnit:'零售银行部', dataSource:'理财系统/CRM系统', targetTable:'dw_ads.ads_wealth_expire_remind', targetPurpose:'客户主动维护、续购转化', priority:'低', status:'待审核', submitter:'林敏', submitDate:'2024-02-12', deadline:'2024-03-30', currentStep:'等待审核', tags:['理财','到期提醒','CRM'] },
    { id:'REQ-2024-013', reqNo:'REQ-2024-013', title:'BCBS239合规数据质量报告', description:'按照BCBS 239原则，对全行风险数据（信用风险、市场风险、流动性风险）进行数据质量评估和合规检查。', businessUnit:'合规监管部', dataSource:'风控系统/核心银行系统/资金系统', targetTable:'dw_ads.ads_bcbs239_quality_rpt', targetPurpose:'监管合规、风险数据质量管理', priority:'高', status:'已驳回', submitter:'范冰', submitDate:'2024-01-30', deadline:'2024-02-20', currentStep:'技术审核驳回', tags:['BCBS239','合规','风险数据'] },
    { id:'REQ-2024-014', reqNo:'REQ-2024-014', title:'普惠金融贷款季度统计', description:'按监管要求统计普惠型小微企业贷款、个人经营性贷款数量、金额、利率等核心指标，支持普惠金融考核。', businessUnit:'对公银行部', dataSource:'贷款系统/核心银行系统', targetTable:'dw_ads.ads_inclusive_finance_q', targetPurpose:'监管报送、普惠考核', priority:'高', status:'正式上线', submitter:'曹宇', submitDate:'2024-01-05', deadline:'2024-01-25', currentStep:'已完成', tags:['普惠金融','监管','小微'] },
    { id:'REQ-2024-015', reqNo:'REQ-2024-015', title:'存款产品收益率分析', description:'分析各类存款产品（活期、定期、通知存款、大额存单）的综合付息成本率，支持存款定价优化。', businessUnit:'财务管理部', dataSource:'核心银行系统/产品系统', targetTable:'dw_dws.dws_deposit_cost_m', targetPurpose:'存款定价、成本管控', priority:'中', status:'开发中', submitter:'叶思思', submitDate:'2024-02-14', deadline:'2024-03-25', currentStep:'规范开发中', tags:['存款','定价','成本'] },
    { id:'REQ-2024-016', reqNo:'REQ-2024-016', title:'机构KPI月度考核数据', description:'汇总各分支机构月度核心经营指标（存款、贷款、中间业务、新增客户等），生成机构考核数据集。', businessUnit:'运营管理部', dataSource:'核心银行系统/CRM系统', targetTable:'dw_dws.dws_branch_kpi_m', targetPurpose:'机构绩效考核', priority:'中', status:'正式上线', submitter:'邓超', submitDate:'2024-01-03', deadline:'2024-01-20', currentStep:'已完成', tags:['KPI','机构','绩效'] },
    { id:'REQ-2024-017', reqNo:'REQ-2024-017', title:'代发工资客户转化分析', description:'分析代发工资客户的交叉持仓率、活期转化率、贷款转化率，识别高价值潜在营销机会。', businessUnit:'零售银行部', dataSource:'核心银行系统/CRM系统/理财系统', targetTable:'dw_ads.ads_payroll_cust_convert', targetPurpose:'代发客户精准营销', priority:'中', status:'待审核', submitter:'石磊', submitDate:'2024-02-15', deadline:'2024-04-01', currentStep:'等待审核', tags:['代发','转化','营销'] },
    { id:'REQ-2024-018', reqNo:'REQ-2024-018', title:'供应链金融核心企业数据集', description:'构建供应链金融核心企业及其上下游客户的资金流、信息流数据集，支持供应链融资产品开发。', businessUnit:'对公银行部', dataSource:'核心银行系统/供应链系统/贸易融资系统', targetTable:'dw_ads.ads_supply_chain_finance', targetPurpose:'供应链融资产品', priority:'中', status:'数据审核中', submitter:'白云', submitDate:'2024-02-16', deadline:'2024-04-10', currentStep:'数据审核', tags:['供应链','对公','贸易融资'] },
    { id:'REQ-2024-019', reqNo:'REQ-2024-019', title:'房贷客户流失预警数据集', description:'通过分析房贷客户的提前还款倾向、竞品利率敏感度、客户活跃度等特征，识别高流失风险客户群体。', businessUnit:'零售银行部', dataSource:'贷款系统/CRM系统/APP行为数据', targetTable:'dw_ads.ads_mortgage_churn_warn', targetPurpose:'房贷客户留存、优惠策略制定', priority:'中', status:'脚本复核中', submitter:'魏刚', submitDate:'2024-02-17', deadline:'2024-03-20', currentStep:'脚本待复核', tags:['房贷','流失预警','零售'] },
    { id:'REQ-2024-020', reqNo:'REQ-2024-020', title:'绿色金融贷款余额统计', description:'按央行绿色金融统计要求，统计绿色贷款余额、结构及增速，生成绿色金融监管报表。', businessUnit:'合规监管部', dataSource:'贷款系统/核心银行系统', targetTable:'dw_ads.ads_green_finance_stat', targetPurpose:'绿色金融监管报送、ESG信息披露', priority:'高', status:'技术审核中', submitter:'方立', submitDate:'2024-02-18', deadline:'2024-03-10', currentStep:'技术审核', tags:['绿色金融','ESG','监管'] }
  ],

  /* ─────────────────────── 审核步骤 ─────────────────────── */
  workflowSteps: [
    { id:'WS-001', reqId:'REQ-2024-002', stepName:'业务审核', stepType:'business', approver:'陈志远', approverDept:'风险管理部', status:'approved', comments:'需求合理，业务场景清晰，建议优先推进。', timestamp:'2024-01-17 09:30' },
    { id:'WS-002', reqId:'REQ-2024-002', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'源数据已评估，贷款系统数据质量较好，可支撑需求。注意处理还款日期的时区问题。', timestamp:'2024-01-19 14:20' },
    { id:'WS-003', reqId:'REQ-2024-002', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'approved', comments:'脚本逻辑正确，性能测试通过，建议增加分区裁剪优化。', timestamp:'2024-01-22 10:45' },
    { id:'WS-004', reqId:'REQ-2024-002', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'approved', comments:'涉及客户信用信息，已确认数据使用符合《个人信息保护法》要求。', timestamp:'2024-01-24 16:00' },
    { id:'WS-005', reqId:'REQ-2024-003', stepName:'业务审核', stepType:'business', approver:'韩总', approverDept:'对公银行部', status:'approved', comments:'符合对公业务管理需求，请加快推进。', timestamp:'2024-01-22 11:00' },
    { id:'WS-006', reqId:'REQ-2024-003', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'数据源评估完成，授信系统数据结构清晰。', timestamp:'2024-01-25 15:30' },
    { id:'WS-007', reqId:'REQ-2024-003', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-008', reqId:'REQ-2024-003', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-009', reqId:'REQ-2024-004', stepName:'业务审核', stepType:'business', approver:'刘静', approverDept:'合规监管部', status:'approved', comments:'监管要求，须尽快完成。', timestamp:'2024-01-24 09:00' },
    { id:'WS-010', reqId:'REQ-2024-004', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'EAST数据标准已对齐，数据源完整。', timestamp:'2024-01-26 14:00' },
    { id:'WS-011', reqId:'REQ-2024-004', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'approved', comments:'技术方案可行，注意EAST字段长度约束。', timestamp:'2024-01-28 10:00' },
    { id:'WS-012', reqId:'REQ-2024-004', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-013', reqId:'REQ-2024-005', stepName:'业务审核', stepType:'business', approver:'王网点总', approverDept:'零售银行部', status:'approved', comments:'需求合理，有助于网点效能提升。', timestamp:'2024-01-27 10:30' },
    { id:'WS-014', reqId:'REQ-2024-005', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-015', reqId:'REQ-2024-010', stepName:'业务审核', stepType:'business', approver:'财务总监', approverDept:'财务管理部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-016', reqId:'REQ-2024-013', stepName:'业务审核', stepType:'business', approver:'合规总监', approverDept:'合规监管部', status:'approved', comments:'BCBS239是强监管要求，全力配合。', timestamp:'2024-02-01 09:00' },
    { id:'WS-017', reqId:'REQ-2024-013', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'风险数据覆盖面广，需协调多个系统，建议分阶段推进。', timestamp:'2024-02-03 15:00' },
    { id:'WS-018', reqId:'REQ-2024-013', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'rejected', comments:'当前ETL脚本性能问题严重，全量跑批预计超过6小时，超出时间窗口限制，需重新设计分区策略后重提。', timestamp:'2024-02-05 17:30' },
    { id:'WS-019', reqId:'REQ-2024-007', stepName:'业务审核', stepType:'business', approver:'零售总', approverDept:'零售银行部', status:'approved', comments:'客户画像升级是营销数字化转型重要支撑，同意推进。', timestamp:'2024-02-03 11:00' },
    { id:'WS-020', reqId:'REQ-2024-007', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'新增标签字段已对齐数据标准库，数据源覆盖完整。', timestamp:'2024-02-05 14:30' },
    { id:'WS-021', reqId:'REQ-2024-007', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'approved', comments:'技术方案合理，增量更新策略正确，脚本已复核通过。', timestamp:'2024-02-07 16:00' },
    { id:'WS-022', reqId:'REQ-2024-007', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'approved', comments:'客户画像涉及个人信息，已确认合法合规，需在使用说明中明确数据用途限制。', timestamp:'2024-02-09 10:30' },
    { id:'WS-023', reqId:'REQ-2024-018', stepName:'业务审核', stepType:'business', approver:'对公总监', approverDept:'对公银行部', status:'approved', comments:'供应链金融是重点战略方向，需求合理，加速推进。', timestamp:'2024-02-18 14:00' },
    { id:'WS-024', reqId:'REQ-2024-018', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-025', reqId:'REQ-2024-019', stepName:'业务审核', stepType:'business', approver:'零售总', approverDept:'零售银行部', status:'approved', comments:'同意，房贷客户流失问题已比较突出，需加速。', timestamp:'2024-02-19 09:00' },
    { id:'WS-026', reqId:'REQ-2024-019', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'数据源评估完成，APP行为数据质量需特别关注。', timestamp:'2024-02-20 15:00' },
    { id:'WS-027', reqId:'REQ-2024-019', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'approved', comments:'技术方案通过，脚本待最终复核。', timestamp:'2024-02-22 11:00' },
    { id:'WS-028', reqId:'REQ-2024-019', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'approved', comments:'数据使用符合合规要求。', timestamp:'2024-02-23 16:00' },
    { id:'WS-029', reqId:'REQ-2024-020', stepName:'业务审核', stepType:'business', approver:'合规总监', approverDept:'合规监管部', status:'approved', comments:'绿色金融监管报送是必要工作，需在3月底前完成。', timestamp:'2024-02-19 10:00' },
    { id:'WS-030', reqId:'REQ-2024-020', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'绿色贷款标识字段已在贷款系统中完成改造，可用。', timestamp:'2024-02-21 14:00' },
    { id:'WS-031', reqId:'REQ-2024-020', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'pending', comments:'', timestamp:'' },
    { id:'WS-032', reqId:'REQ-2024-008', stepName:'业务审核', stepType:'business', approver:'资金部总监', approverDept:'金融市场部', status:'approved', comments:'同业负债管理需求明确，同意。', timestamp:'2024-02-05 10:00' },
    { id:'WS-033', reqId:'REQ-2024-008', stepName:'数据审核', stepType:'data', approver:'张建国', approverDept:'数据中台部', status:'approved', comments:'数据源确认，资金系统数据接入已完成。', timestamp:'2024-02-07 14:00' },
    { id:'WS-034', reqId:'REQ-2024-008', stepName:'技术审核', stepType:'tech', approver:'刘晓宇', approverDept:'数据中台部', status:'approved', comments:'技术方案通过，进入测试阶段。', timestamp:'2024-02-09 11:00' },
    { id:'WS-035', reqId:'REQ-2024-008', stepName:'合规审核', stepType:'compliance', approver:'张合规', approverDept:'合规部', status:'approved', comments:'同业数据不涉及个人信息，合规无异议。', timestamp:'2024-02-11 15:00' }
  ],

  /* ─────────────────────── 数据标准 ─────────────────────── */
  dataStandards: [
    { id:'STD-001', stdCode:'CUS_ID', fieldName:'cust_id', chineseName:'客户号', dataType:'VARCHAR', maxLength:20, nullable:false, defaultValue:'', description:'全行唯一客户标识，由系统自动生成，格式为C+15位数字', category:'客户', regulatoryRef:'银保监客户标识规范', sensitivity:'内部', examples:['C202301000001','C202301000002'] },
    { id:'STD-002', stdCode:'CUS_NAME', fieldName:'cust_name', chineseName:'客户姓名', dataType:'VARCHAR', maxLength:100, nullable:false, defaultValue:'', description:'个人客户为法定姓名，企业客户为工商注册名称（全称）', category:'客户', regulatoryRef:'AML客户信息规范', sensitivity:'机密', examples:['张三','某某有限公司'] },
    { id:'STD-003', stdCode:'CERT_NO', fieldName:'cert_no', chineseName:'证件号码', dataType:'VARCHAR', maxLength:50, nullable:false, defaultValue:'', description:'身份证号/统一社会信用代码等，需脱敏处理后存储', category:'客户', regulatoryRef:'人民银行客户身份识别规范', sensitivity:'绝密', examples:['3101**********0012','91310000MA1A***2X5'] },
    { id:'STD-004', stdCode:'ACCT_NO', fieldName:'acct_no', chineseName:'账号', dataType:'VARCHAR', maxLength:32, nullable:false, defaultValue:'', description:'银行账号，内存储为加密格式，展示时末四位明文', category:'账户', regulatoryRef:'账户管理规定', sensitivity:'机密', examples:['6225*******0012','6228*******8821'] },
    { id:'STD-005', stdCode:'BAL_AMT', fieldName:'bal_amt', chineseName:'账户余额', dataType:'DECIMAL', maxLength:20, nullable:false, defaultValue:'0.00', description:'账户实时余额，单位元，保留2位小数', category:'账户', regulatoryRef:'会计准则', sensitivity:'机密', examples:['10000.00','258963.75'] },
    { id:'STD-006', stdCode:'LOAN_NO', fieldName:'loan_no', chineseName:'贷款合同号', dataType:'VARCHAR', maxLength:30, nullable:false, defaultValue:'', description:'贷款合同唯一标识，格式：年份+机构代码+产品代码+序号', category:'产品', regulatoryRef:'贷款统计制度', sensitivity:'内部', examples:['20240101001001','20240201003052'] },
    { id:'STD-007', stdCode:'LOAN_AMT', fieldName:'loan_amt', chineseName:'贷款金额', dataType:'DECIMAL', maxLength:20, nullable:false, defaultValue:'0.00', description:'贷款合同金额，单位元，保留2位小数', category:'产品', regulatoryRef:'贷款统计制度', sensitivity:'内部', examples:['500000.00','5000000.00'] },
    { id:'STD-008', stdCode:'LOAN_RATE', fieldName:'loan_rate', chineseName:'贷款利率', dataType:'DECIMAL', maxLength:10, nullable:false, defaultValue:'0.00', description:'年化贷款利率，以小数表示，如0.0435表示4.35%', category:'产品', regulatoryRef:'贷款利率统计', sensitivity:'内部', examples:['0.0435','0.0360'] },
    { id:'STD-009', stdCode:'OVRD_DAYS', fieldName:'overdue_days', chineseName:'逾期天数', dataType:'INTEGER', maxLength:6, nullable:true, defaultValue:'0', description:'贷款当前逾期天数，0表示正常', category:'风险', regulatoryRef:'贷款五级分类标准', sensitivity:'机密', examples:['0','30','90'] },
    { id:'STD-010', stdCode:'RISK_LEVEL', fieldName:'risk_level', chineseName:'风险等级', dataType:'VARCHAR', maxLength:10, nullable:false, defaultValue:'正常', description:'贷款五级分类：正常/关注/次级/可疑/损失', category:'风险', regulatoryRef:'商业银行贷款损失准备金管理办法', sensitivity:'机密', examples:['正常','关注','次级'] },
    { id:'STD-011', stdCode:'TXN_AMT', fieldName:'txn_amt', chineseName:'交易金额', dataType:'DECIMAL', maxLength:20, nullable:false, defaultValue:'0.00', description:'单笔交易金额，正数为收入，负数为支出，单位元', category:'交易', regulatoryRef:'交易监控规范', sensitivity:'机密', examples:['1000.00','-500.00','50000.00'] },
    { id:'STD-012', stdCode:'TXN_TIME', fieldName:'txn_time', chineseName:'交易时间', dataType:'TIMESTAMP', maxLength:26, nullable:false, defaultValue:'', description:'交易发生的时间戳，精确到毫秒，UTC+8时区', category:'交易', regulatoryRef:'交易记录保存规范', sensitivity:'内部', examples:['2024-02-01 09:30:15.123'] },
    { id:'STD-013', stdCode:'PROD_CODE', fieldName:'prod_code', chineseName:'产品代码', dataType:'VARCHAR', maxLength:20, nullable:false, defaultValue:'', description:'金融产品唯一代码，由产品管理部统一分配', category:'产品', regulatoryRef:'产品管理规定', sensitivity:'内部', examples:['DEP001','LOAN010','WM20231201'] },
    { id:'STD-014', stdCode:'ORG_CODE', fieldName:'org_code', chineseName:'机构代码', dataType:'VARCHAR', maxLength:12, nullable:false, defaultValue:'', description:'银行内部机构代码，按行政层级编码', category:'客户', regulatoryRef:'机构代码管理规范', sensitivity:'公开', examples:['0101','0102001','0201003'] },
    { id:'STD-015', stdCode:'DATA_DATE', fieldName:'data_date', chineseName:'数据日期', dataType:'DATE', maxLength:10, nullable:false, defaultValue:'', description:'数据所属业务日期，分区键，格式YYYY-MM-DD', category:'账户', regulatoryRef:'数据仓库规范', sensitivity:'公开', examples:['2024-02-01','2024-02-15'] },
    { id:'STD-016', stdCode:'AUM_AMT', fieldName:'aum_amt', chineseName:'资产管理规模', dataType:'DECIMAL', maxLength:20, nullable:false, defaultValue:'0.00', description:'客户管理资产规模，含存款、理财、基金、保险等，单位元', category:'客户', regulatoryRef:'资管新规', sensitivity:'机密', examples:['1000000.00','5000000.00'] },
    { id:'STD-017', stdCode:'CUST_TIER', fieldName:'cust_tier', chineseName:'客户等级', dataType:'VARCHAR', maxLength:10, nullable:false, defaultValue:'普通', description:'零售客户等级：普通/银卡/金卡/白金/钻石/私行', category:'客户', regulatoryRef:'VIP客户管理规范', sensitivity:'内部', examples:['普通','金卡','私行'] },
    { id:'STD-018', stdCode:'REPORT_DT', fieldName:'report_date', chineseName:'报告期', dataType:'DATE', maxLength:10, nullable:false, defaultValue:'', description:'监管报告所属期间，通常为月末/季末/年末', category:'监管', regulatoryRef:'银行业监督管理报告制度', sensitivity:'内部', examples:['2024-01-31','2024-03-31'] },
    { id:'STD-019', stdCode:'FTP_RATE', fieldName:'ftp_rate', chineseName:'FTP利率', dataType:'DECIMAL', maxLength:10, nullable:false, defaultValue:'0.00', description:'内部资金转移定价利率，年化，以小数表示', category:'产品', regulatoryRef:'FTP定价管理办法', sensitivity:'机密', examples:['0.0250','0.0380'] },
    { id:'STD-020', stdCode:'CREDIT_LMT', fieldName:'credit_limit', chineseName:'授信额度', dataType:'DECIMAL', maxLength:20, nullable:false, defaultValue:'0.00', description:'批准的最高授信总额度，单位元', category:'风险', regulatoryRef:'授信管理办法', sensitivity:'机密', examples:['1000000.00','50000000.00'] },
    { id:'STD-021', stdCode:'GREEN_FLAG', fieldName:'green_loan_flag', chineseName:'绿色贷款标识', dataType:'CHAR', maxLength:1, nullable:false, defaultValue:'N', description:'是否为绿色贷款：Y-是，N-否，按央行绿色贷款目录认定', category:'监管', regulatoryRef:'绿色贷款专项统计制度', sensitivity:'内部', examples:['Y','N'] },
    { id:'STD-022', stdCode:'AML_RISK', fieldName:'aml_risk_level', chineseName:'反洗钱风险等级', dataType:'VARCHAR', maxLength:10, nullable:false, defaultValue:'低风险', description:'客户反洗钱风险等级：低风险/中风险/高风险', category:'风险', regulatoryRef:'金融机构反洗钱和反恐怖融资管理办法', sensitivity:'机密', examples:['低风险','高风险'] },
    { id:'STD-023', stdCode:'INCL_FIN', fieldName:'inclusive_fin_flag', chineseName:'普惠金融标识', dataType:'CHAR', maxLength:1, nullable:false, defaultValue:'N', description:'是否纳入普惠金融统计口径：Y-是，N-否', category:'监管', regulatoryRef:'普惠金融统计制度', sensitivity:'内部', examples:['Y','N'] },
    { id:'STD-024', stdCode:'NIM_RATE', fieldName:'nim_rate', chineseName:'净息差', dataType:'DECIMAL', maxLength:10, nullable:true, defaultValue:'', description:'净息差=利息净收入/平均生息资产，以百分比小数表示', category:'产品', regulatoryRef:'商业银行财务报告披露要求', sensitivity:'内部', examples:['0.0180','0.0215'] },
    { id:'STD-025', stdCode:'PART_DT', fieldName:'partition_date', chineseName:'分区日期', dataType:'DATE', maxLength:10, nullable:false, defaultValue:'', description:'Hive分区字段，格式YYYY-MM-DD，用于数据分区管理', category:'账户', regulatoryRef:'数据仓库技术规范', sensitivity:'公开', examples:['2024-02-01'] },
    { id:'STD-026', stdCode:'ETL_TS', fieldName:'etl_timestamp', chineseName:'ETL处理时间', dataType:'TIMESTAMP', maxLength:26, nullable:false, defaultValue:'CURRENT_TIMESTAMP', description:'ETL作业写入时间，由系统自动填充，UTC+8', category:'账户', regulatoryRef:'数据仓库技术规范', sensitivity:'公开', examples:['2024-02-01 02:30:00.000'] },
    { id:'STD-027', stdCode:'SRC_SYS', fieldName:'src_system', chineseName:'来源系统', dataType:'VARCHAR', maxLength:20, nullable:false, defaultValue:'', description:'数据来源系统代码：CORE/CRM/LOAN/CLEAR/FX/WM等', category:'账户', regulatoryRef:'数据血缘管理规范', sensitivity:'内部', examples:['CORE','LOAN','CRM'] },
    { id:'STD-028', stdCode:'BATCH_DT', fieldName:'batch_date', chineseName:'跑批日期', dataType:'DATE', maxLength:10, nullable:false, defaultValue:'', description:'跑批作业处理的业务日期', category:'账户', regulatoryRef:'数据仓库技术规范', sensitivity:'公开', examples:['2024-02-01'] },
    { id:'STD-029', stdCode:'CORP_REG', fieldName:'corp_reg_no', chineseName:'统一社会信用代码', dataType:'VARCHAR', maxLength:18, nullable:true, defaultValue:'', description:'企业统一社会信用代码，18位，仅对企业客户适用', category:'客户', regulatoryRef:'企业信息公示暂行条例', sensitivity:'内部', examples:['91310000MA1A****X5'] },
    { id:'STD-030', stdCode:'DUE_DT', fieldName:'due_date', chineseName:'到期日', dataType:'DATE', maxLength:10, nullable:true, defaultValue:'', description:'产品/合同到期日期，适用于定期存款、贷款、理财等', category:'产品', regulatoryRef:'合同管理规范', sensitivity:'内部', examples:['2025-02-01','2027-06-30'] }
  ],

  /* ─────────────────────── 标准匹配结果 ─────────────────────── */
  matchResults: [
    { id:'MR-001', reqId:'REQ-2024-002', sourceField:'custid', matchedStdCode:'CUS_ID', matchedFieldName:'cust_id', confidence:98, matchMethod:'精确匹配', status:'已确认' },
    { id:'MR-002', reqId:'REQ-2024-002', sourceField:'loan_contract_num', matchedStdCode:'LOAN_NO', matchedFieldName:'loan_no', confidence:92, matchMethod:'模糊匹配', status:'已确认' },
    { id:'MR-003', reqId:'REQ-2024-002', sourceField:'loan_amount', matchedStdCode:'LOAN_AMT', matchedFieldName:'loan_amt', confidence:95, matchMethod:'精确匹配', status:'已确认' },
    { id:'MR-004', reqId:'REQ-2024-002', sourceField:'interest_rate', matchedStdCode:'LOAN_RATE', matchedFieldName:'loan_rate', confidence:88, matchMethod:'模糊匹配', status:'已确认' },
    { id:'MR-005', reqId:'REQ-2024-002', sourceField:'overdue_day_count', matchedStdCode:'OVRD_DAYS', matchedFieldName:'overdue_days', confidence:85, matchMethod:'语义匹配', status:'已确认' },
    { id:'MR-006', reqId:'REQ-2024-002', sourceField:'risk_class', matchedStdCode:'RISK_LEVEL', matchedFieldName:'risk_level', confidence:90, matchMethod:'模糊匹配', status:'已调整' },
    { id:'MR-007', reqId:'REQ-2024-007', sourceField:'client_id', matchedStdCode:'CUS_ID', matchedFieldName:'cust_id', confidence:99, matchMethod:'精确匹配', status:'已确认' },
    { id:'MR-008', reqId:'REQ-2024-007', sourceField:'total_asset_value', matchedStdCode:'AUM_AMT', matchedFieldName:'aum_amt', confidence:82, matchMethod:'语义匹配', status:'待确认' },
    { id:'MR-009', reqId:'REQ-2024-007', sourceField:'customer_grade', matchedStdCode:'CUST_TIER', matchedFieldName:'cust_tier', confidence:87, matchMethod:'语义匹配', status:'待确认' },
    { id:'MR-010', reqId:'REQ-2024-007', sourceField:'account_balance', matchedStdCode:'BAL_AMT', matchedFieldName:'bal_amt', confidence:95, matchMethod:'精确匹配', status:'已确认' },
    { id:'MR-011', reqId:'REQ-2024-004', sourceField:'report_period', matchedStdCode:'REPORT_DT', matchedFieldName:'report_date', confidence:93, matchMethod:'模糊匹配', status:'已确认' },
    { id:'MR-012', reqId:'REQ-2024-004', sourceField:'trans_amount', matchedStdCode:'TXN_AMT', matchedFieldName:'txn_amt', confidence:96, matchMethod:'精确匹配', status:'已确认' },
    { id:'MR-013', reqId:'REQ-2024-020', sourceField:'green_credit_flag', matchedStdCode:'GREEN_FLAG', matchedFieldName:'green_loan_flag', confidence:91, matchMethod:'模糊匹配', status:'待确认' },
    { id:'MR-014', reqId:'REQ-2024-009', sourceField:'aml_risk_score', matchedStdCode:'AML_RISK', matchedFieldName:'aml_risk_level', confidence:78, matchMethod:'语义匹配', status:'待确认' },
    { id:'MR-015', reqId:'REQ-2024-003', sourceField:'credit_ceiling', matchedStdCode:'CREDIT_LMT', matchedFieldName:'credit_limit', confidence:89, matchMethod:'模糊匹配', status:'已确认' }
  ],

  /* ─────────────────────── 开发规范 ─────────────────────── */
  devSpecs: [
    {
      id:'DS-001', reqId:'REQ-2024-001', specNo:'SPEC-DWS-001', title:'零售客户资产日汇总宽表开发规范', version:'1.2', status:'已发布',
      createDate:'2024-01-10', author:'张建国',
      tableStructure:`CREATE TABLE dw_dws.dws_cust_asset_d (
  data_date       DATE         NOT NULL COMMENT '数据日期',
  cust_id         VARCHAR(20)  NOT NULL COMMENT '客户号',
  cust_name       VARCHAR(100) COMMENT '客户姓名（脱敏）',
  cust_tier       VARCHAR(10)  COMMENT '客户等级',
  dep_bal_amt     DECIMAL(20,2) DEFAULT 0.00 COMMENT '存款余额',
  wm_bal_amt      DECIMAL(20,2) DEFAULT 0.00 COMMENT '理财余额',
  fund_bal_amt    DECIMAL(20,2) DEFAULT 0.00 COMMENT '基金余额',
  gold_bal_amt    DECIMAL(20,2) DEFAULT 0.00 COMMENT '贵金属余额',
  aum_amt         DECIMAL(20,2) DEFAULT 0.00 COMMENT 'AUM总量',
  loan_bal_amt    DECIMAL(20,2) DEFAULT 0.00 COMMENT '贷款余额',
  etl_timestamp   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT 'ETL时间'
) COMMENT '零售客户资产日汇总宽表'
PARTITIONED BY (data_date DATE)
STORED AS ORC
TBLPROPERTIES ('orc.compress'='SNAPPY');`,
      transformLogic:'从ODS层客户信息、存款账户、理财持仓、基金持仓等表中，以客户号为键进行全外连接，汇总各品类资产余额，AUM=存款+理财+基金+贵金属，增量更新策略（每日T+1跑批）',
      qualityRules:['cust_id非空校验','aum_amt>=0值域校验','data_date唯一性校验（分区内）','dep_bal_amt+wm_bal_amt+fund_bal_amt+gold_bal_amt<=aum_amt一致性校验'],
      dataLineage:'dw_ods.ods_cust_info → dw_dwd.dwd_cust_base_d → dw_dws.dws_cust_asset_d',
      reviewComments:'v1.1 增加gold_bal_amt字段；v1.2 修复AUM计算口径遗漏贵金属问题'
    },
    {
      id:'DS-002', reqId:'REQ-2024-002', specNo:'SPEC-ADS-001', title:'贷款逾期预警数据集开发规范', version:'1.0', status:'审核中',
      createDate:'2024-01-25', author:'张建国',
      tableStructure:`CREATE TABLE dw_ads.ads_risk_early_warn (
  data_date       DATE         NOT NULL COMMENT '数据日期',
  cust_id         VARCHAR(20)  NOT NULL COMMENT '客户号',
  loan_no         VARCHAR(30)  NOT NULL COMMENT '贷款合同号',
  loan_amt        DECIMAL(20,2) COMMENT '贷款金额',
  loan_rate       DECIMAL(10,6) COMMENT '贷款利率',
  overdue_days    INTEGER      DEFAULT 0 COMMENT '逾期天数',
  risk_level      VARCHAR(10)  COMMENT '五级分类',
  warn_level      VARCHAR(10)  COMMENT '预警等级',
  warn_reason     VARCHAR(500) COMMENT '预警原因',
  handler_id      VARCHAR(20)  COMMENT '客户经理工号',
  etl_timestamp   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT 'ETL时间'
) COMMENT '贷款逾期风险预警数据集'
PARTITIONED BY (data_date DATE)
STORED AS ORC;`,
      transformLogic:'综合逾期天数、还款行为变化、客户资产变化等多维特征，生成风险预警等级（高/中/低）',
      qualityRules:['loan_no非空唯一','overdue_days>=0','risk_level in (正常,关注,次级,可疑,损失)'],
      dataLineage:'dw_ods.ods_loan_contract + dw_ods.ods_repay_record → dw_dwd.dwd_loan_detail_d → dw_ads.ads_risk_early_warn',
      reviewComments:''
    }
  ],

  /* ─────────────────────── 脚本 ─────────────────────── */
  scripts: [
    {
      id:'SCR-001', specId:'DS-001', scriptName:'dws_cust_asset_d_daily', scriptType:'SQL',
      version:'v1.3', author:'张建国', status:'已部署',
      createDate:'2024-01-12', reviewDate:'2024-01-14', reviewComments:'命名规范、性能均通过复核',
      content:`-- ============================================================
-- 脚本名称: dws_cust_asset_d_daily
-- 功    能: 零售客户资产日汇总宽表每日增量ETL
-- 作    者: 张建国  版本: v1.3  日期: 2024-01-12
-- 依    赖: dw_dwd.dwd_cust_base_d / ods_deposit_acct / wm_holding
-- ============================================================
SET hive.exec.dynamic.partition.mode=nonstrict;
SET hive.exec.dynamic.partition=true;
SET hive.vectorized.execution.enabled=true;

-- Step 1: 写入客户资产汇总
INSERT OVERWRITE TABLE dw_dws.dws_cust_asset_d PARTITION (data_date)
SELECT
    c.cust_id,
    c.cust_name_mask                          AS cust_name,
    c.cust_tier,
    COALESCE(d.dep_bal_amt,    0.00)          AS dep_bal_amt,
    COALESCE(w.wm_bal_amt,     0.00)          AS wm_bal_amt,
    COALESCE(f.fund_bal_amt,   0.00)          AS fund_bal_amt,
    COALESCE(g.gold_bal_amt,   0.00)          AS gold_bal_amt,
    COALESCE(d.dep_bal_amt, 0) +
    COALESCE(w.wm_bal_amt,  0) +
    COALESCE(f.fund_bal_amt,0) +
    COALESCE(g.gold_bal_amt,0)                AS aum_amt,
    COALESCE(l.loan_bal_amt,   0.00)          AS loan_bal_amt,
    CURRENT_TIMESTAMP                         AS etl_timestamp,
    '${bizdate}'                              AS data_date
FROM dw_dwd.dwd_cust_base_d c
LEFT JOIN (
    SELECT cust_id, SUM(bal_amt) AS dep_bal_amt
    FROM dw_dwd.dwd_deposit_detail_d
    WHERE data_date = '${bizdate}' AND acct_status = '正常'
    GROUP BY cust_id
) d ON c.cust_id = d.cust_id
LEFT JOIN (
    SELECT cust_id, SUM(hold_amt) AS wm_bal_amt
    FROM dw_ods.ods_wm_holding
    WHERE data_date = '${bizdate}' AND hold_status = 'ACTIVE'
    GROUP BY cust_id
) w ON c.cust_id = w.cust_id
LEFT JOIN (
    SELECT cust_id, SUM(nav_amt) AS fund_bal_amt
    FROM dw_ods.ods_fund_position
    WHERE data_date = '${bizdate}'
    GROUP BY cust_id
) f ON c.cust_id = f.cust_id
LEFT JOIN (
    SELECT cust_id, SUM(mkt_val_amt) AS gold_bal_amt
    FROM dw_ods.ods_gold_position
    WHERE data_date = '${bizdate}'
    GROUP BY cust_id
) g ON c.cust_id = g.cust_id
LEFT JOIN (
    SELECT cust_id, SUM(bal_amt) AS loan_bal_amt
    FROM dw_dwd.dwd_loan_detail_d
    WHERE data_date = '${bizdate}' AND loan_status = '正常'
    GROUP BY cust_id
) l ON c.cust_id = l.cust_id
WHERE c.data_date = '${bizdate}'
  AND c.retail_flag = 'Y';`,
      parseResult:{
        tables:['dw_dwd.dwd_cust_base_d','dw_dwd.dwd_deposit_detail_d','dw_ods.ods_wm_holding','dw_ods.ods_fund_position','dw_ods.ods_gold_position','dw_dwd.dwd_loan_detail_d'],
        operations:['READ','READ','READ','READ','READ','WRITE'],
        dependencies:['dws_cust_asset_d_daily依赖dwd_cust_base_d完成','依赖ods_wm_holding同步完成']
      },
      versionHistory:[{v:'v1.1',date:'2024-01-10',author:'张建国',change:'初始版本'},{v:'v1.2',date:'2024-01-11',author:'张建国',change:'增加贵金属字段gold_bal_amt'},{v:'v1.3',date:'2024-01-12',author:'张建国',change:'修复AUM计算逻辑'}]
    },
    {
      id:'SCR-002', specId:'DS-002', scriptName:'ads_risk_early_warn_daily', scriptType:'Python',
      version:'v1.0', author:'李工', status:'复核通过',
      createDate:'2024-01-26', reviewDate:'2024-01-28', reviewComments:'逻辑正确，日志完整',
      content:`#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
脚本名称: ads_risk_early_warn_daily.py
功    能: 贷款逾期预警数据集计算（Python版）
作    者: 李工   版本: v1.0   日期: 2024-01-26
"""
import logging
import sys
from datetime import datetime, timedelta
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, lit, coalesce, sum as _sum

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

def get_warn_level(overdue_days):
    """根据逾期天数确定预警等级"""
    if overdue_days >= 90:
        return '高'
    elif overdue_days >= 30:
        return '中'
    elif overdue_days >= 1:
        return '低'
    return None

def main(biz_date: str):
    logger.info(f"开始处理贷款逾期预警，业务日期: {biz_date}")
    spark = SparkSession.builder \\
        .appName("ads_risk_early_warn_daily") \\
        .config("spark.sql.shuffle.partitions", "200") \\
        .enableHiveSupport() \\
        .getOrCreate()

    # 读取明细数据
    loan_df = spark.sql(f"""
        SELECT loan_no, cust_id, loan_amt, loan_rate,
               overdue_days, risk_level, handler_id
        FROM dw_dwd.dwd_loan_detail_d
        WHERE data_date = '{biz_date}'
          AND loan_status != '已结清'
    """)

    # 计算预警等级
    from pyspark.sql.functions import udf
    from pyspark.sql.types import StringType
    warn_udf = udf(get_warn_level, StringType())

    result_df = loan_df.withColumn("warn_level", warn_udf(col("overdue_days"))) \\
        .filter(col("warn_level").isNotNull()) \\
        .withColumn("warn_reason", when(col("overdue_days") >= 90, "连续逾期超90天")
                    .when(col("overdue_days") >= 30, "逾期超30天")
                    .otherwise("初次逾期"))

    # 写入结果
    result_df.createOrReplaceTempView("risk_warn_tmp")
    spark.sql(f"""
        INSERT OVERWRITE TABLE dw_ads.ads_risk_early_warn
        PARTITION (data_date='{biz_date}')
        SELECT cust_id, loan_no, loan_amt, loan_rate,
               overdue_days, risk_level, warn_level, warn_reason,
               handler_id, current_timestamp() AS etl_timestamp
        FROM risk_warn_tmp
    """)

    count = result_df.count()
    logger.info(f"预警数据写入完成，共 {count} 条记录")
    spark.stop()

if __name__ == "__main__":
    biz_date = sys.argv[1] if len(sys.argv) > 1 else (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    main(biz_date)`,
      parseResult:{tables:['dw_dwd.dwd_loan_detail_d','dw_ads.ads_risk_early_warn'],operations:['READ','WRITE'],dependencies:['ads_risk_early_warn_daily依赖dwd_loan_detail_d']},
      versionHistory:[{v:'v1.0',date:'2024-01-26',author:'李工',change:'初始版本'}]
    },
    {
      id:'SCR-003', specId:'DS-001', scriptName:'ods_cust_info_extract', scriptType:'SQL',
      version:'v2.1', author:'王晓', status:'已部署',
      createDate:'2024-01-05', reviewDate:'2024-01-07', reviewComments:'',
      content:`-- ODS层客户信息全量抽取
INSERT OVERWRITE TABLE dw_ods.ods_cust_info PARTITION (data_date='${bizdate}')
SELECT
    cust_id, cust_name,
    CONCAT(SUBSTR(cert_no,1,6),'********',SUBSTR(cert_no,-4)) AS cert_no_mask,
    mobile_no, org_code, cust_tier, open_date, src_system, CURRENT_TIMESTAMP
FROM src_core.t_cust_info
WHERE update_time >= '${bizdate} 00:00:00';`,
      parseResult:{tables:['src_core.t_cust_info','dw_ods.ods_cust_info'],operations:['READ','WRITE'],dependencies:[]},
      versionHistory:[{v:'v2.0',date:'2024-01-01',author:'王晓',change:'新增脱敏处理'},{v:'v2.1',date:'2024-01-05',author:'王晓',change:'优化增量条件'}]
    }
  ],

  /* ─────────────────────── 部署 ─────────────────────── */
  deployments: [
    { id:'DEP-001', scriptId:'SCR-001', reqId:'REQ-2024-001', name:'零售客户资产日汇总宽表-上线', environments:['DEV','SIT','UAT','GRAY','PRD'], currentEnv:'PRD', status:'正式上线', grayPercent:100, testResults:{passed:48,failed:2,total:50,details:[]}, createDate:'2024-01-25', deployer:'刘运维' },
    { id:'DEP-002', scriptId:'SCR-002', reqId:'REQ-2024-002', name:'贷款逾期预警-灰度部署', environments:['DEV','SIT','UAT','GRAY'], currentEnv:'GRAY', status:'灰度测试中', grayPercent:20, testResults:{passed:35,failed:5,total:40,details:[]}, createDate:'2024-02-10', deployer:'张建国' },
    { id:'DEP-003', scriptId:'SCR-003', reqId:'REQ-2024-016', name:'机构KPI月度数据-上线', environments:['DEV','SIT','UAT','GRAY','PRD'], currentEnv:'PRD', status:'正式上线', grayPercent:100, testResults:{passed:30,failed:0,total:30,details:[]}, createDate:'2024-01-18', deployer:'刘运维' },
    { id:'DEP-004', scriptId:'SCR-001', reqId:'REQ-2024-007', name:'客户360画像优化-UAT测试', environments:['DEV','SIT','UAT'], currentEnv:'UAT', status:'测试中', grayPercent:0, testResults:{passed:22,failed:3,total:25,details:[]}, createDate:'2024-02-15', deployer:'孙瑞' },
    { id:'DEP-005', scriptId:'SCR-002', reqId:'REQ-2024-008', name:'同业负债结构分析-SIT测试', environments:['DEV','SIT'], currentEnv:'SIT', status:'测试中', grayPercent:0, testResults:{passed:18,failed:7,total:25,details:[]}, createDate:'2024-02-18', deployer:'周浩' }
  ],

  /* ─────────────────────── 质量规则 ─────────────────────── */
  qualityRules: [
    { id:'QR-001', ruleName:'客户号非空校验', ruleCode:'CHECK_CUST_ID_NOTNULL', ruleType:'非空校验', targetTable:'dw_dws.dws_cust_asset_d', targetField:'cust_id', sqlCondition:'cust_id IS NULL OR cust_id = \'\'', threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:100, lastRunTime:'2024-02-20 02:45:00', lastRunStatus:'通过' },
    { id:'QR-002', ruleName:'AUM金额非负校验', ruleCode:'CHECK_AUM_NONNEG', ruleType:'值域校验', targetTable:'dw_dws.dws_cust_asset_d', targetField:'aum_amt', sqlCondition:'aum_amt < 0', threshold:0, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:99.98, lastRunTime:'2024-02-20 02:45:00', lastRunStatus:'通过' },
    { id:'QR-003', ruleName:'客户号唯一性校验', ruleCode:'CHECK_CUST_ID_UNIQUE', ruleType:'唯一性校验', targetTable:'dw_dws.dws_cust_asset_d', targetField:'cust_id', sqlCondition:'COUNT(*) OVER(PARTITION BY cust_id, data_date) > 1', threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:100, lastRunTime:'2024-02-20 02:45:00', lastRunStatus:'通过' },
    { id:'QR-004', ruleName:'逾期天数非负校验', ruleCode:'CHECK_OVERDUE_NONNEG', ruleType:'值域校验', targetTable:'dw_dwd.dwd_loan_detail_d', targetField:'overdue_days', sqlCondition:'overdue_days < 0', threshold:0, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:100, lastRunTime:'2024-02-20 03:10:00', lastRunStatus:'通过' },
    { id:'QR-005', ruleName:'五级分类值域校验', ruleCode:'CHECK_RISK_LEVEL_ENUM', ruleType:'值域校验', targetTable:'dw_dwd.dwd_loan_detail_d', targetField:'risk_level', sqlCondition:"risk_level NOT IN ('正常','关注','次级','可疑','损失')", threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:99.5, lastRunTime:'2024-02-20 03:10:00', lastRunStatus:'通过' },
    { id:'QR-006', ruleName:'贷款金额正数校验', ruleCode:'CHECK_LOAN_AMT_POS', ruleType:'值域校验', targetTable:'dw_dwd.dwd_loan_detail_d', targetField:'loan_amt', sqlCondition:'loan_amt <= 0', threshold:0.01, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:100, lastRunTime:'2024-02-20 03:10:00', lastRunStatus:'通过' },
    { id:'QR-007', ruleName:'数据时效性校验', ruleCode:'CHECK_DATA_FRESHNESS', ruleType:'时效性校验', targetTable:'dw_ods.ods_cust_info', targetField:'update_time', sqlCondition:"update_time < CURRENT_DATE - INTERVAL '2' DAY", threshold:5, blockingLevel:'警告', enabled:true, priority:'P2', passRate:100, lastRunTime:'2024-02-20 06:00:00', lastRunStatus:'通过' },
    { id:'QR-008', ruleName:'账户余额完整性校验', ruleCode:'CHECK_BAL_COMPLETENESS', ruleType:'完整性校验', targetTable:'dw_dwd.dwd_deposit_detail_d', targetField:'bal_amt', sqlCondition:'bal_amt IS NULL', threshold:0.1, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:99.99, lastRunTime:'2024-02-20 03:30:00', lastRunStatus:'通过' },
    { id:'QR-009', ruleName:'证件号格式校验', ruleCode:'CHECK_CERT_FORMAT', ruleType:'格式校验', targetTable:'dw_ods.ods_cust_info', targetField:'cert_no', sqlCondition:"cert_no NOT REGEXP '^[A-Z0-9]{15,18}$'", threshold:0.5, blockingLevel:'警告', enabled:true, priority:'P2', passRate:99.2, lastRunTime:'2024-02-20 06:00:00', lastRunStatus:'通过' },
    { id:'QR-010', ruleName:'跨表客户信息一致性', ruleCode:'CHECK_CUST_CONSISTENCY', ruleType:'关联性校验', targetTable:'dw_dwd.dwd_cust_base_d', targetField:'cust_id', sqlCondition:'a.cust_id NOT IN (SELECT cust_id FROM dw_ods.ods_cust_info WHERE data_date=a.data_date)', threshold:0.01, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:99.97, lastRunTime:'2024-02-20 04:00:00', lastRunStatus:'通过' },
    { id:'QR-011', ruleName:'EAST报表字段完整性', ruleCode:'CHECK_EAST_COMPLETENESS', ruleType:'完整性校验', targetTable:'dw_ads.ads_east_quality_check', targetField:'*', sqlCondition:'mandatory_field_missing_count > 0', threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:100, lastRunTime:'2024-02-20 05:00:00', lastRunStatus:'通过' },
    { id:'QR-012', ruleName:'利率合理性校验', ruleCode:'CHECK_RATE_RANGE', ruleType:'值域校验', targetTable:'dw_dwd.dwd_loan_detail_d', targetField:'loan_rate', sqlCondition:'loan_rate < 0 OR loan_rate > 0.3', threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:100, lastRunTime:'2024-02-20 03:10:00', lastRunStatus:'通过' },
    { id:'QR-013', ruleName:'交易金额异常检测', ruleCode:'CHECK_TXN_ANOMALY', ruleType:'值域校验', targetTable:'dw_ods.ods_trans_detail', targetField:'txn_amt', sqlCondition:'ABS(txn_amt) > 100000000', threshold:0.1, blockingLevel:'警告', enabled:true, priority:'P2', passRate:100, lastRunTime:'2024-02-20 04:30:00', lastRunStatus:'通过' },
    { id:'QR-014', ruleName:'数据日期有效性', ruleCode:'CHECK_DATE_VALID', ruleType:'格式校验', targetTable:'dw_dws.dws_cust_asset_d', targetField:'data_date', sqlCondition:'data_date > CURRENT_DATE OR data_date < \'2020-01-01\'', threshold:0, blockingLevel:'硬阻断', enabled:true, priority:'P0', passRate:100, lastRunTime:'2024-02-20 02:45:00', lastRunStatus:'通过' },
    { id:'QR-015', ruleName:'AUM分项合计校验', ruleCode:'CHECK_AUM_SUM', ruleType:'关联性校验', targetTable:'dw_dws.dws_cust_asset_d', targetField:'aum_amt', sqlCondition:'ABS(aum_amt - dep_bal_amt - wm_bal_amt - fund_bal_amt - gold_bal_amt) > 0.01', threshold:0.01, blockingLevel:'软阻断', enabled:true, priority:'P1', passRate:99.98, lastRunTime:'2024-02-20 02:45:00', lastRunStatus:'警告' }
  ],

  /* ─────────────────────── 跑批作业 ─────────────────────── */
  batchJobs: [
    { id:'JOB-001', jobName:'ODS层全量数据抽取', jobCode:'ODS_FULL_EXTRACT', schedule:'每日', cronExpr:'0 0 1 * * ?', status:'成功', lastRunTime:'2024-02-20 01:00:00', nextRunTime:'2024-02-21 01:00:00', duration:'45分钟', dependsOn:[], targetTables:['dw_ods.ods_cust_info','dw_ods.ods_deposit_acct','dw_ods.ods_loan_contract','dw_ods.ods_trans_detail'], blockingRules:['QR-007'], alertThreshold:'失败立即告警' },
    { id:'JOB-002', jobName:'DWD层客户宽表加工', jobCode:'DWD_CUST_BASE', schedule:'每日', cronExpr:'0 0 2 * * ?', status:'成功', lastRunTime:'2024-02-20 02:00:00', nextRunTime:'2024-02-21 02:00:00', duration:'30分钟', dependsOn:['JOB-001'], targetTables:['dw_dwd.dwd_cust_base_d'], blockingRules:['QR-001','QR-003'], alertThreshold:'失败立即告警' },
    { id:'JOB-003', jobName:'DWD层贷款明细加工', jobCode:'DWD_LOAN_DETAIL', schedule:'每日', cronExpr:'0 30 2 * * ?', status:'成功', lastRunTime:'2024-02-20 02:30:00', nextRunTime:'2024-02-21 02:30:00', duration:'25分钟', dependsOn:['JOB-001'], targetTables:['dw_dwd.dwd_loan_detail_d'], blockingRules:['QR-004','QR-005','QR-006','QR-012'], alertThreshold:'失败立即告警' },
    { id:'JOB-004', jobName:'DWS客户资产汇总', jobCode:'DWS_CUST_ASSET', schedule:'每日', cronExpr:'0 0 3 * * ?', status:'成功', lastRunTime:'2024-02-20 03:00:00', nextRunTime:'2024-02-21 03:00:00', duration:'20分钟', dependsOn:['JOB-002','JOB-003'], targetTables:['dw_dws.dws_cust_asset_d'], blockingRules:['QR-001','QR-002','QR-015'], alertThreshold:'失败立即告警' },
    { id:'JOB-005', jobName:'ADS客户360画像更新', jobCode:'ADS_CUST_360', schedule:'每日', cronExpr:'0 0 4 * * ?', status:'运行中', lastRunTime:'2024-02-20 04:00:00', nextRunTime:'2024-02-21 04:00:00', duration:'90分钟', dependsOn:['JOB-004'], targetTables:['dw_ads.ads_cust_360'], blockingRules:['QR-001'], alertThreshold:'超时120分钟告警' },
    { id:'JOB-006', jobName:'ADS风险预警计算', jobCode:'ADS_RISK_WARN', schedule:'每日', cronExpr:'0 30 3 * * ?', status:'成功', lastRunTime:'2024-02-20 03:30:00', nextRunTime:'2024-02-21 03:30:00', duration:'15分钟', dependsOn:['JOB-003'], targetTables:['dw_ads.ads_risk_early_warn'], blockingRules:['QR-004','QR-005'], alertThreshold:'失败立即告警' },
    { id:'JOB-007', jobName:'EAST监管报表生成', jobCode:'ADS_EAST_REPORT', schedule:'每月', cronExpr:'0 0 6 L * ?', status:'等待', lastRunTime:'2024-01-31 06:00:00', nextRunTime:'2024-02-29 06:00:00', duration:'180分钟', dependsOn:['JOB-004'], targetTables:['dw_ads.ads_east_quality_check'], blockingRules:['QR-011'], alertThreshold:'失败立即告警' },
    { id:'JOB-008', jobName:'机构KPI月度汇总', jobCode:'DWS_BRANCH_KPI', schedule:'每月', cronExpr:'0 0 5 L * ?', status:'等待', lastRunTime:'2024-01-31 05:00:00', nextRunTime:'2024-02-29 05:00:00', duration:'60分钟', dependsOn:['JOB-004'], targetTables:['dw_dws.dws_branch_kpi_m'], blockingRules:[], alertThreshold:'失败立即告警' },
    { id:'JOB-009', jobName:'FTP资金转移定价计算', jobCode:'ADS_FTP_CALC', schedule:'每日', cronExpr:'0 0 5 * * ?', status:'阻断', lastRunTime:'2024-02-19 05:00:00', nextRunTime:'2024-02-20 05:00:00', duration:'-', dependsOn:['JOB-004'], targetTables:['dw_ads.ads_ftp_daily_calc'], blockingRules:['QR-002'], alertThreshold:'失败立即告警' },
    { id:'JOB-010', jobName:'元数据自动扫描', jobCode:'META_AUTO_SCAN', schedule:'每日', cronExpr:'0 0 7 * * ?', status:'成功', lastRunTime:'2024-02-20 07:00:00', nextRunTime:'2024-02-21 07:00:00', duration:'12分钟', dependsOn:[], targetTables:['所有数据库'], blockingRules:[], alertThreshold:'超时60分钟告警' },
    { id:'JOB-011', jobName:'普惠金融季度统计', jobCode:'ADS_INCL_FIN_Q', schedule:'每季', cronExpr:'0 0 8 L 3,6,9,12 ?', status:'等待', lastRunTime:'2023-12-31 08:00:00', nextRunTime:'2024-03-31 08:00:00', duration:'45分钟', dependsOn:['JOB-003'], targetTables:['dw_ads.ads_inclusive_finance_q'], blockingRules:[], alertThreshold:'失败立即告警' },
    { id:'JOB-012', jobName:'绿色金融统计', jobCode:'ADS_GREEN_FIN', schedule:'每月', cronExpr:'0 0 6 1 * ?', status:'等待', lastRunTime:'2024-02-01 06:00:00', nextRunTime:'2024-03-01 06:00:00', duration:'30分钟', dependsOn:['JOB-003'], targetTables:['dw_ads.ads_green_finance_stat'], blockingRules:[], alertThreshold:'失败立即告警' }
  ],

  /* ─────────────────────── 元数据 ─────────────────────── */
  metadataTables: [
    { id:'MT-001', dbName:'dw_ods', schemaName:'dw_ods', tableName:'ods_cust_info', tableType:'贴源表', chineseName:'客户基本信息ODS', description:'从核心银行系统每日全量抽取的客户基本信息', rowCount:8520000, storageSize:'3.2 GB', partitionKey:'data_date', owner:'张建国', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:12:00', createTime:'2022-06-01', columns:[{name:'cust_id',type:'VARCHAR(20)',comment:'客户号',nullable:false,sampleValues:['C202301000001']},{name:'cust_name',type:'VARCHAR(100)',comment:'客户姓名（脱敏）',nullable:false,sampleValues:['张**']},{name:'cert_no',type:'VARCHAR(50)',comment:'证件号码（加密）',nullable:false,sampleValues:['310***0012****']},{name:'org_code',type:'VARCHAR(12)',comment:'归属机构代码',nullable:false,sampleValues:['0101','0102001']},{name:'cust_tier',type:'VARCHAR(10)',comment:'客户等级',nullable:false,sampleValues:['金卡','白金']},{name:'data_date',type:'DATE',comment:'数据日期（分区键）',nullable:false,sampleValues:['2024-02-20']}] },
    { id:'MT-002', dbName:'dw_dwd', schemaName:'dw_dwd', tableName:'dwd_cust_base_d', tableType:'明细表', chineseName:'客户基础宽表（日快照）', description:'整合多源的客户宽表，包含客户基本属性、关系、标签', rowCount:8520000, storageSize:'8.5 GB', partitionKey:'data_date', owner:'张建国', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:15:00', createTime:'2022-06-15', columns:[{name:'cust_id',type:'VARCHAR(20)',comment:'客户号',nullable:false,sampleValues:['C202301000001']},{name:'cust_name_mask',type:'VARCHAR(100)',comment:'脱敏姓名',nullable:false,sampleValues:['张**']},{name:'cust_tier',type:'VARCHAR(10)',comment:'客户等级',nullable:false,sampleValues:['金卡']},{name:'aum_amt',type:'DECIMAL(20,2)',comment:'AUM总量',nullable:false,sampleValues:['258963.75']},{name:'retail_flag',type:'CHAR(1)',comment:'零售客户标识',nullable:false,sampleValues:['Y','N']},{name:'data_date',type:'DATE',comment:'数据日期（分区键）',nullable:false,sampleValues:['2024-02-20']}] },
    { id:'MT-003', dbName:'dw_dwd', schemaName:'dw_dwd', tableName:'dwd_loan_detail_d', tableType:'明细表', chineseName:'贷款明细宽表', description:'贷款合同及还款信息的明细加工宽表', rowCount:1250000, storageSize:'2.1 GB', partitionKey:'data_date', owner:'李工', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:16:00', createTime:'2022-07-01', columns:[{name:'loan_no',type:'VARCHAR(30)',comment:'贷款合同号',nullable:false,sampleValues:['20240101001001']},{name:'cust_id',type:'VARCHAR(20)',comment:'客户号',nullable:false,sampleValues:['C202301000001']},{name:'loan_amt',type:'DECIMAL(20,2)',comment:'贷款金额',nullable:false,sampleValues:['500000.00']},{name:'loan_rate',type:'DECIMAL(10,6)',comment:'年化利率',nullable:false,sampleValues:['0.043500']},{name:'overdue_days',type:'INTEGER',comment:'逾期天数',nullable:false,sampleValues:['0','15','90']},{name:'risk_level',type:'VARCHAR(10)',comment:'五级分类',nullable:false,sampleValues:['正常','关注']}] },
    { id:'MT-004', dbName:'dw_dws', schemaName:'dw_dws', tableName:'dws_cust_asset_d', tableType:'汇总表', chineseName:'零售客户资产日汇总', description:'以客户维度汇总的每日资产快照，AUM核心宽表', rowCount:6800000, storageSize:'4.3 GB', partitionKey:'data_date', owner:'张建国', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:18:00', createTime:'2022-08-01', columns:[{name:'cust_id',type:'VARCHAR(20)',comment:'客户号',nullable:false,sampleValues:['C202301000001']},{name:'dep_bal_amt',type:'DECIMAL(20,2)',comment:'存款余额',nullable:false,sampleValues:['100000.00']},{name:'wm_bal_amt',type:'DECIMAL(20,2)',comment:'理财余额',nullable:false,sampleValues:['200000.00']},{name:'aum_amt',type:'DECIMAL(20,2)',comment:'AUM总量',nullable:false,sampleValues:['350000.00']},{name:'data_date',type:'DATE',comment:'数据日期（分区键）',nullable:false,sampleValues:['2024-02-20']}] },
    { id:'MT-005', dbName:'dw_ads', schemaName:'dw_ads', tableName:'ads_cust_360', tableType:'应用表', chineseName:'客户360画像', description:'面向营销应用的客户综合画像宽表，含标签、属性、行为', rowCount:6500000, storageSize:'15.2 GB', partitionKey:'data_date', owner:'孙瑞', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:20:00', createTime:'2022-09-01', columns:[{name:'cust_id',type:'VARCHAR(20)',comment:'客户号',nullable:false,sampleValues:['C202301000001']},{name:'cust_tier',type:'VARCHAR(10)',comment:'等级',nullable:false,sampleValues:['金卡']},{name:'risk_appetite',type:'VARCHAR(10)',comment:'投资风险偏好',nullable:true,sampleValues:['稳健型','进取型']},{name:'life_stage',type:'VARCHAR(20)',comment:'生命周期阶段',nullable:true,sampleValues:['青年积累期','中年成长期']},{name:'aum_amt',type:'DECIMAL(20,2)',comment:'AUM',nullable:false,sampleValues:['350000.00']}] },
    { id:'MT-006', dbName:'dw_ads', schemaName:'dw_ads', tableName:'ads_risk_early_warn', tableType:'应用表', chineseName:'贷款逾期风险预警', description:'贷款逾期风险预警结果表，用于客户经理主动管控', rowCount:45000, storageSize:'0.2 GB', partitionKey:'data_date', owner:'李工', sensitivityLevel:'机密', lastScanned:'2024-02-20 07:21:00', createTime:'2024-01-28', columns:[{name:'loan_no',type:'VARCHAR(30)',comment:'贷款合同号',nullable:false,sampleValues:['20240101001001']},{name:'warn_level',type:'VARCHAR(10)',comment:'预警等级',nullable:false,sampleValues:['高','中','低']},{name:'warn_reason',type:'VARCHAR(500)',comment:'预警原因',nullable:false,sampleValues:['逾期超90天']}] }
  ],

  /* ─────────────────────── 扫描配置 ─────────────────────── */
  scanConfigs: [
    { id:'SC-001', name:'数仓全量扫描', targetDB:'dw_ods,dw_dwd,dw_dws,dw_ads', schedule:'每日', lastScan:'2024-02-20 07:00:00', nextScan:'2024-02-21 07:00:00', status:'成功', tablesScanned:89, changesFound:3, autoUpdate:true },
    { id:'SC-002', name:'核心业务库扫描', targetDB:'src_core', schedule:'每周', lastScan:'2024-02-19 22:00:00', nextScan:'2024-02-26 22:00:00', status:'成功', tablesScanned:156, changesFound:1, autoUpdate:false },
    { id:'SC-003', name:'贷款系统扫描', targetDB:'src_loan', schedule:'每日', lastScan:'2024-02-20 06:00:00', nextScan:'2024-02-21 06:00:00', status:'成功', tablesScanned:62, changesFound:0, autoUpdate:true },
    { id:'SC-004', name:'CRM系统扫描', targetDB:'src_crm', schedule:'每周', lastScan:'2024-02-18 23:00:00', nextScan:'2024-02-25 23:00:00', status:'警告', tablesScanned:45, changesFound:5, autoUpdate:false },
    { id:'SC-005', name:'风控系统扫描', targetDB:'src_risk', schedule:'每月', lastScan:'2024-02-01 00:00:00', nextScan:'2024-03-01 00:00:00', status:'成功', tablesScanned:38, changesFound:2, autoUpdate:true }
  ],

  /* ─────────────────────── 近期动态 ─────────────────────── */
  activities: [
    { id:'A-001', type:'approval', user:'张建国', content:'完成了 REQ-2024-005 的数据审核', time:'10分钟前', relatedId:'REQ-2024-005' },
    { id:'A-002', type:'deploy',   user:'刘运维', content:'REQ-2024-002 贷款逾期预警灰度扩量至20%', time:'1小时前', relatedId:'DEP-002' },
    { id:'A-003', type:'reject',   user:'刘晓宇', content:'驳回了 REQ-2024-013 的技术审核，性能问题', time:'2小时前', relatedId:'REQ-2024-013' },
    { id:'A-004', type:'submit',   user:'方立',   content:'提交了新需求：绿色金融贷款余额统计', time:'3小时前', relatedId:'REQ-2024-020' },
    { id:'A-005', type:'quality',  user:'系统',   content:'QR-015 AUM分项合计校验触发警告，通过率99.98%', time:'4小时前', relatedId:'QR-015' },
    { id:'A-006', type:'block',    user:'系统',   content:'JOB-009 FTP定价计算因质量规则触发阻断', time:'5小时前', relatedId:'JOB-009' },
    { id:'A-007', type:'scan',     user:'系统',   content:'元数据自动扫描完成，发现3处表结构变更', time:'7小时前', relatedId:'SC-001' },
    { id:'A-008', type:'submit',   user:'魏刚',   content:'脚本 ads_mortgage_churn_warn_v1.0 提交复核', time:'8小时前', relatedId:'SCR-002' },
    { id:'A-009', type:'approval', user:'张合规', content:'完成了 REQ-2024-019 的合规审核', time:'昨天', relatedId:'REQ-2024-019' },
    { id:'A-010', type:'deploy',   user:'张建国', content:'REQ-2024-008 同业负债分析进入SIT测试', time:'昨天', relatedId:'DEP-005' },
    { id:'A-011', type:'standard', user:'王治理', content:'新增数据标准：绿色贷款标识(STD-021)', time:'2天前', relatedId:'STD-021' },
    { id:'A-012', type:'submit',   user:'石磊',   content:'提交了新需求：代发工资客户转化分析', time:'2天前', relatedId:'REQ-2024-017' },
    { id:'A-013', type:'quality',  user:'系统',   content:'每日质量巡检完成，综合质量得分 92.3%', time:'2天前', relatedId:null },
    { id:'A-014', type:'spec',     user:'张建国', content:'完成了 SPEC-ADS-001 贷款预警规范编写', time:'3天前', relatedId:'DS-002' },
    { id:'A-015', type:'approval', user:'刘晓宇', content:'技术审核通过：REQ-2024-019 房贷客户流失预警', time:'3天前', relatedId:'REQ-2024-019' }
  ],

  /* ─────────────────────── 系统通知 ─────────────────────── */
  notifications: [
    { id:'N-001', type:'error',   title:'跑批阻断告警', content:'JOB-009 FTP定价计算因QR-002质量规则触发硬阻断，请及时处理', time:'05:15', read:false },
    { id:'N-002', type:'warning', title:'数据质量预警', content:'QR-015 AUM分项合计校验通过率99.98%，低于100%阈值，已生成异常记录', time:'03:00', read:false },
    { id:'N-003', type:'info',    title:'待您审核', content:'REQ-2024-005 网点客户行为分析需要您进行数据审核，请及时处理', time:'09:30', read:false },
    { id:'N-004', type:'info',    title:'待您审核', content:'REQ-2024-018 供应链金融核心企业数据集需要您进行数据审核', time:'昨天 16:20', read:false },
    { id:'N-005', type:'success', title:'部署成功', content:'REQ-2024-001 零售客户资产日汇总宽表已成功上线生产环境', time:'昨天 11:00', read:true },
    { id:'N-006', type:'warning', title:'SIT测试失败', content:'DEP-005 同业负债分析SIT测试有7个用例失败，请检查脚本逻辑', time:'昨天 15:30', read:false },
    { id:'N-007', type:'info',    title:'元数据变更', content:'自动扫描发现dw_ods.ods_cust_info新增字段cust_segment，请确认更新', time:'今天 07:12', read:true },
    { id:'N-008', type:'error',   title:'需求审核驳回', content:'REQ-2024-013 BCBS239合规报告已被技术审核驳回，原因：ETL性能问题', time:'2天前 17:30', read:true }
  ]
};
