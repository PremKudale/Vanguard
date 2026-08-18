/**
 * Central Model Orchestrator
 * Runs all sub-models in sequence and aggregates results
 */

import { buildLBOModel } from './lbo.js';
import { buildValueCreationBridge } from './valueCreation.js';
import { calculateReturns } from './returns.js';
import { runCompsAnalysis, runPrecedentAnalysis, buildFootballField } from './valuation.js';

/**
 * Run complete PE analysis model
 * @param {Object} assumptions - Complete deal assumptions
 * @returns {Object} All model results
 */
export function runModel(assumptions) {
    // 1. Build LBO Model (Sources & Uses, Operating Model, Debt Schedule, Exit)
    const lboResult = buildLBOModel(assumptions);

    // 2. Calculate Returns (IRR, MOIC, etc.)
    const returnsResult = calculateReturns(lboResult, assumptions);

    // 3. Build Value Creation Bridge
    const valueCreation = buildValueCreationBridge(lboResult, assumptions);

    // 4. Run Comps Analysis
    const compsResult = runCompsAnalysis(assumptions);

    // 5. Run Precedent Transaction Analysis
    const precedentResult = runPrecedentAnalysis(assumptions);

    // 6. Build Football Field Valuation
    const footballField = buildFootballField(assumptions, compsResult, precedentResult, returnsResult);

    return {
        lbo: lboResult,
        returns: returnsResult,
        valueCreation,
        comps: compsResult,
        precedent: precedentResult,
        footballField,
        assumptions,
        timestamp: new Date().toISOString()
    };
}

/**
 * Run model with custom assumptions (for scenario/sensitivity analysis)
 * Returns only key metrics for efficiency
 */
export function runModelLight(assumptions) {
    const lboResult = buildLBOModel(assumptions);
    const returnsResult = calculateReturns(lboResult, assumptions);

    return {
        equityIRR: returnsResult.equityIRR,
        moic: returnsResult.moic,
        grossIRR: returnsResult.grossIRR,
        entryEV: returnsResult.entryEV,
        exitEV: returnsResult.exitEV,
        equityInvested: returnsResult.equityInvested,
        equityAtExit: returnsResult.equityAtExit,
        entryLeverage: returnsResult.entryLeverage,
        exitLeverage: returnsResult.exitLeverage,
        exitEBITDA: lboResult.exitAnalysis.exitEBITDA,
        exitMargin: lboResult.exitAnalysis.exitEBITDAMargin,
        debtPaydown: returnsResult.debtPaydown,
        paybackPeriod: returnsResult.paybackPeriod
    };
}
