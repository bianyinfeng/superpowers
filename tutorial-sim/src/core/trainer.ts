/**
 * 模型训练仿真引擎
 * 在浏览器端模拟神经网络训练过程
 */

export interface DataPoint {
  features: number[];
  label: number;
}

export interface TrainingConfig {
  learningRate: number;
  epochs: number;
  batchSize: number;
  hiddenSize: number;
  activation: 'relu' | 'sigmoid' | 'tanh';
}

export interface TrainingMetrics {
  epoch: number;
  trainLoss: number;
  trainAccuracy: number;
  valLoss: number;
  valAccuracy: number;
}

export interface ModelWeights {
  w1: number[][];
  b1: number[];
  w2: number[][];
  b2: number[];
}

// 激活函数
function relu(x: number): number { return Math.max(0, x); }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-Math.min(Math.max(x, -500), 500))); }
function tanhActivation(x: number): number { return Math.tanh(x); }

function getActivation(name: string): (x: number) => number {
  switch (name) {
    case 'relu': return relu;
    case 'sigmoid': return sigmoid;
    case 'tanh': return tanhActivation;
    default: return relu;
  }
}

function getActivationDerivative(name: string): (x: number) => number {
  switch (name) {
    case 'relu': return (x: number) => x > 0 ? 1 : 0;
    case 'sigmoid': return (x: number) => { const s = sigmoid(x); return s * (1 - s); };
    case 'tanh': return (x: number) => { const t = Math.tanh(x); return 1 - t * t; };
    default: return (x: number) => x > 0 ? 1 : 0;
  }
}

/** 简单两层全连接神经网络 */
export class SimpleNN {
  private weights: ModelWeights;
  private config: TrainingConfig;
  private inputSize: number;
  private numClasses: number;

  constructor(inputSize: number, numClasses: number, config: TrainingConfig) {
    this.inputSize = inputSize;
    this.numClasses = numClasses;
    this.config = config;

    // Xavier 初始化
    const scale1 = Math.sqrt(2.0 / (inputSize + config.hiddenSize));
    const scale2 = Math.sqrt(2.0 / (config.hiddenSize + numClasses));

    this.weights = {
      w1: Array.from({ length: inputSize }, () =>
        Array.from({ length: config.hiddenSize }, () => (Math.random() - 0.5) * 2 * scale1)
      ),
      b1: new Array(config.hiddenSize).fill(0),
      w2: Array.from({ length: config.hiddenSize }, () =>
        Array.from({ length: numClasses }, () => (Math.random() - 0.5) * 2 * scale2)
      ),
      b2: new Array(numClasses).fill(0),
    };
  }

  getWeights(): ModelWeights {
    return JSON.parse(JSON.stringify(this.weights));
  }

  /** 前向传播 */
  forward(input: number[]): { hidden: number[]; preHidden: number[]; output: number[] } {
    const act = getActivation(this.config.activation);

    // 隐藏层
    const preHidden = new Array(this.config.hiddenSize).fill(0);
    for (let j = 0; j < this.config.hiddenSize; j++) {
      let sum = this.weights.b1[j];
      for (let i = 0; i < this.inputSize; i++) {
        sum += input[i] * this.weights.w1[i][j];
      }
      preHidden[j] = sum;
    }
    const hidden = preHidden.map(act);

    // 输出层 (softmax)
    const logits = new Array(this.numClasses).fill(0);
    for (let j = 0; j < this.numClasses; j++) {
      let sum = this.weights.b2[j];
      for (let i = 0; i < this.config.hiddenSize; i++) {
        sum += hidden[i] * this.weights.w2[i][j];
      }
      logits[j] = sum;
    }

    // Softmax
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const output = expLogits.map(e => e / sumExp);

    return { hidden, preHidden, output };
  }

  /** 预测 */
  predict(input: number[]): number {
    const { output } = this.forward(input);
    return output.indexOf(Math.max(...output));
  }

