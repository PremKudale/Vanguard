/**
 * Financial Mathematics Library
 * Core calculations for PE analysis: IRR, NPV, PMT, WACC, MOIC
 */

/**
 * Calculate Net Present Value
 * @param {number} rate - Discount rate
 * @param {number[]} cashflows - Array of cash flows (index 0 = time 0)
 * @returns {number} NPV
 */
export function calculateNPV(rate, cashflows) {
    return cashflows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);
}

/**
 * Calculate Internal Rate of Return using Newton-Raphson with bisection fallback
 * @param {number[]} cashflows - Array of cash flows (index 0 = initial investment, negative)
 * @param {number} guess - Initial guess (default 15%)
 * @returns {number|null} IRR or null if no convergence
 */
export function calculateIRR(cashflows, guess = 0.15) {
    const maxIter = 1000;
    const tol = 1e-7;

    // Ensure we have both positive and negative cash flows
    const hasNeg = cashflows.some(cf => cf < 0);
    const hasPos = cashflows.some(cf => cf > 0);
    if (!hasNeg || !hasPos) return null;

    // Newton-Raphson method
    let rate = guess;
    for (let i = 0; i < maxIter; i++) {
        let npv = 0;
        let dnpv = 0;

        for (let t = 0; t < cashflows.length; t++) {
            const factor = Math.pow(1 + rate, t);
            npv += cashflows[t] / factor;
            if (t > 0) {
                dnpv -= t * cashflows[t] / (factor * (1 + rate));
            }
        }

        if (Math.abs(dnpv) < 1e-15) break;

        const newRate = rate - npv / dnpv;
        if (Math.abs(newRate - rate) < tol) return newRate;

        rate = newRate;

        // Guard against divergence
        if (rate < -0.99 || rate > 10) break;
    }

    // Bisection fallback
    let lo = -0.5;
    let hi = 5.0;
    const npvLo = calculateNPV(lo, cashflows);
    const npvHi = calculateNPV(hi, cashflows);

    if (npvLo * npvHi > 0) {
        // Try wider bounds
        lo = -0.9;
        hi = 10.0;
    }

    for (let i = 0; i < 500; i++) {
        const mid = (lo + hi) / 2;
        const npvMid = calculateNPV(mid, cashflows);

        if (Math.abs(npvMid) < 0.01) return mid;

        if (npvMid > 0) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    return (lo + hi) / 2;
}

/**
 * Calculate periodic payment (PMT)
 * @param {number} rate - Interest rate per period
 * @param {number} nper - Total number of periods
 * @param {number} pv - Present value (loan amount, positive)
 * @returns {number} Payment amount (positive)
 */
export function calculatePMT(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    const factor = Math.pow(1 + rate, nper);
    return (pv * rate * factor) / (factor - 1);
}

/**
 * Calculate Weighted Average Cost of Capital
 */
export function calculateWACC({ debtRatio, equityRatio, costOfDebt, costOfEquity, taxRate }) {
    return debtRatio * costOfDebt * (1 - taxRate) + equityRatio * costOfEquity;
}

/**
 * Calculate Multiple on Invested Capital
 */
export function calculateMOIC(totalReturns, totalInvested) {
    if (totalInvested <= 0) return 0;
    return totalReturns / totalInvested;
}

/**
 * Calculate Cash-on-Cash Return
 */
export function calculateCoC(totalReturns, totalInvested) {
    if (totalInvested <= 0) return 0;
    return (totalReturns - totalInvested) / totalInvested;
}

/**
 * Linear interpolation
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
