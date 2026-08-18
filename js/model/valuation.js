/**
 * Valuation Module
 * Comparable company analysis, precedent transactions, football field valuation
 */

import { getIndustryData, calculateCompsStats, calculatePrecedentStats } from '../utils/compsData.js';

/**
 * Run comparable company analysis
 * @param {Object} assumptions - Deal assumptions
 * @returns {Object} Comps analysis results with quartile positioning
 */
export function runCompsAnalysis(assumptions) {
    const industryKey = assumptions.industry || 'consumer';
    const data = getIndustryData(industryKey);
    const stats = calculateCompsStats(industryKey);

    const targetMetrics = {
        revenue: assumptions.ltmRevenue,
        ebitda: assumptions.ltmEBITDA,
        margin: (assumptions.ltmEBITDA / assumptions.ltmRevenue) * 100,
        growth: assumptions.revenueCAGR,
        evEbitda: assumptions.entryMultiple,
        evRevenue: (assumptions.ltmEBITDA * assumptions.entryMultiple) / assumptions.ltmRevenue,
        leverage: assumptions.debtRatio * assumptions.entryMultiple / (assumptions.ltmEBITDA / assumptions.ltmEBITDA), // Simplified
        pe: assumptions.entryMultiple * 1.8 // Rough P/E estimate
    };

    // Calculate target leverage properly
    const entryEV = assumptions.ltmEBITDA * assumptions.entryMultiple;
    const debt = entryEV * assumptions.debtRatio;
    targetMetrics.leverage = debt / assumptions.ltmEBITDA;

    // Calculate quartile positioning for the target
    const positioning = {};
    for (const metric of ['evEbitda', 'margin', 'growth', 'leverage']) {
        const sorted = data.companies.map(c => c[metric]).sort((a, b) => a - b);
        const targetVal = targetMetrics[metric];

        let rank = 0;
        for (const val of sorted) {
            if (targetVal >= val) rank++;
        }
        positioning[metric] = {
            percentile: (rank / sorted.length) * 100,
            rank: rank,
            total: sorted.length,
            value: targetVal
        };
    }

    // Implied valuation from comps
    const impliedEV_low = assumptions.ltmEBITDA * stats.evEbitda.q1;
    const impliedEV_mid = assumptions.ltmEBITDA * stats.evEbitda.median;
    const impliedEV_high = assumptions.ltmEBITDA * stats.evEbitda.q3;

    return {
        industryName: data.name,
        companies: data.companies,
        stats,
        targetMetrics,
        positioning,
        impliedValuation: {
            low: impliedEV_low,
            mid: impliedEV_mid,
            high: impliedEV_high
        }
    };
}

/**
 * Run precedent transaction analysis
 */
export function runPrecedentAnalysis(assumptions) {
    const industryKey = assumptions.industry || 'consumer';
    const data = getIndustryData(industryKey);
    const stats = calculatePrecedentStats(industryKey);

    const impliedEV_low = assumptions.ltmEBITDA * stats.evEbitda.min;
    const impliedEV_mid = assumptions.ltmEBITDA * stats.evEbitda.median;
    const impliedEV_high = assumptions.ltmEBITDA * stats.evEbitda.max;

    return {
        transactions: data.precedentTransactions,
        stats,
        impliedValuation: {
            low: impliedEV_low,
            mid: impliedEV_mid,
            high: impliedEV_high
        }
    };
}

/**
 * Build football field valuation chart data
 * Shows valuation ranges from different methodologies
 */
export function buildFootballField(assumptions, compsResult, precedentResult, returnsResult) {
    const entryEV = assumptions.ltmEBITDA * assumptions.entryMultiple;

    // 1. Trading Comps
    const comps = {
        label: 'Trading Comps',
        low: compsResult.impliedValuation.low,
        mid: compsResult.impliedValuation.mid,
        high: compsResult.impliedValuation.high,
        color: '#3b82f6'
    };

    // 2. Precedent Transactions
    const precedent = {
        label: 'Precedent Txns',
        low: precedentResult.impliedValuation.low,
        mid: precedentResult.impliedValuation.mid,
        high: precedentResult.impliedValuation.high,
        color: '#8b5cf6'
    };

    // 3. DCF Implied (using WACC range)
    const baseWACC = 0.12;
    const exitEBITDA = assumptions.ltmEBITDA * Math.pow(1 + assumptions.revenueCAGR / 100, assumptions.holdPeriod || 5) * (assumptions.targetMargin / 100) / (assumptions.ltmEBITDA / assumptions.ltmRevenue);
    // Simplified DCF: terminal value approach
    const dcfHigh = exitEBITDA * assumptions.exitMultiple / Math.pow(1 + baseWACC - 0.02, assumptions.holdPeriod || 5);
    const dcfMid = exitEBITDA * assumptions.exitMultiple / Math.pow(1 + baseWACC, assumptions.holdPeriod || 5);
    const dcfLow = exitEBITDA * assumptions.exitMultiple / Math.pow(1 + baseWACC + 0.02, assumptions.holdPeriod || 5);

    const dcf = {
        label: 'DCF Analysis',
        low: dcfLow,
        mid: dcfMid,
        high: dcfHigh,
        color: '#10b981'
    };

    // 4. LBO Implied (based on target IRR of 20-25%)
    // At what entry price does IRR = 20%? Approximate:
    const targetIRR_low = 0.25;
    const targetIRR_high = 0.20;
    const exitEquity = (exitEBITDA * assumptions.exitMultiple) - (entryEV * assumptions.debtRatio * 0.5); // Rough exit equity
    const lboLow = exitEquity / Math.pow(1 + targetIRR_low, assumptions.holdPeriod || 5) / (1 - assumptions.debtRatio) + entryEV * assumptions.debtRatio;
    const lboHigh = exitEquity / Math.pow(1 + targetIRR_high, assumptions.holdPeriod || 5) / (1 - assumptions.debtRatio) + entryEV * assumptions.debtRatio;
    const lboMid = (lboLow + lboHigh) / 2;

    const lbo = {
        label: 'LBO Implied',
        low: Math.min(lboLow, lboHigh),
        mid: lboMid,
        high: Math.max(lboLow, lboHigh),
        color: '#f59e0b'
    };

    return {
        methodologies: [comps, precedent, dcf, lbo],
        currentEV: entryEV,
        targetName: assumptions.targetName || 'Target Co.'
    };
}
