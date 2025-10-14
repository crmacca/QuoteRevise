import Fuse from 'fuse.js';

// Check if two words match (case-insensitive, fuzzy)
export const fuzzyMatch = (input, target) => {
  if (!input || !target) return { match: false, fuzzy: false };
  
  const normalizedInput = input.trim().toLowerCase();
  const normalizedTarget = target.trim().toLowerCase();
  
  // Don't fuzzy match if input is too short (1-2 chars)
  if (normalizedInput.length <= 2) {
    // Only exact match for very short inputs
    if (normalizedInput === normalizedTarget) {
      return { match: true, fuzzy: false };
    }
    return { match: false, fuzzy: false };
  }
  
  // Exact match (case-insensitive)
  if (normalizedInput === normalizedTarget) {
    return { match: true, fuzzy: false };
  }
  
  // Fuzzy match using Fuse.js (only for longer words)
  const fuse = new Fuse([normalizedTarget], {
    threshold: 0.3, // Lower = stricter matching
    distance: 100,
  });
  
  const result = fuse.search(normalizedInput);
  
  if (result.length > 0) {
    return { match: true, fuzzy: true };
  }
  
  return { match: false, fuzzy: false };
};

// Process all inputs and return results
export const checkInputs = (inputs, originalWords) => {
  return originalWords.map((word, index) => {
    const input = inputs[index] || '';
    const matchResult = fuzzyMatch(input, word);
    
    return {
      word,
      input,
      correct: matchResult.match && !matchResult.fuzzy,
      fuzzyMatch: matchResult.match && matchResult.fuzzy,
      incorrect: !matchResult.match,
    };
  });
};