// Utility functions for journal functionality

export function toRomanNumeral(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  
  let result = "";
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i];
      num -= values[i];
    }
  }
  return result.toUpperCase();
}

export function formatJournalUrl(volume: number, issue: number): string {
  return `/journal/vol-${toRomanNumeral(volume).toLowerCase()}/no-${issue}`;
}

export function formatJournalHeader(volume: number, issue: number, year: number, publishedDate: string): string {
  return `Zhi Systems Journal
Vol. ${toRomanNumeral(volume)}, No. ${issue} (${year})
Published: ${publishedDate}`;
}

export function parseMarkdown(text: string): string {
  // Basic markdown parsing - can be enhanced later
  return text
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}