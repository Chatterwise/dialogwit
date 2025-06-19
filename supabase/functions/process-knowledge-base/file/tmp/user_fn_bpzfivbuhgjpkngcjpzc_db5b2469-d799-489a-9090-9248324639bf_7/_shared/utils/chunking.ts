export function chunkText(text, options = {}) {
  const { maxLength = 800, overlapLength = 100, preserveParagraphs = true, preserveSentences = true } = options;
  if (text.length <= maxLength) {
    return [
      text.trim()
    ];
  }
  const chunks = [];
  if (preserveParagraphs) {
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter((p)=>p.trim().length > 0);
    for (const paragraph of paragraphs){
      if (paragraph.length <= maxLength) {
        chunks.push(paragraph.trim());
      } else {
        // Split long paragraphs
        chunks.push(...chunkLongText(paragraph, maxLength, overlapLength, preserveSentences));
      }
    }
  } else {
    chunks.push(...chunkLongText(text, maxLength, overlapLength, preserveSentences));
  }
  return chunks.filter((chunk)=>chunk.trim().length > 0);
}
function chunkLongText(text, maxLength, overlapLength, preserveSentences) {
  const chunks = [];
  if (preserveSentences) {
    // Split by sentences
    const sentences = text.split(/[.!?]+/).filter((s)=>s.trim().length > 0);
    let currentChunk = '';
    for (const sentence of sentences){
      const trimmedSentence = sentence.trim();
      const potentialChunk = currentChunk ? `${currentChunk}. ${trimmedSentence}` : trimmedSentence;
      if (potentialChunk.length <= maxLength) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
          // Add overlap from the end of current chunk
          const overlap = getOverlap(currentChunk, overlapLength);
          currentChunk = overlap ? `${overlap} ${trimmedSentence}` : trimmedSentence;
        } else {
          // Single sentence is too long, split by words
          chunks.push(...chunkByWords(trimmedSentence, maxLength, overlapLength));
          currentChunk = '';
        }
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
  } else {
    // Split by words when sentences are not preserved
    chunks.push(...chunkByWords(text, maxLength, overlapLength));
  }
  return chunks;
}
function chunkByWords(text, maxLength, overlapLength) {
  const chunks = [];
  const words = text.split(/\s+/);
  let currentChunk = '';
  for (const word of words){
    const potentialChunk = currentChunk ? `${currentChunk} ${word}` : word;
    if (potentialChunk.length <= maxLength) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Add overlap
        const overlap = getOverlap(currentChunk, overlapLength);
        currentChunk = overlap ? `${overlap} ${word}` : word;
      } else {
        // Single word is too long, just add it
        chunks.push(word);
        currentChunk = '';
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}
function getOverlap(text, overlapLength) {
  if (overlapLength <= 0 || text.length <= overlapLength) {
    return '';
  }
  // Try to get overlap at word boundary
  const overlap = text.slice(-overlapLength);
  const lastSpaceIndex = overlap.indexOf(' ');
  return lastSpaceIndex > 0 ? overlap.slice(lastSpaceIndex + 1) : overlap;
}
export function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}
export function validateChunkSize(chunks, maxTokens = 8000) {
  return chunks.every((chunk)=>estimateTokens(chunk) <= maxTokens);
}
