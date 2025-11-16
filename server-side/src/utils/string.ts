export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};

export const truncate = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export const unescapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return text.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match]);
};
