/**
 * Returns Calculator
 * IRR, MOIC, Cash-on-Cash, DPI calculations
 */

import { calculateIRR, calculateMOIC, calculateCoC } from '../utils/financial.js';

/**
 * Calculate all return metrics from LBO results
 * @param {Object} lboResult - Complete LBO model output
 * @param {Object} assumptions - Deal assumptions
 * @returns {Object} Comprehensive return metrics
 */
export function calculateReturns(lboResult, assumptions) {
    const { sourcesUses, operatingModel, debtSchedule, exitAnalysis } = lboResult;
    const holdPeriod = assumptions.holdPeriod || 5;

    const equityInvested = sourcesUses.sources.equityContribution;
    const equityAtExit = exitAnalysis.equityValueAtExit;

    // ═══════════════════════════════════════════
    // IRR CALCULATION
    // ═══════════════════════════════════════════

    // Build equity cash flow stream: negative investment at t=0, exit proceeds at t=n
    // No intermediate dividends assumed (all cash used for debt paydown)
    const equityCashflows = [-equityInvested];
    for (let y = 1; y <= holdPeriod; y++) {
        if (y === holdPeriod) {
            equityCashflows.push(equityAtExit);
        } else {
            equityCashflows.push(0); // No interim distributions
        }
    }

    const equityIRR = calculateIRR(equityCashflows);

    // ═══════════════════════════════════════════
    // MOIC & CASH-ON-CASH
    // ═══════════════════════════════════════════

    const moic = calculateMOIC(equityAtExit, equityInvested);
    const coc = calculateCoC(equityAtExit, equityInvested);

    // ═══════════════════════════════════════════
    // GROSS / NET RETURNS
    // ═══════════════════════════════════════════

    // Gross IRR (before fees) - approximate by adding back transaction fees
    const grossEquityInvested = equityInvested - (sourcesUses.uses.transactionFees + sourcesUses.uses.financingFees);
    const grossCashflows = [-grossEquityInvested];
    for (let y = 1; y <= holdPeriod; y++) {
        if (y === holdPeriod) {
            grossCashflows.push(equityAtExit);
        } else {
            grossCashflows.push(0);
        }
    }
    const grossIRR = calculateIRR(grossCashflows);
    const grossMOIC = calculateMOIC(equityAtExit, grossEquityInvested);

    // ═══════════════════════════════════════════
    // PAYBACK PERIOD
    // ═══════════════════════════════════════════

    let cumulativeCF = -equityInvested;
    let paybackPeriod = holdPeriod;
    for (let y = 1; y <= holdPeriod; y++) {
        const fcfe = operatingModel[y].fcfe;
        cumulativeCF += fcfe;
        if (cumulativeCF >= 0 && paybackPeriod === holdPeriod) {
            // Linear interpolation for exact payback
            const prevCum = cumulativeCF - fcfe;
            paybackPeriod = y - 1 + Math.abs(prevCum) / fcfe;
        }
    }

    // ═══════════════════════════════════════════
    // LEVERAGE METRICS
    // ═══════════════════════════════════════════

    const entryLeverage = (sourcesUses.sources.seniorDebt + sourcesUses.sources.mezzanine) / assumptions.ltmEBITDA;
    const exitLeverage = exitAnalysis.netDebtAtExit / exitAnalysis.exitEBITDA;
    const debtPaydown = (sourcesUses.sources.seniorDebt + sourcesUses.sources.mezzanine) - exitAnalysis.netDebtAtExit;

    return {
        // Primary returns
        equityIRR,
        moic,
        cashOnCash: coc,
        grossIRR,
        grossMOIC,

        // Cash flows
        equityInvested,
        equityAtExit,
        totalReturn: equityAtExit - equityInvested,
        equityCashflows,

        // Payback
        paybackPeriod,

        // Leverage
        entryLeverage,
        exitLeverage,
        debtPaydown,
        deleveraging: entryLeverage - exitLeverage,

        // Entry/Exit summary
        entryEV: exitAnalysis.entryEV,
        exitEV: exitAnalysis.exitEV,
        evExpansion: exitAnalysis.exitEV - exitAnalysis.entryEV,

        // Flags
        meetsHurdle: equityIRR >= 0.20, // 20% hurdle rate
        isAttractive: equityIRR >= 0.25 && moic >= 2.5
    };
}
