import React, { useState } from 'react';
import { VectorDBPanel } from './components/VectorDB/VectorDBPanel';
import { FeaturePanel } from './components/Dataset/FeaturePanel';
import { TrainingPanel } from './components/Training/TrainingPanel';
import { AgentPanel } from './components/Agent/AgentPanel';
import { ComparisonPanel } from './components/Dashboard/ComparisonPanel';
import { tutorials } from './tutorials/content';
import type { TutorialStep } from './tutorials/content';

type ModuleId = TutorialStep['module'];

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [showTutorial, setShowTutorial] = useState(true);

  const currentTutorial = tutorials.find(t => t.module === activeModule);

  const renderModule = () => {
    switch (activeModule) {
      case 'vectordb': return <VectorDBPanel />;
      case 'features': return <FeaturePanel />;
      case 'training': return <TrainingPanel />;
      case 'agent': return <AgentPanel />;
      case 'comparison': return <ComparisonPanel />;
      case 'home':
      default:
        return (
          <div style={styles.homeContainer}>
            <div style={styles.hero}>
              <h1 style={styles.heroTitle}>🚀 AI 训练仿真环境</h1>
              <h2 style={styles.heroSub}>从编程小白到智能体训练师</h2>
              <p style={styles.heroDesc}>
                在浏览器中体验大模型训练的全流程：向量数据库、特征提取、模型训练、Agent 构建、模型对比
              </p>
            </div>
            <div style={styles.cardGrid}>
              {tutorials.filter(t => t.module !== 'home').map(t => (
                <div
                  key={t.id}
                  style={styles.card}
                  onClick={() => setActiveModule(t.module)}
                >
                  <div style={styles.cardTitle}>{t.title}</div>
                  <div style={styles.cardStage}>阶段 {t.stage}</div>
                  <div style={styles.cardArrow}>→</div>
                </div>
              ))}
            </div>
            <div style={styles.features}>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🌐</span>
                <span>纯浏览器运行，无需 GPU</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🎮</span>
                <span>交互式仿真操作</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>📈</span>
                <span>实时可视化反馈</span>
              </div>
              <div style={styles.featureItem}>
                <span style={styles.featureIcon}>🇨🇳</span>
                <span>全中文界面</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.app}>
      {/* 顶栏 */}
      <header style={styles.header}>
        <div
          style={styles.logo}
          onClick={() => setActiveModule('home')}
        >
          🚀 AI 训练仿真环境
        </div>
        <button
          style={styles.tutorialToggle}
          onClick={() => setShowTutorial(!showTutorial)}
        >
          {showTutorial ? '隐藏教程' : '显示教程'}
        </button>
      </header>

      <div style={styles.body}>
        {/* 侧边导航 */}
        <nav style={styles.nav}>
          {tutorials.map(t => (
            <button
              key={t.id}
              style={{
                ...styles.navItem,
                ...(activeModule === t.module ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveModule(t.module)}
            >
              {t.title}
            </button>
          ))}
        </nav>

        {/* 主内容区 */}
        <main style={styles.main}>
          {/* 教程面板 */}
          {showTutorial && currentTutorial && activeModule !== 'home' && (
            <div style={styles.tutorialPanel}>
              <div style={styles.tutorialContent}>
                {currentTutorial.content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} style={styles.h1}>{line.slice(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} style={styles.h2}>{line.slice(3)}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} style={styles.h3}>{line.slice(4)}</h3>;
                  if (line.startsWith('- ')) return <li key={i} style={styles.li}>{line.slice(2)}</li>;
                  if (line.match(/^\d+\. /)) return <li key={i} style={styles.li}>{line.replace(/^\d+\. /, '')}</li>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} style={styles.p}>{line}</p>;
                })}
              </div>
            </div>
          )}

          {/* 仿真模块 */}
          <div style={styles.moduleContainer}>
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1f2937',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: '#1e1b4b', color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: { fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  tutorialToggle: {
    padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer',
  },
  body: { display: 'flex', flex: 1 },
  nav: {
    width: '200px', minWidth: '200px', background: '#f9fafb',
    borderRight: '1px solid #e5e7eb', padding: '12px 0',
    display: 'flex', flexDirection: 'column',
  },
  navItem: {
    padding: '10px 20px', border: 'none', background: 'none', textAlign: 'left',
    cursor: 'pointer', fontSize: '14px', color: '#4b5563',
    borderLeft: '3px solid transparent', transition: 'all 0.15s',
  },
  navItemActive: {
    background: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold',
    borderLeft: '3px solid #4f46e5',
  },
  main: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
  tutorialPanel: {
    padding: '20px 24px', background: '#fffbeb', borderBottom: '1px solid #fde68a',
    maxHeight: '300px', overflowY: 'auto',
  },
  tutorialContent: { maxWidth: '800px' },
  h1: { fontSize: '22px', margin: '0 0 12px', color: '#1e1b4b' },
  h2: { fontSize: '18px', margin: '16px 0 8px', color: '#374151' },
  h3: { fontSize: '15px', margin: '12px 0 6px', color: '#4b5563' },
  p: { margin: '4px 0', lineHeight: '1.6', fontSize: '14px' },
  li: { marginBottom: '4px', lineHeight: '1.6', fontSize: '14px' },
  moduleContainer: { flex: 1 },
  // Home page
  homeContainer: { padding: '40px 24px', maxWidth: '900px', margin: '0 auto' },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: { fontSize: '36px', margin: '0', color: '#1e1b4b' },
  heroSub: { fontSize: '20px', color: '#4b5563', fontWeight: 'normal', margin: '8px 0' },
  heroDesc: { fontSize: '16px', color: '#6b7280', maxWidth: '600px', margin: '16px auto' },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '40px',
  },
  card: {
    padding: '20px', background: '#f8f9fa', borderRadius: '12px',
    border: '1px solid #e5e7eb', cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' },
  cardStage: { fontSize: '12px', color: '#6b7280' },
  cardArrow: { fontSize: '20px', color: '#4f46e5', marginTop: '8px' },
  features: {
    display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap',
  },
  featureItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  featureIcon: { fontSize: '24px' },
};

export default App;
