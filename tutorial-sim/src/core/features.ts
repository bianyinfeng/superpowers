/**
 * 特征提取仿真引擎
 * 支持词袋模型、TF-IDF、简单嵌入
 */

/** 中文简易分词（按字符 + 常见标点分割） */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[，。！？、；：""''（）【】《》\s,.!?;:'"()\[\]{}<>]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/** 构建词汇表 */
export function buildVocabulary(documents: string[]): string[] {
  const vocabSet = new Set<string>();
  for (const doc of documents) {
    for (const token of tokenize(doc)) {
      vocabSet.add(token);
    }
  }
  return Array.from(vocabSet).sort();
}

/** 词袋模型（Bag of Words） */
export function bagOfWords(text: string, vocabulary: string[]): number[] {
  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return vocabulary.map(word => counts.get(word) || 0);
}

/** TF-IDF 计算 */
export interface TfIdfResult {
  vocabulary: string[];
  vectors: number[][];
  tfidfMatrix: number[][];
}

export function computeTfIdf(documents: string[]): TfIdfResult {
  const vocabulary = buildVocabulary(documents);
  const n = documents.length;

  // 词频 (TF)
  const tfMatrix = documents.map(doc => {
    const bow = bagOfWords(doc, vocabulary);
    const total = bow.reduce((a, b) => a + b, 0);
    return total === 0 ? bow : bow.map(c => c / total);
  });

  // 逆文档频率 (IDF)
  const df = vocabulary.map((_, i) => {
    let count = 0;
    for (const tf of tfMatrix) {
      if (tf[i] > 0) count++;
    }
    return count;
  });
  const idf = df.map(d => Math.log((n + 1) / (d + 1)) + 1);

  // TF-IDF
  const tfidfMatrix = tfMatrix.map(tf =>
    tf.map((val, i) => val * idf[i])
  );

  // 归一化
  const vectors = tfidfMatrix.map(vec => {
    const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
    return norm === 0 ? vec : vec.map(v => v / norm);
  });

  return { vocabulary, vectors, tfidfMatrix };
}

/**
 * 简单哈希嵌入：将文本转为固定维度向量
 * 用于在没有预训练模型时生成有意义的向量表示
 */
export function hashEmbedding(text: string, dimension: number = 64): number[] {
  const tokens = tokenize(text);
  const vector = new Array(dimension).fill(0);

  for (const token of tokens) {
    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i);
      // 使用多个哈希函数分散到不同维度
      for (let h = 0; h < 3; h++) {
        const idx = ((charCode * (h + 1) * 31 + i * 17) % dimension + dimension) % dimension;
        const sign = ((charCode * (h + 7) + i) % 2) === 0 ? 1 : -1;
        vector[idx] += sign * (1.0 / tokens.length);
      }
    }
  }

  // 归一化
  const norm = Math.sqrt(vector.reduce((a, b) => a + b * b, 0));
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) vector[i] /= norm;
  }
  return vector;
}

/** 特征重要性（基于 TF-IDF 值） */
export function featureImportance(
  text: string,
  vocabulary: string[],
  idfValues: number[]
): { word: string; importance: number }[] {
  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  const total = tokens.length;

  return vocabulary
    .map((word, i) => ({
      word,
      importance: ((counts.get(word) || 0) / Math.max(total, 1)) * idfValues[i],
    }))
    .filter(f => f.importance > 0)
    .sort((a, b) => b.importance - a.importance);
}
