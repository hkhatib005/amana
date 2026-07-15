const TRANSLATION_RESOURCE_ID = 20; // Saheeh International

export type TextSegment = { text: string; highlighted: boolean };

export type QuranSearchResult = {
  key: string;
  arabic: string;
  translationSegments: TextSegment[];
};

function stripTags(text: string) {
  return text.replace(/<[^>]*>/g, '').trim();
}

function parseHighlightedSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const regex = /<em>(.*?)<\/em>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlighted: false });
    }
    segments.push({ text: match[1], highlighted: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlighted: false });
  }
  return segments;
}

export async function searchQuran(query: string): Promise<QuranSearchResult[]> {
  const response = await fetch(
    `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=30&translations=${TRANSLATION_RESOURCE_ID}`,
  );
  const data = await response.json();
  return data.search.results.map((result: { verse_key: string; text: string; translations: { text: string }[] }) => ({
    key: result.verse_key,
    arabic: stripTags(result.text),
    translationSegments: parseHighlightedSegments(result.translations[0]?.text ?? ''),
  }));
}
