export const currencyConfig = {
  currencyCode: 'USD',
  currencySymbol: '$',
  spokenCurrencySingular: 'dollar',
  spokenCurrencyPlural: 'dollars',
  symbolPosition: 'before',
} as const;

const smallNumberWords = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const;

const tensWords = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
] as const;

function formatNumber(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError('Currency amounts must be finite numbers.');
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

function integerToEnglish(amount: number): string {
  if (amount < 20) return smallNumberWords[amount];
  if (amount < 100) {
    const tens = tensWords[Math.floor(amount / 10)];
    const remainder = amount % 10;
    return remainder === 0 ? tens : `${tens}-${smallNumberWords[remainder]}`;
  }
  if (amount < 1_000) {
    const hundreds = `${smallNumberWords[Math.floor(amount / 100)]} hundred`;
    const remainder = amount % 100;
    return remainder === 0 ? hundreds : `${hundreds} ${integerToEnglish(remainder)}`;
  }
  if (amount < 1_000_000) {
    const thousands = `${integerToEnglish(Math.floor(amount / 1_000))} thousand`;
    const remainder = amount % 1_000;
    return remainder === 0 ? thousands : `${thousands} ${integerToEnglish(remainder)}`;
  }

  return formatNumber(amount);
}

function amountToEnglish(amount: number): string {
  if (!Number.isInteger(amount) || Math.abs(amount) >= 1_000_000) {
    return formatNumber(amount);
  }

  const absoluteAmount = Math.abs(amount);
  const words = integerToEnglish(absoluteAmount);
  return amount < 0 ? `minus ${words}` : words;
}

function currencyName(amount: number): string {
  return Math.abs(amount) === 1
    ? currencyConfig.spokenCurrencySingular
    : currencyConfig.spokenCurrencyPlural;
}

/** Formats a visible amount, for example `$90`. */
export function formatCurrencyDisplay(amount: number): string {
  const formattedAmount = formatNumber(amount);
  return currencyConfig.symbolPosition === 'before'
    ? `${currencyConfig.currencySymbol}${formattedAmount}`
    : `${formattedAmount}${currencyConfig.currencySymbol}`;
}

/** Formats authored narration, for example `ninety dollars`. */
export function formatCurrencySpoken(amount: number): string {
  return `${amountToEnglish(amount)} ${currencyName(amount)}`;
}

/** Formats a screen-reader label without announcing the symbol. */
export function formatCurrencyAccessibility(amount: number): string {
  return `${formatNumber(amount)} ${currencyName(amount)}`;
}
