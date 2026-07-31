import React, { useState, useCallback } from 'react';
import { VectorDB, simplePCA2D } from '../../core/vectordb';
import type { VectorEntry, SearchResult } from '../../core/vectordb';
import { hashEmbedding } from '../../core/features';

const db = new VectorDB(64);

export const VectorDBPanel: React.FC = () => {
  const [entries, setEntries] = useState<VectorEntry[]>([]);
  const [textInput, setTextInput] = useState('');
  const [idInput, setIdInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [points2D, setPoints2D] = useState<[number, number][]>([]);
  const [log, setLog] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const refreshView = useCallback(() => {
    const all = db.getEntries();
    setEntries(all);
    if (all.length >= 2) {
      setPoints2D(simplePCA2D(all.map(e => e.vector)));
    } else {
      setPoints2D([]);
    }
  }, []);

  const handleInsert = () => {
    if (!textInput.trim()) return;
    const id = idInput.trim() || `vec_${Date.now()}`;
    const vector = hashEmbedding(textInput, 64);
    db.insert(id, textInput, vector);
    addLog(`✅ 插入向量: id="${id}", text="${textInput.substring(0, 30)}..."`);
    setTextInput('');
    setIdInput('');
    refreshView();
  };

  const handleSearch = () => {
    if (!queryInput.trim()) return;
    const queryVec = hashEmbedding(queryInput, 64);
    const results = db.search(queryVec, 5);
    setSearchResults(results);
    addLog(`🔍 搜索: "${queryInput}" → 找到 ${results.length} 条结果`);
  };

  const handleDelete = (id: string) => {
    db.delete(id);
    addLog(`🗑️ 删除向量: id="${id}"`);
    refreshView();
    setSearchResults([]);
  };

  const handleLoadSample = () => {
    const samples = [
      '机器学习是人工智能的一个分支',
      '深度学习使用神经网络进行特征学习',
      '自然语言处理让计算机理解人类语言',
      '计算机视觉使机器能够理解图像',
      '强化学习通过奖励机制训练智能体',
      '向量数据库存储高维向量数据',
      'Transformer模型是大语言模型的基础',
      '注意力机制允许模型关注输入的不同部分',
    ];
    samples.forEach((text, i) => {
      const vec = hashEmbedding(text, 64);
      db.insert(`sample_${i}`, text, vec);
    });
    addLog(`📦 已加载 ${samples.length} 条示例数据`);
    refreshView();
  };

  const handleClear = () => {
    db.clear();
    addLog('🧹 已清空数据库');
    refreshView();
    setSearchResults([]);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗄️ 向量数据库仿真器</h2>
      <p style={styles.desc}>
        模拟向量数据库的核心操作：将文本转为向量 → 存入数据库 → 相似度搜索
      </p>

      {/* 操作区 */}
      <div style={styles.section}>
        <h3>插入数据</h3>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="ID（可选）"
            value={idInput}
            onChange={e => setIdInput(e.target.value)}
          />
          <input
            style={{ ...styles.input, flex: 2 }}
            placeholder="输入文本内容..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInsert()}
          />
          <button style={styles.btn} onClick={handleInsert}>插入</button>
        </div>
        <div style={styles.inputRow}>
          <button style={styles.btnSecondary} onClick={handleLoadSample}>加载示例数据</button>
          <button style={styles.btnDanger} onClick={handleClear}>清空</button>
        </div>
      </div>

      {/* 搜索区 */}
      <div style={styles.section}>
        <h3>相似度搜索</h3>
        <div style={styles.inputRow}>
          <input
            style={{ ...styles.input, flex: 3 }}
            placeholder="输入搜索文本..."
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.btn} onClick={handleSearch}>搜索</button>
        </div>
        {searchResults.length > 0 && (
          <div style={styles.results}>
            <h4>搜索结果（按相似度排序）</h4>
            {searchResults.map((r, i) => (
              <div key={r.entry.id} style={styles.resultItem}>
                <span style={styles.rank}>#{i + 1}</span>
                <span style={styles.resultText}>{r.entry.text}</span>
                <span style={styles.similarity}>
                  相似度: {(r.similarity * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 数据列表 */}
      <div style={styles.section}>
        <h3>数据库内容 ({entries.length} 条记录)</h3>
        <div style={styles.entryList}>
          {entries.map(e => (
            <div key={e.id} style={styles.entry}>
              <span style={styles.entryId}>{e.id}</span>
              <span style={styles.entryText}>{e.text}</span>
              <button style={styles.btnSmall} onClick={() => handleDelete(e.id)}>删除</button>
            </div>
          ))}
          {entries.length === 0 && (
            <p style={styles.empty}>数据库为空，请插入数据或加载示例</p>
          )}
        </div>
      </div>

      {/* 2D 可视化 */}
      {points2D.length > 0 && (
        <div style={styles.section}>
          <h3>向量空间可视化 (PCA 2D)</h3>
          <div style={styles.canvas}>
            <svg width="100%" height="300" viewBox="-5 -5 10 10">
              {points2D.map(([x, y], i) => (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={0.15}
                    fill={`hsl(${(i * 360) / points2D.length}, 70%, 50%)`}
                    opacity={0.8}
                  />
                  <text
                    x={x + 0.2}
                    y={y + 0.05}
                    fontSize="0.25"
                    fill="#666"
                  >
                    {entries[i]?.text.substring(0, 6)}...
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* 操作日志 */}
      <div style={styles.section}>
        <h3>操作日志</h3>
        <div style={styles.logBox}>
          {log.map((l, i) => (
            <div key={i} style={styles.logLine}>{l}</div>
          ))}
          {log.length === 0 && <span style={styles.empty}>暂无操作记录</span>}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px' },
  title: { margin: '0 0 8px', fontSize: '24px' },
  desc: { color: '#666', marginBottom: '20px' },
  section: { marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' },
  inputRow: { display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' },
  input: {
    flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px',
    fontSize: '14px', minWidth: '120px',
  },
  btn: {
    padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap',
  },
  btnSecondary: {
    padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  btnDanger: {
    padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
  },
  btnSmall: {
    padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none',
    borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
  },
  results: { marginTop: '12px' },
  resultItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
    background: 'white', borderRadius: '6px', marginBottom: '4px',
  },
  rank: { fontWeight: 'bold', color: '#4f46e5', minWidth: '30px' },
  resultText: { flex: 1 },
  similarity: { color: '#059669', fontWeight: 'bold', whiteSpace: 'nowrap' },
  entryList: { maxHeight: '300px', overflowY: 'auto' as const },
  entry: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
    background: 'white', borderRadius: '6px', marginBottom: '4px',
  },
  entryId: { fontFamily: 'monospace', color: '#6b7280', minWidth: '80px', fontSize: '12px' },
  entryText: { flex: 1, fontSize: '14px' },
  empty: { color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' as const, padding: '20px' },
  canvas: { background: 'white', borderRadius: '8px', padding: '10px' },
  logBox: {
    maxHeight: '200px', overflowY: 'auto' as const, fontFamily: 'monospace',
    fontSize: '12px', background: '#1e1e1e', color: '#a5d6a7', padding: '12px',
    borderRadius: '6px',
  },
  logLine: { marginBottom: '2px' },
};
