/**
 * Sensitivity Analysis Module
 * Tornado chart, 2-way sensitivity tables, breakeven analysis
 */

import { runModelLight } from '../model/engine.js';

/**
 * Variables to test in sensitivity analysis
 */
const SENSITIVITY_VARIABLES = [
    { key: 'exitMultiple', name: 'Exit Multiple', unit: 'x', pctRange: 0.20 },
    { key: 'revenueCAGR', name: 'Revenue CAGR', unit: '%', pctRange: 0.40 },
    { key: 'targetMargin', name: 'Target Margin', unit: '%', pctRange: 0.20 },
    { key: 'entryMultiple', name: 'Entry Multiple', unit: 'x', pctRange: 0.15 },
    { key: 'debtRatio', name: 'Debt / Total', unit: '%', pctRange: 0.20 },
    { key: 'seniorRate', name: 'Interest Rate', unit: '%', pctRange: 0.25 },
    { key: 'capexPercent', name: 'CapEx % Rev', unit: '%', pctRange: 0.30 },
    { key: 'holdPeriod', name: 'Hold Period', unit: 'yrs', pctRange: 0.40 }
];

/**
 * Run tornado sensitivity analysis
 * Tests each variable at ±range% and measures impact on IRR
 * @param {Object} baseAssumptions - Base deal assumptions
 * @returns {Object} Tornado chart data sorted by impact
 */
export function runTornadoAnalysis(baseAssumptions) {
    const baseResult = runModelLight(baseAssumptions);
    const baseIRR = baseResult.equityIRR;
    const baseMOIC = baseResult.moic;

    const results = [];

    for (const variable of SENSITIVITY_VARIABLES) {
        const baseValue = baseAssumptions[variable.key];
        if (baseValue === undefined || baseValue === null) continue;

        const range = variable.pctRange;

        // Low case (decrease variable)
        const lowAssumptions = { ...baseAssumptions };
        lowAssumptions[variable.key] = baseValue * (1 - range);
        // Hold period needs integer rounding
        if (variable.key === 'holdPeriod') {
            lowAssumptions[variable.key] = Math.max(3, Math.round(lowAssumptions[variable.key]));
        }
        const lowResult = runModelLight(lowAssumptions);

        // High case (increase variable)
        const highAssumptions = { ...baseAssumptions };
        highAssumptions[variable.key] = baseValue * (1 + range);
        if (variable.key === 'holdPeriod') {
            highAssumptions[variable.key] = Math.min(10, Math.round(highAssumptions[variable.key]));
        }
        const highResult = runModelLight(highAssumptions);

        const lowIRR = lowResult.equityIRR;
        const highIRR = highResult.equityIRR;
        const impact = Math.abs(highIRR - lowIRR);

        results.push({
            ...variable,
            baseValue,
            lowValue: lowAssumptions[variable.key],
            highValue: highAssumptions[variable.key],
            lowIRR,
            highIRR,
            baseIRR,
            impact,
            lowMOIC: lowResult.moic,
            highMOIC: highResult.moic,
            baseMOIC
        });
    }

    // Sort by impact (descending)
    results.sort((a, b) => b.impact - a.impact);

    return {
        baseIRR,
        baseMOIC,
        variables: results
    };
}

/**
 * Build 2-way sensitivity table
 * Rows: Exit Multiple, Columns: Revenue CAGR → IRR values
 * @param {Object} baseAssumptions
 * @returns {Object} 2-way table data
 */
export function buildTwoWayTable(baseAssumptions) {
    const exitMultiples = [];
    const baseExit = baseAssumptions.exitMultiple;
    for (let i = -3; i <= 3; i++) {
        exitMultiples.push(+(baseExit + i * 0.5).toFixed(1));
    }

    const revCAGRs = [];
    const baseCAGR = baseAssumptions.revenueCAGR;
    for (let i = -3; i <= 3; i++) {
        revCAGRs.push(+(baseCAGR + i * 1.5).toFixed(1));
    }

    const table = [];
    for (const exitMult of exitMultiples) {
        const row = [];
        for (const cagr of revCAGRs) {
            const adjusted = {
                ...baseAssumptions,
                exitMultiple: exitMult,
                revenueCAGR: Math.max(0, cagr)
            };
            const result = runModelLight(adjusted);
            row.push({
                irr: result.equityIRR,
                moic: result.moic,
                isBase: exitMult === baseExit && cagr === baseCAGR
            });
        }
        table.push(row);
    }

    return {
        rowLabel: 'Exit Multiple',
        colLabel: 'Revenue CAGR (%)',
        rowValues: exitMultiples,
        colValues: revCAGRs,
        table,
        baseRow: exitMultiples.indexOf(baseExit),
        baseCol: revCAGRs.indexOf(baseCAGR)
    };
}

/**
 * Breakeven analysis
 * Find minimum EBITDA growth to meet hurdle IRR
 */
export function runBreakevenAnalysis(baseAssumptions, hurdleRate = 0.20) {
    let lo = -5;
    let hi = 30;

    // Binary search for breakeven CAGR
    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        const adjusted = { ...baseAssumptions, revenueCAGR: mid };
        const result = runModelLight(adjusted);

        if (result.equityIRR > hurdleRate) {
            hi = mid;
        } else {
            lo = mid;
        }
    }

    const breakevenCAGR = (lo + hi) / 2;

    // Also find breakeven exit multiple
    lo = 3;
    hi = 20;
    for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        const adjusted = { ...baseAssumptions, exitMultiple: mid };
        const result = runModelLight(adjusted);

        if (result.equityIRR > hurdleRate) {
            hi = mid;
        } else {
            lo = mid;
        }
    }
    const breakevenMultiple = (lo + hi) / 2;

    return {
        hurdleRate,
        breakevenCAGR,
        breakevenMultiple,
        currentCAGR: baseAssumptions.revenueCAGR,
        currentMultiple: baseAssumptions.exitMultiple,
        cagrCushion: baseAssumptions.revenueCAGR - breakevenCAGR,
        multipleCushion: baseAssumptions.exitMultiple - breakevenMultiple
    };
}

export { SENSITIVITY_VARIABLES };
