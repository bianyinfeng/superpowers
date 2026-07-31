import React, { useState, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  SimpleNN,
  generateSyntheticData,
  splitDataset,
} from '../../core/trainer';
import type { TrainingConfig, TrainingMetrics } from '../../core/trainer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const defaultConfig: TrainingConfig = {
  learningRate: 0.1,
  epochs: 50,
  batchSize: 16,
  hiddenSize: 16,
  activation: 'relu',
};

export const TrainingPanel: React.FC = () => {
  const [config, setConfig] = useState<TrainingConfig>({ ...defaultConfig });
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [datasetSize, setDatasetSize] = useState(200);
  const [numFeatures, setNumFeatures] = useState(8);
  const [numClasses, setNumClasses] = useState(3);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [datasetInfo, setDatasetInfo] = useState<{
    train: number; val: number; test: number;
  } | null>(null);
  const [testResult, setTestResult] = useState<{ loss: number; accuracy: number } | null>(null);
  const stopRef = useRef(false);

  const handleTrain = useCallback(async () => {
    setIsTraining(true);
    setMetrics([]);
    setTestResult(null);
    stopRef.current = false;

    const data = generateSyntheticData(datasetSize, numFeatures, numClasses);
    const { train, val, test } = splitDataset(data, 0.7, 0.15);
    setDatasetInfo({ train: train.length, val: val.length, test: test.length });

    const model = new SimpleNN(numFeatures, numClasses, config);
    const allMetrics: TrainingMetrics[] = [];

    for (let epoch = 0; epoch < config.epochs; epoch++) {
      if (stopRef.current) break;

      const m = model.trainEpoch(train, val, epoch + 1);
      allMetrics.push(m);
      setMetrics([...allMetrics]);
      setCurrentEpoch(epoch + 1);

      // 让 UI 有时间更新
      await new Promise(r => setTimeout(r, 50));
    }

    // 测试集评估
    const testMetrics = model.evaluate(test);
    setTestResult(testMetrics);
    setIsTraining(false);
  }, [config, datasetSize, numFeatures, numClasses]);

  const handleStop = () => {
    stopRef.current = true;
  };

  const chartData = {
    labels: metrics.map(m => m.epoch.toString()),
    datasets: [
      {
        label: '训练损失',
        data: metrics.map(m => m.trainLoss),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
      {
        label: '验证损失',
        data: metrics.map(m => m.valLoss),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const accChartData = {
    labels: metrics.map(m => m.epoch.toString()),
    datasets: [
      {
        label: '训练准确率',
        data: metrics.map(m => m.trainAccuracy * 100),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
      },
      {
        label: '验证准确率',
        data: metrics.map(m => m.valAccuracy * 100),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderDash: [5, 5],
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { x: { title: { display: true, text: 'Epoch' } } },
    animation: { duration: 0 },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧠 模型训练模拟器</h2>
      <p style={styles.desc}>
        使用浏览器内的简易神经网络，体验完整的训练流程
      </p>

      {/* 数据集配置 */}
      <div style={styles.section}>
        <h3>📊 数据集配置</h3>
        <div style={styles.paramGrid}>
          <label style={styles.paramLabel}>
            样本数量
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={datasetSize}
              onChange={e => setDatasetSize(Number(e.target.value))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{datasetSize}</span>
          </label>
          <label style={styles.paramLabel}>
            特征维度
            <input
              type="range"
              min="2"
              max="32"
              step="2"
              value={numFeatures}
              onChange={e => setNumFeatures(Number(e.target.value))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{numFeatures}</span>
          </label>
          <label style={styles.paramLabel}>
            类别数
            <input
              type="range"
              min="2"
              max="10"
              value={numClasses}
              onChange={e => setNumClasses(Number(e.target.value))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{numClasses}</span>
          </label>
        </div>
        {datasetInfo && (
          <div style={styles.datasetBar}>
            <div style={{ ...styles.datasetSegment, flex: datasetInfo.train, background: '#4f46e5' }}>
              训练集 {datasetInfo.train}
            </div>
            <div style={{ ...styles.datasetSegment, flex: datasetInfo.val, background: '#06b6d4' }}>
              验证集 {datasetInfo.val}
            </div>
            <div style={{ ...styles.datasetSegment, flex: datasetInfo.test, background: '#f97316' }}>
              测试集 {datasetInfo.test}
            </div>
          </div>
        )}
      </div>

      {/* 超参数配置 */}
      <div style={styles.section}>
        <h3>⚙️ 超参数设置</h3>
        <div style={styles.paramGrid}>
          <label style={styles.paramLabel}>
            学习率
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={config.learningRate}
              onChange={e => setConfig(c => ({ ...c, learningRate: Number(e.target.value) }))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{config.learningRate.toFixed(3)}</span>
          </label>
          <label style={styles.paramLabel}>
            训练轮次 (Epochs)
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={config.epochs}
              onChange={e => setConfig(c => ({ ...c, epochs: Number(e.target.value) }))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{config.epochs}</span>
          </label>
          <label style={styles.paramLabel}>
            批次大小 (Batch Size)
            <input
              type="range"
              min="4"
              max="64"
              step="4"
              value={config.batchSize}
              onChange={e => setConfig(c => ({ ...c, batchSize: Number(e.target.value) }))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{config.batchSize}</span>
          </label>
          <label style={styles.paramLabel}>
            隐藏层大小
            <input
              type="range"
              min="4"
              max="64"
              step="4"
              value={config.hiddenSize}
              onChange={e => setConfig(c => ({ ...c, hiddenSize: Number(e.target.value) }))}
              disabled={isTraining}
            />
            <span style={styles.paramValue}>{config.hiddenSize}</span>
          </label>
          <label style={styles.paramLabel}>
            激活函数
            <select
              value={config.activation}
              onChange={e => setConfig(c => ({ ...c, activation: e.target.value as TrainingConfig['activation'] }))}
              disabled={isTraining}
              style={styles.select}
            >
              <option value="relu">ReLU</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </label>
        </div>
      </div>

      {/* 训练控制 */}
      <div style={styles.section}>
        <div style={styles.inputRow}>
          {!isTraining ? (
            <button style={styles.btn} onClick={handleTrain}>🚀 开始训练</button>
          ) : (
            <button style={styles.btnDanger} onClick={handleStop}>⏹ 停止训练</button>
          )}
          {isTraining && (
            <span style={styles.progress}>
              训练中... Epoch {currentEpoch}/{config.epochs}
            </span>
          )}
        </div>
      </div>

      {/* 训练曲线 */}
      {metrics.length > 0 && (
        <>
          <div style={styles.section}>
            <h3>📉 损失曲线</h3>
            <Line data={chartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { title: { display: true, text: 'Loss' } } } }} />
          </div>
          <div style={styles.section}>
            <h3>📈 准确率曲线</h3>
            <Line data={accChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { title: { display: true, text: '准确率 (%)' }, min: 0, max: 100 } } }} />
          </div>
        </>
      )}

      {/* 测试结果 */}
      {testResult && (
        <div style={styles.section}>
          <h3>🎯 测试集评估结果</h3>
          <div style={styles.resultGrid}>
            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>测试损失</div>
              <div style={styles.resultValue}>{testResult.loss.toFixed(4)}</div>
            </div>
            <div style={styles.resultCard}>
              <div style={styles.resultLabel}>测试准确率</div>
              <div style={{ ...styles.resultValue, color: testResult.accuracy > 0.8 ? '#059669' : testResult.accuracy > 0.5 ? '#f97316' : '#ef4444' }}>
                {(testResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 学习要点 */}
      <div style={styles.section}>
        <h3>💡 学习要点</h3>
        <ul style={styles.learnList}>
          <li><strong>学习率</strong>：太大会震荡，太小会收敛慢。试试调到 0.5 或 0.001 看看效果</li>
          <li><strong>过拟合</strong>：当训练准确率远高于验证准确率时，说明模型记住了数据而非学到了规律</li>
          <li><strong>批次大小</strong>：小批次噪声大但泛化好，大批次稳定但可能陷入局部最优</li>
          <li><strong>隐藏层大小</strong>：太小学不到复杂模式，太大容易过拟合</li>
        </ul>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px' },
  title: { margin: '0 0 8px', fontSize: '24px' },
  desc: { color: '#666', marginBottom: '20px' },
  section: { marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' },
  inputRow: { display: 'flex', gap: '12px', alignItems: 'center' },
  btn: {
    padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
  },
  btnDanger: {
    padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
  },
  paramGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' },
  paramLabel: {
    display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: '500',
  },
  paramValue: { fontFamily: 'monospace', color: '#4f46e5', fontWeight: 'bold' },
  select: { padding: '6px', borderRadius: '4px', border: '1px solid #ddd' },
  progress: { color: '#4f46e5', fontWeight: 'bold', fontSize: '14px' },
  datasetBar: {
    display: 'flex', borderRadius: '8px', overflow: 'hidden', marginTop: '12px', height: '32px',
  },
  datasetSegment: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '12px', fontWeight: 'bold',
  },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  resultCard: {
    padding: '20px', background: 'white', borderRadius: '8px', textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  resultLabel: { color: '#6b7280', fontSize: '14px', marginBottom: '8px' },
  resultValue: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937' },
  learnList: { lineHeight: '1.8', paddingLeft: '20px' },
};
