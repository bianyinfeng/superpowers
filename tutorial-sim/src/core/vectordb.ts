/**
 * 浏览器端向量数据库仿真引擎
 * 支持向量插入、查询、相似度搜索
 */

export interface VectorEntry {
  id: string;
  text: string;
  vector: number[];
  metadata?: Record<string, string>;
}

export interface SearchResult {
  entry: VectorEntry;
  similarity: number;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export class VectorDB {
  private entries: VectorEntry[] = [];
  private dimension: number;

  constructor(dimension: number = 64) {
    this.dimension = dimension;
  }

  getDimension(): number {
    return this.dimension;
  }

  getEntries(): VectorEntry[] {
    return [...this.entries];
  }

  size(): number {
    return this.entries.length;
  }

  insert(id: string, text: string, vector: number[], metadata?: Record<string, string>): void {
    if (vector.length !== this.dimension) {
      throw new Error(`向量维度不匹配：期望 ${this.dimension}，实际 ${vector.length}`);
    }
    const existing = this.entries.findIndex(e => e.id === id);
    if (existing >= 0) {
      this.entries[existing] = { id, text, vector, metadata };
    } else {
      this.entries.push({ id, text, vector, metadata });
    }
  }

  delete(id: string): boolean {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx >= 0) {
      this.entries.splice(idx, 1);
      return true;
    }
    return false;
  }

  search(queryVector: number[], topK: number = 5, metric: 'cosine' | 'euclidean' = 'cosine'): SearchResult[] {
    if (queryVector.length !== this.dimension) {
      throw new Error(`查询向量维度不匹配：期望 ${this.dimension}，实际 ${queryVector.length}`);
    }

    const results: SearchResult[] = this.entries.map(entry => ({
      entry,
      similarity: metric === 'cosine'
        ? cosineSimilarity(queryVector, entry.vector)
        : 1 / (1 + euclideanDistance(queryVector, entry.vector)),
    }));

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }

  clear(): void {
    this.entries = [];
  }
}

/**
 * 简化的 PCA 降维到 2D，用于可视化
 */
export function simplePCA2D(vectors: number[][]): [number, number][] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const n = vectors.length;

  // 计算均值
  const mean = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) mean[i] += v[i];
  }
  for (let i = 0; i < dim; i++) mean[i] /= n;

  // 中心化
  const centered = vectors.map(v => v.map((val, i) => val - mean[i]));

  // 使用幂迭代法找前两个主成分
  const findPrincipalComponent = (data: number[][], deflated?: number[]): number[] => {
    let pc = new Array(dim).fill(0).map(() => Math.random() - 0.5);
    for (let iter = 0; iter < 100; iter++) {
      const newPc = new Array(dim).fill(0);
      for (const row of data) {
        let dot = 0;
        for (let i = 0; i < dim; i++) dot += row[i] * pc[i];
        for (let i = 0; i < dim; i++) newPc[i] += dot * row[i];
      }
      // 如果有需要去除的分量
      if (deflated) {
        let proj = 0;
        for (let i = 0; i < dim; i++) proj += newPc[i] * deflated[i];
        for (let i = 0; i < dim; i++) newPc[i] -= proj * deflated[i];
      }
      // 归一化
      let norm = 0;
      for (let i = 0; i < dim; i++) norm += newPc[i] * newPc[i];
      norm = Math.sqrt(norm);
      if (norm === 0) return pc;
      for (let i = 0; i < dim; i++) pc[i] = newPc[i] / norm;
    }
    return pc;
  };

  const pc1 = findPrincipalComponent(centered);
  const pc2 = findPrincipalComponent(centered, pc1);

  return centered.map(row => {
    let x = 0, y = 0;
    for (let i = 0; i < dim; i++) {
      x += row[i] * pc1[i];
      y += row[i] * pc2[i];
    }
    return [x, y] as [number, number];
  });
}
