import { stripRichText } from './richText';

export function calculateReadingTime(content) {
  const plainText = stripRichText(content);
  if (!plainText) {
    return {
      minutes: 1,
      label: '1 min read',
      words: 0,
    };
  }

  const words = plainText.split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    minutes,
    words,
    label: `${minutes} min read`,
  };
}
