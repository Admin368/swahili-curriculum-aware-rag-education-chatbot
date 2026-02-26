/**
 * Recursive text splitter for document chunking.
 *
 * Splits text into chunks of approximately `chunkSize` characters,
 * with `chunkOverlap` character overlap between consecutive chunks.
 * Tries to split at natural boundaries (paragraphs > sentences > words).
 */
export function splitTextIntoChunks(
  text: string,
  opts: { chunkSize?: number; chunkOverlap?: number } = {},
): string[] {
  const { chunkSize = 500, chunkOverlap = 50 } = opts;

  if (!text || text.trim().length === 0) return [];
  if (text.length <= chunkSize) return [text.trim()];

  const separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "];
  return recursiveSplit(text, separators, chunkSize, chunkOverlap);
}

function recursiveSplit(
  text: string,
  separators: string[],
  chunkSize: number,
  chunkOverlap: number,
): string[] {
  if (text.length <= chunkSize) return [text.trim()].filter(Boolean);

  // Find the best separator that produces chunks
  let bestSep = "";
  for (const sep of separators) {
    if (text.includes(sep)) {
      bestSep = sep;
      break;
    }
  }

  // If no separator found, just split by size
  if (!bestSep) {
    return splitBySize(text, chunkSize, chunkOverlap);
  }

  const parts = text.split(bestSep);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const part of parts) {
    const candidate = currentChunk ? currentChunk + bestSep + part : part;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If single part is too long, recursively split with next separator
      if (part.length > chunkSize) {
        const remainingSeps = separators.slice(separators.indexOf(bestSep) + 1);
        if (remainingSeps.length > 0) {
          chunks.push(
            ...recursiveSplit(part, remainingSeps, chunkSize, chunkOverlap),
          );
        } else {
          chunks.push(...splitBySize(part, chunkSize, chunkOverlap));
        }
        currentChunk = "";
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Apply overlap between consecutive chunks
  if (chunkOverlap > 0 && chunks.length > 1) {
    return applyOverlap(chunks, chunkOverlap);
  }

  return chunks.filter(Boolean);
}

function splitBySize(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start += chunkSize - chunkOverlap;
  }
  return chunks.filter(Boolean);
}

function applyOverlap(chunks: string[], overlapSize: number): string[] {
  const result: string[] = [chunks[0]!];
  for (let i = 1; i < chunks.length; i++) {
    const prevChunk = chunks[i - 1]!;
    const overlap = prevChunk.slice(-overlapSize);
    result.push(overlap + chunks[i]!);
  }
  return result.filter(Boolean);
}
