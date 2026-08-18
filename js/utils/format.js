/**
 * Formatting Utilities
 * Currency (₹ Cr), percentage, multiple, and number formatting
 */

/**
 * Format value as Indian currency in Crores
 * @param {number} value - Value in Crores
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    const abs = Math.abs(value);
    const sign = value < 0 ? '−' : '';

    if (abs >= 1) {
        return `${sign}₹${abs.toFixed(decimals)} Cr`;
    } else {
        return `${sign}₹${(abs * 100).toFixed(decimals)} L`;
    }
}

/**
 * Format as currency without unit for table cells
 */
export function formatCurrencyShort(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return value.toFixed(decimals);
}

/**
 * Format as percentage
 * @param {number} value - Decimal value (0.15 = 15%)
 * @param {number} decimals - Decimal places
 */
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format as percentage from already-percentage value
 * @param {number} value - Percentage value (15 = 15%)
 */
export function formatPercentDirect(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format as multiple (e.g., 4.2x)
 */
export function formatMultiple(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${value.toFixed(decimals)}x`;
}

/**
 * Format number with Indian numbering system
 */
export function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return value.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format as years
 */
export function formatYears(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${value.toFixed(decimals)} yrs`;
}

/**
 * Get CSS class for positive/negative values
 */
export function getValueClass(value, inverse = false) {
    if (value === null || value === undefined || isNaN(value)) return '';
    if (inverse) return value > 0 ? 'negative' : 'positive';
    return value >= 0 ? 'positive' : 'negative';
}

/**
 * Format score out of 5
 */
export function formatScore(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return `${value.toFixed(decimals)}/5`;
}

/**
 * Get color for a score (1-5 scale)
 */
export function getScoreColor(score) {
    if (score >= 4.0) return '#10b981'; // Emerald
    if (score >= 3.0) return '#3b82f6'; // Blue
    if (score >= 2.0) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
}

/**
 * Get recommendation label based on score
 */
export function getRecommendation(score) {
    if (score >= 4.0) return { label: 'Strong Buy', class: 'strong-buy', color: '#10b981' };
    if (score >= 3.5) return { label: 'Buy', class: 'buy', color: '#3b82f6' };
    if (score >= 2.5) return { label: 'Hold', class: 'hold', color: '#f59e0b' };
    return { label: 'Pass', class: 'pass', color: '#ef4444' };
}
