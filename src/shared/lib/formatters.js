/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate days remaining until end date
 */
export function getDaysRemaining(endDate) {
  if (!endDate) return null;
  
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  return diff > 0 ? diff : 0;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}
