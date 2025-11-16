export const required = (value: any): string | undefined => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'This field is required';
  }
  return undefined;
};

export const email = (value: string): string | undefined => {
  if (!value) return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Invalid email address';
  }
  return undefined;
};

export const minLength = (min: number) => (value: string): string | undefined => {
  if (!value) return undefined;
  if (value.length < min) {
    return `Must be at least ${min} characters`;
  }
  return undefined;
};

export const maxLength = (max: number) => (value: string): string | undefined => {
  if (!value) return undefined;
  if (value.length > max) {
    return `Must be at most ${max} characters`;
  }
  return undefined;
};

export const url = (value: string): string | undefined => {
  if (!value) return undefined;
  try {
    new URL(value);
    return undefined;
  } catch {
    return 'Invalid URL';
  }
};

export const number = (value: any): string | undefined => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (isNaN(Number(value))) {
    return 'Must be a valid number';
  }
  return undefined;
};

export const min = (minValue: number) => (value: number): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (value < minValue) {
    return `Must be at least ${minValue}`;
  }
  return undefined;
};

export const max = (maxValue: number) => (value: number): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (value > maxValue) {
    return `Must be at most ${maxValue}`;
  }
  return undefined;
};
