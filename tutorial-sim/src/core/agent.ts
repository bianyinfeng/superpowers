/**
 * Agent 仿真引擎
 * 模拟 Agent 的感知-思考-行动循环
 */

export interface AgentMessage {
  role: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  timestamp: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  execute: (args: string) => string;
}

export interface AgentConfig {
  systemPrompt: string;
  tools: ToolDefinition[];
  temperature: number;
  maxTurns: number;
}

/**
 * 简单的基于规则的 Agent 模拟器
 * 用于教学目的，展示 Agent 的工作原理
 */
export class SimulatedAgent {
  private config: AgentConfig;
  private history: AgentMessage[] = [];
  private turnCount = 0;

  constructor(config: AgentConfig) {
    this.config = config;
    this.history.push({
      role: 'system',
      content: config.systemPrompt,
      timestamp: Date.now(),
    });
  }

  getHistory(): AgentMessage[] {
    return [...this.history];
  }

  getTools(): ToolDefinition[] {
    return this.config.tools;
  }

  /** 处理用户输入 */
  async processInput(input: string): Promise<AgentMessage[]> {
    const newMessages: AgentMessage[] = [];

    this.history.push({
      role: 'user',
      content: input,
      timestamp: Date.now(),
    });
    newMessages.push(this.history[this.history.length - 1]);

    // 检查是否需要使用工具
    const toolMatch = this.detectToolNeed(input);
    if (toolMatch) {
      const toolMsg: AgentMessage = {
        role: 'tool',
        content: `[调用工具: ${toolMatch.name}]\n输入: ${toolMatch.args}\n输出: ${toolMatch.result}`,
        timestamp: Date.now(),
      };
      this.history.push(toolMsg);
      newMessages.push(toolMsg);
    }

    // 生成回复
    const response = this.generateResponse(input, toolMatch?.result);
    const agentMsg: AgentMessage = {
      role: 'agent',
      content: response,
      timestamp: Date.now(),
    };
    this.history.push(agentMsg);
    newMessages.push(agentMsg);

    this.turnCount++;
    return newMessages;
  }

  private detectToolNeed(input: string): { name: string; args: string; result: string } | null {
    const lowerInput = input.toLowerCase();

    for (const tool of this.config.tools) {
      const keywords = tool.name.toLowerCase().split('_');
      if (keywords.some(kw => lowerInput.includes(kw))) {
        const result = tool.execute(input);
        return { name: tool.name, args: input, result };
      }
    }
    return null;
  }

  private generateResponse(input: string, toolResult?: string): string {
    if (toolResult) {
      return `根据工具的执行结果，我可以告诉你：\n\n${toolResult}\n\n还有什么我可以帮助你的吗？`;
    }

    // 简单的关键词匹配响应
    const responses: { keywords: string[]; response: string }[] = [
      {
        keywords: ['你好', '嗨', 'hello', 'hi'],
        response: '你好！我是 AI 助手。我可以帮你处理各种任务，包括搜索信息、计算和回答问题。请问有什么可以帮助你的？',
      },
      {
        keywords: ['帮助', '帮忙', 'help'],
        response: `我目前配备了以下工具：\n${this.config.tools.map(t => `- **${t.name}**: ${t.description}`).join('\n')}\n\n你可以让我使用这些工具来帮你完成任务。`,
      },
      {
        keywords: ['什么', '怎么', '如何', 'what', 'how'],
        response: '这是一个很好的问题！让我思考一下...\n\n作为一个 AI Agent，我会通过以下步骤来处理：\n1. 🔍 分析你的问题\n2. 🛠️ 选择合适的工具\n3. 📊 执行并返回结果\n\n请提供更多具体信息，我会尽力帮助你。',
      },
    ];

    for (const r of responses) {
      if (r.keywords.some(kw => input.toLowerCase().includes(kw))) {
        return r.response;
      }
    }

    return `我收到了你的消息："${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"\n\n让我来处理这个请求。作为一个模拟 Agent，我的工作流程是：\n1. 感知（接收输入）✅\n2. 思考（分析意图）✅\n3. 行动（选择工具或直接回答）✅\n\n这就是 Agent 的核心循环！`;
  }

  reset(): void {
    this.history = [{
      role: 'system',
      content: this.config.systemPrompt,
      timestamp: Date.now(),
    }];
    this.turnCount = 0;
  }
}

/** 预设的示例工具 */
export const defaultTools: ToolDefinition[] = [
  {
    name: 'search',
    description: '搜索知识库中的相关信息',
    execute: (query: string) => {
      const results = [
        '大语言模型 (LLM) 是基于 Transformer 架构的深度学习模型。',
        '向量数据库用于存储和检索高维向量数据，支持相似性搜索。',
        'RAG (检索增强生成) 结合了检索系统和生成模型的优势。',
        'Agent 是能够自主完成任务的 AI 系统，具备工具调用能力。',
      ];
      const relevant = results.filter(r =>
        query.split('').some(c => r.includes(c))
      );
      return relevant.length > 0 ? relevant.slice(0, 2).join('\n') : '未找到相关结果。';
    },
  },
  {
    name: 'calculate',
    description: '执行数学计算',
    execute: (expr: string) => {
      const numbers = expr.match(/\d+(\.\d+)?/g);
      if (!numbers) return '无法解析计算表达式';
      const nums = numbers.map(Number);
      return `找到的数值: ${nums.join(', ')}，总和: ${nums.reduce((a, b) => a + b, 0)}`;
    },
  },
  {
    name: 'analyze',
    description: '分析文本的情感和关键词',
    execute: (text: string) => {
      const positiveWords = ['好', '棒', '优秀', '喜欢', '开心', 'good', 'great', 'nice'];
      const negativeWords = ['差', '坏', '糟糕', '讨厌', '难过', 'bad', 'poor', 'terrible'];
      const pos = positiveWords.filter(w => text.includes(w)).length;
      const neg = negativeWords.filter(w => text.includes(w)).length;
      const sentiment = pos > neg ? '积极 😊' : neg > pos ? '消极 😞' : '中性 😐';
      return `情感分析结果: ${sentiment}\n关键词数量: 正面${pos}个, 负面${neg}个`;
    },
  },
];
