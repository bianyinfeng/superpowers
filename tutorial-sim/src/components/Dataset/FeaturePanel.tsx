import React, { useState } from 'react';
import { computeTfIdf, tokenize, hashEmbedding } from '../../core/features';

export const FeaturePanel: React.FC = () => {
  const [documents, setDocuments] = useState<string[]>([
    '机器学习是人工智能的重要分支',
    '深度学习使用多层神经网络',
    '自然语言处理分析文本数据',
  ]);
  const [newDoc, setNewDoc] = useState('');
  const [tfidfResult, setTfidfResult] = useState<{
    vocabulary: string[];
    tfidfMatrix: number[][];
  } | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [embeddingPreview, setEmbeddingPreview] = useState<number[] | null>(null);

  const handleAddDoc = () => {
    if (!newDoc.trim()) return;
    setDocuments(prev => [...prev, newDoc.trim()]);
    setNewDoc('');
    setTfidfResult(null);
  };

  const handleRemoveDoc = (idx: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
    setTfidfResult(null);
    setSelectedDoc(null);
  };

  const handleComputeTfIdf = () => {
    if (documents.length === 0) return;
    const result = computeTfIdf(documents);
    setTfidfResult({ vocabulary: result.vocabulary, tfidfMatrix: result.tfidfMatrix });
  };

  const handleShowTokens = (idx: number) => {
    setSelectedDoc(idx);
    const vec = hashEmbedding(documents[idx], 16);
    setEmbeddingPreview(vec);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔬 特征提取模拟器</h2>
      <p style={styles.desc}>
        探索文本如何被转化为机器可以理解的数值表示（向量）
      </p>

      {/* 文档管理 */}
      <div style={styles.section}>
        <h3>📄 文档集</h3>
        <div style={styles.inputRow}>
          <input
            style={{ ...styles.input, flex: 3 }}
            placeholder="输入一段文本..."
            value={newDoc}
            onChange={e => setNewDoc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddDoc()}
          />
          <button style={styles.btn} onClick={handleAddDoc}>添加</button>
        </div>
        <div style={styles.docList}>
          {documents.map((doc, i) => (
            <div
              key={i}
              style={{
                ...styles.docItem,
                border: selectedDoc === i ? '2px solid #4f46e5' : '1px solid #e5e7eb',
              }}
              onClick={() => handleShowTokens(i)}
            >
              <span style={styles.docIndex}>#{i + 1}</span>
              <span style={styles.docText}>{doc}</span>
              <button
                style={styles.btnSmall}
                onClick={e => { e.stopPropagation(); handleRemoveDoc(i); }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 分词展示 */}
      {selectedDoc !== null && (
        <div style={styles.section}>
          <h3>🔤 分词结果</h3>
          <div style={styles.tokenContainer}>
            {tokenize(documents[selectedDoc]).map((token, i) => (
              <span key={i} style={styles.token}>{token}</span>
            ))}
          </div>

          {embeddingPreview && (
            <>
              <h3 style={{ marginTop: '16px' }}>📊 哈希嵌入向量 (16维)</h3>
              <div style={styles.vectorBar}>
                {embeddingPreview.map((val, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.barCell,
                      background: val >= 0
                        ? `rgba(79, 70, 229, ${Math.abs(val)})`
                        : `rgba(239, 68, 68, ${Math.abs(val)})`,
                    }}
                    title={`维度${i}: ${val.toFixed(4)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                ))}
              </div>
              <p style={styles.hint}>
                紫色 = 正值，红色 = 负值，颜色深浅表示数值大小
              </p>
            </>
          )}
        </div>
      )}

      {/* TF-IDF */}
      <div style={styles.section}>
        <h3>📈 TF-IDF 分析</h3>
        <button style={styles.btn} onClick={handleComputeTfIdf}>
          计算 TF-IDF
        </button>
        {tfidfResult && (
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>词汇 ↓ / 文档 →</th>
                  {documents.map((_, i) => (
                    <th key={i} style={styles.th}>文档{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tfidfResult.vocabulary.slice(0, 20).map((word, wi) => (
                  <tr key={wi}>
                    <td style={styles.td}><strong>{word}</strong></td>
                    {tfidfResult.tfidfMatrix.map((row, di) => (
                      <td
                        key={di}
                        style={{
                          ...styles.td,
                          background: row[wi] > 0
                            ? `rgba(79, 70, 229, ${Math.min(row[wi] * 2, 0.8)})`
                            : 'transparent',
                          color: row[wi] > 0.3 ? 'white' : 'inherit',
                        }}
                      >
                        {row[wi].toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {tfidfResult.vocabulary.length > 20 && (
              <p style={styles.hint}>显示前 20 个词汇（共 {tfidfResult.vocabulary.length} 个）</p>
            )}
          </div>
        )}
      </div>

      {/* 说明 */}
      <div style={styles.section}>
        <h3>💡 学习要点</h3>
        <ul style={styles.learnList}>
          <li><strong>分词</strong>：将文本拆分为有意义的最小单元</li>
          <li><strong>词袋模型</strong>：统计每个词出现的次数，形成向量</li>
          <li><strong>TF-IDF</strong>：衡量词在文档中的重要程度（词频 × 逆文档频率）</li>
          <li><strong>嵌入向量</strong>：将文本映射到固定维度的连续向量空间</li>
          <li><strong>相似度</strong>：通过向量间的距离衡量文本的语义相似性</li>
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
  inputRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  input: {
    flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px',
  },
  btn: {
    padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  btnSmall: {
    width: '24px', height: '24px', background: '#ef4444', color: 'white', border: 'none',
    borderRadius: '50%', cursor: 'pointer', fontSize: '14px', lineHeight: '1',
  },
  docList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  docItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    background: 'white', borderRadius: '6px', cursor: 'pointer',
  },
  docIndex: { fontWeight: 'bold', color: '#6b7280', minWidth: '30px' },
  docText: { flex: 1, fontSize: '14px' },
  tokenContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px' },
  token: {
    padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: '12px',
    fontSize: '13px', fontFamily: 'monospace',
  },
  vectorBar: {
    display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', marginTop: '8px',
  },
  barCell: {
    padding: '6px 4px', textAlign: 'center', borderRadius: '4px', fontSize: '10px',
    fontFamily: 'monospace', color: '#333',
  },
  hint: { color: '#9ca3af', fontSize: '12px', marginTop: '8px' },
  table: {
    borderCollapse: 'collapse', width: '100%', fontSize: '13px',
  },
  th: {
    padding: '8px', background: '#e5e7eb', textAlign: 'left', borderBottom: '2px solid #d1d5db',
  },
  td: { padding: '6px 8px', borderBottom: '1px solid #e5e7eb' },
  learnList: { lineHeight: '1.8', paddingLeft: '20px' },
};
