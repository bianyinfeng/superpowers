import React, { useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { SimpleNN, generateSyntheticData, splitDataset } from '../../core/trainer';
import type { TrainingConfig } from '../../core/trainer';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface ModelResult {
  name: string;
  config: TrainingConfig;
  testAccuracy: number;
  testLoss: number;
  trainAccuracy: number;
  trainLoss: number;
  trainingTime: number;
  epochs: number;
}

const presets: { name: string; config: TrainingConfig }[] = [
  {
    name: '模型 A：小学习率',
    config: { learningRate: 0.01, epochs: 50, batchSize: 16, hiddenSize: 16, activation: 'relu' },
  },
  {
    name: '模型 B：大学习率',
    config: { learningRate: 0.5, epochs: 50, batchSize: 16, hiddenSize: 16, activation: 'relu' },
  },
  {
    name: '模型 C：大隐藏层',
    config: { learningRate: 0.1, epochs: 50, batchSize: 16, hiddenSize: 64, activation: 'relu' },
  },
  {
    name: '模型 D：Sigmoid',
    config: { learningRate: 0.1, epochs: 50, batchSize: 16, hiddenSize: 16, activation: 'sigmoid' },
  },
];

export const ComparisonPanel: React.FC = () => {
  const [results, setResults] = useState<ModelResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState('');

  const runComparison = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const data = generateSyntheticData(300, 8, 3);
    const { train, val, test } = splitDataset(data, 0.7, 0.15);
    const newResults: ModelResult[] = [];

    for (const preset of presets) {
      setProgress(`正在训练 ${preset.name}...`);
      await new Promise(r => setTimeout(r, 100));

      const start = performance.now();
      const model = new SimpleNN(8, 3, preset.config);

      for (let epoch = 0; epoch < preset.config.epochs; epoch++) {
        model.trainEpoch(train, val, epoch + 1);
      }

      const trainMetrics = model.evaluate(train);
      const testMetrics = model.evaluate(test);
      const elapsed = performance.now() - start;

      newResults.push({
        name: preset.name,
        config: preset.config,
        testAccuracy: testMetrics.accuracy,
        testLoss: testMetrics.loss,
        trainAccuracy: trainMetrics.accuracy,
        trainLoss: trainMetrics.loss,
        trainingTime: elapsed,
        epochs: preset.config.epochs,
      });

      setResults([...newResults]);
      await new Promise(r => setTimeout(r, 50));
    }

    setProgress('');
    setIsRunning(false);
  }, []);

  const radarData = {
    labels: ['测试准确率', '训练准确率', '收敛速度', '泛化能力', '稳定性'],
    datasets: results.map((r, i) => ({
      label: r.name,
      data: [
        r.testAccuracy * 100,
        r.trainAccuracy * 100,
        Math.max(0, 100 - r.trainingTime / 10),
        Math.max(0, 100 - Math.abs(r.trainAccuracy - r.testAccuracy) * 200),
        Math.max(0, 100 - r.testLoss * 20),
      ],
      borderColor: [`#4f46e5`, `#ef4444`, `#059669`, `#f97316`][i],
      backgroundColor: [
        `rgba(79, 70, 229, 0.1)`,
        `rgba(239, 68, 68, 0.1)`,
        `rgba(5, 150, 105, 0.1)`,
        `rgba(249, 115, 22, 0.1)`,
      ][i],
    })),
  };

  const barData = {
    labels: results.map(r => r.name),
    datasets: [
      {
        label: '测试准确率 (%)',
        data: results.map(r => r.testAccuracy * 100),
        backgroundColor: results.map((_, i) =>
          [`#4f46e5`, `#ef4444`, `#059669`, `#f97316`][i]
        ),
      },
    ],
  };

  const bestModel = results.length > 0
    ? results.reduce((a, b) => a.testAccuracy > b.testAccuracy ? a : b)
    : null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 模型对比仪表盘</h2>
      <p style={styles.desc}>
        同时训练多个配置不同的模型，比较它们的性能差异
      </p>

      <div style={styles.section}>
        <h3>预设模型配置</h3>
        <div style={styles.presetGrid}>
          {presets.map((p, i) => (
            <div key={i} style={styles.presetCard}>
              <div style={styles.presetName}>{p.name}</div>
              <div style={styles.presetDetail}>学习率: {p.config.learningRate}</div>
              <div style={styles.presetDetail}>隐藏层: {p.config.hiddenSize}</div>
              <div style={styles.presetDetail}>激活函数: {p.config.activation}</div>
            </div>
          ))}
        </div>
        <button
          style={styles.btn}
          onClick={runComparison}
          disabled={isRunning}
        >
          {isRunning ? '⏳ 对比中...' : '🚀 开始对比实验'}
        </button>
        {progress && <span style={styles.progress}>{progress}</span>}
      </div>

      {results.length > 0 && (
        <>
          {/* 结果表格 */}
          <div style={styles.section}>
            <h3>📋 对比结果</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>模型</th>
                    <th style={styles.th}>训练准确率</th>
                    <th style={styles.th}>测试准确率</th>
                    <th style={styles.th}>测试损失</th>
                    <th style={styles.th}>训练耗时</th>
                    <th style={styles.th}>过拟合程度</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} style={r === bestModel ? { background: '#f0fdf4' } : {}}>
                      <td style={styles.td}>
                        {r.name}
                        {r === bestModel && ' 🏆'}
                      </td>
                      <td style={styles.td}>{(r.trainAccuracy * 100).toFixed(1)}%</td>
                      <td style={{
                        ...styles.td,
                        fontWeight: 'bold',
                        color: r.testAccuracy > 0.8 ? '#059669' : r.testAccuracy > 0.5 ? '#f97316' : '#ef4444',
                      }}>
                        {(r.testAccuracy * 100).toFixed(1)}%
                      </td>
                      <td style={styles.td}>{r.testLoss.toFixed(4)}</td>
                      <td style={styles.td}>{r.trainingTime.toFixed(0)}ms</td>
                      <td style={styles.td}>
                        {((r.trainAccuracy - r.testAccuracy) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 雷达图 */}
          <div style={styles.chartGrid}>
            <div style={styles.section}>
              <h3>🎯 综合性能雷达图</h3>
              <Radar
                data={radarData}
                options={{
                  responsive: true,
                  scales: {
                    r: { min: 0, max: 100, ticks: { stepSize: 20 } },
                  },
                }}
              />
            </div>
            <div style={styles.section}>
              <h3>📊 测试准确率对比</h3>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  scales: {
                    y: { min: 0, max: 100, title: { display: true, text: '准确率 (%)' } },
                  },
                }}
              />
            </div>
          </div>

          {/* 最佳模型 */}
          {bestModel && (
            <div style={{ ...styles.section, background: '#f0fdf4', border: '2px solid #059669' }}>
              <h3>🏆 最佳模型: {bestModel.name}</h3>
              <p>
                测试准确率: <strong>{(bestModel.testAccuracy * 100).toFixed(1)}%</strong> |
                训练耗时: <strong>{bestModel.trainingTime.toFixed(0)}ms</strong> |
                过拟合程度: <strong>{((bestModel.trainAccuracy - bestModel.testAccuracy) * 100).toFixed(1)}%</strong>
              </p>
            </div>
          )}
        </>
      )}

      <div style={styles.section}>
        <h3>💡 学习要点</h3>
        <ul style={styles.learnList}>
          <li><strong>模型选择</strong>：没有万能模型，需要根据具体任务选择最合适的超参数</li>
          <li><strong>过拟合检测</strong>：训练准确率远高于测试准确率说明模型过拟合了</li>
          <li><strong>A/B 测试</strong>：通过控制变量法，每次只改变一个超参数来观察效果</li>
          <li><strong>性能权衡</strong>：准确率、训练时间、模型大小之间往往存在权衡</li>
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
  presetGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px', marginBottom: '16px',
  },
  presetCard: {
    padding: '12px', background: 'white', borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  presetName: { fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' },
  presetDetail: { fontSize: '12px', color: '#6b7280', marginBottom: '2px' },
  btn: {
    padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
  },
  progress: { marginLeft: '12px', color: '#4f46e5', fontWeight: 'bold' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' },
  table: { borderCollapse: 'collapse', width: '100%', fontSize: '14px' },
  th: {
    padding: '10px 12px', background: '#e5e7eb', textAlign: 'left',
    borderBottom: '2px solid #d1d5db', whiteSpace: 'nowrap',
  },
  td: { padding: '8px 12px', borderBottom: '1px solid #e5e7eb' },
  learnList: { lineHeight: '1.8', paddingLeft: '20px' },
};
