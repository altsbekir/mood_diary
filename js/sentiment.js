const positiveRoots = ['sev', 'mutlu', 'harik', 'güzel', 'iyi', 'muhteşem', 'başarı', 'huzur', 'heyecan'];
const negativeRoots = ['üz', 'köt', 'berbat', 'iğrenç', 'sinir', 'öfk', 'kız', 'kır', 'stres'];
const negationRegex = /(m[aeıioöuü]y?|m[ae]z|m[ae]d|s[ıiuü]z)/;

export function analyzeSentiment(text) {
    if (!text) return 0;
    const lowerText = text.toLocaleLowerCase('tr-TR');
    let score = 0;
    const words = lowerText.split(/\s+/);

    words.forEach(word => {
        if (positiveRoots.some(root => word.startsWith(root))) score += 1;
        if (negativeRoots.some(root => word.startsWith(root))) score -= 1;
    });
    return Math.max(-2, Math.min(2, score));
}