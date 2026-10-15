export const normalizeCardSearch = (text: string) => text.trim().toLocaleLowerCase().replace(/\s+/g, " ");

// One insertion, deletion, replacement, or adjacent transposition. Short words
// are deliberately excluded so unrelated AAC words do not become suggestions.
const oneTypoApart = (query: string, label: string): boolean => {
  if (query.length < 4 || label.length < 4 || Math.abs(query.length - label.length) > 1) return false;
  let index = 0;
  while (index < query.length && query[index] === label[index]) index += 1;
  if (index === query.length) return label.length <= query.length + 1;
  if (query.length === label.length) {
    return query.slice(index + 1) === label.slice(index + 1) || (
      query[index] === label[index + 1] && query[index + 1] === label[index]
      && query.slice(index + 2) === label.slice(index + 2)
    );
  }
  return query.length > label.length
    ? query.slice(index + 1) === label.slice(index)
    : query.slice(index) === label.slice(index + 1);
};

export const searchCardLabels = <T,>(cards: T[], query: string, getLabels: (card: T) => string[]): { cards: T[]; similarSpelling: boolean } => {
  const normalized = normalizeCardSearch(query);
  if (!normalized) return { cards, similarSpelling: false };
  const labels = cards.map((card) => ({ card, labels: getLabels(card).map(normalizeCardSearch) }));
  const direct = labels.filter((item) => item.labels.some((label) => label.includes(normalized)));
  if (direct.length) return { cards: direct.map((item) => item.card), similarSpelling: false };
  if (normalized.length > 80) return { cards: [], similarSpelling: false };
  const suggested = labels.filter((item) => item.labels.some((label) =>
    oneTypoApart(normalized, label) || label.split(" ").some((word) => oneTypoApart(normalized, word))
  ));
  return { cards: suggested.map((item) => item.card), similarSpelling: suggested.length > 0 };
};