  /** 训练一个 batch */
  private trainBatch(batch: DataPoint[]): number {
    const actDeriv = getActivationDerivative(this.config.activation);
    const act = getActivation(this.config.activation);
    let totalLoss = 0;

    // 梯度累积
    const dw1 = Array.from({ length: this.inputSize }, () => new Array(this.config.hiddenSize).fill(0));
    const db1 = new Array(this.config.hiddenSize).fill(0);
    const dw2 = Array.from({ length: this.config.hiddenSize }, () => new Array(this.numClasses).fill(0));
    const db2 = new Array(this.numClasses).fill(0);

    for (const point of batch) {
      const { hidden, preHidden, output } = this.forward(point.features);

      // 交叉熵损失
      totalLoss -= Math.log(Math.max(output[point.label], 1e-10));

      // 输出层梯度
      const dOutput = output.map((o, i) => o - (i === point.label ? 1 : 0));

      // 反向传播到 w2, b2
      for (let i = 0; i < this.config.hiddenSize; i++) {
        for (let j = 0; j < this.numClasses; j++) {
          dw2[i][j] += hidden[i] * dOutput[j];
        }
      }
      for (let j = 0; j < this.numClasses; j++) {
        db2[j] += dOutput[j];
      }

      // 反向传播到隐藏层
      const dHidden = new Array(this.config.hiddenSize).fill(0);
      for (let i = 0; i < this.config.hiddenSize; i++) {
        for (let j = 0; j < this.numClasses; j++) {
          dHidden[i] += this.weights.w2[i][j] * dOutput[j];
        }
        dHidden[i] *= actDeriv(preHidden[i]);
      }

      // 反向传播到 w1, b1
      for (let i = 0; i < this.inputSize; i++) {
        for (let j = 0; j < this.config.hiddenSize; j++) {
          dw1[i][j] += point.features[i] * dHidden[j];
        }
      }
      for (let j = 0; j < this.config.hiddenSize; j++) {
        db1[j] += dHidden[j];
      }
    }

    // 更新权重
    const lr = this.config.learningRate / batch.length;
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.config.hiddenSize; j++) {
        this.weights.w1[i][j] -= lr * dw1[i][j];
      }
    }
    for (let j = 0; j < this.config.hiddenSize; j++) {
      this.weights.b1[j] -= lr * db1[j];
    }
    for (let i = 0; i < this.config.hiddenSize; i++) {
      for (let j = 0; j < this.numClasses; j++) {
        this.weights.w2[i][j] -= lr * dw2[i][j];
      }
    }
    for (let j = 0; j < this.numClasses; j++) {
      this.weights.b2[j] -= lr * db2[j];
    }

    void act; // referenced via getActivation
    return totalLoss / batch.length;
  }

  /** 评估数据集 */
  evaluate(data: DataPoint[]): { loss: number; accuracy: number } {
    if (data.length === 0) return { loss: 0, accuracy: 0 };
    let totalLoss = 0;
    let correct = 0;
    for (const point of data) {
      const { output } = this.forward(point.features);
      totalLoss -= Math.log(Math.max(output[point.label], 1e-10));
      const predicted = output.indexOf(Math.max(...output));
      if (predicted === point.label) correct++;
    }
    return {
      loss: totalLoss / data.length,
      accuracy: correct / data.length,
    };
  }

  /** 训练一个 epoch，返回指标 */
  trainEpoch(trainData: DataPoint[], valData: DataPoint[], epochNum: number): TrainingMetrics {
    // 打乱训练数据
    const shuffled = [...trainData].sort(() => Math.random() - 0.5);

    // 按 batch 训练
    for (let i = 0; i < shuffled.length; i += this.config.batchSize) {
      const batch = shuffled.slice(i, i + this.config.batchSize);
      this.trainBatch(batch);
    }

    const trainMetrics = this.evaluate(trainData);
    const valMetrics = this.evaluate(valData);

    return {
      epoch: epochNum,
      trainLoss: trainMetrics.loss,
      trainAccuracy: trainMetrics.accuracy,
      valLoss: valMetrics.loss,
      valAccuracy: valMetrics.accuracy,
    };
  }
}

/** 数据集划分 */
export function splitDataset(
  data: DataPoint[],
  trainRatio: number = 0.7,
  valRatio: number = 0.15
): { train: DataPoint[]; val: DataPoint[]; test: DataPoint[] } {
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  const trainEnd = Math.floor(shuffled.length * trainRatio);
  const valEnd = Math.floor(shuffled.length * (trainRatio + valRatio));
  return {
    train: shuffled.slice(0, trainEnd),
    val: shuffled.slice(trainEnd, valEnd),
    test: shuffled.slice(valEnd),
  };
}

/** 生成合成分类数据集 */
export function generateSyntheticData(
  numSamples: number,
  numFeatures: number,
  numClasses: number
): DataPoint[] {
  const data: DataPoint[] = [];
  // 为每个类别生成一个中心点
  const centers = Array.from({ length: numClasses }, () =>
    Array.from({ length: numFeatures }, () => (Math.random() - 0.5) * 4)
  );

  for (let i = 0; i < numSamples; i++) {
    const label = i % numClasses;
    const features = centers[label].map(c => c + (Math.random() - 0.5) * 2);
    data.push({ features, label });
  }
  return data;
}
