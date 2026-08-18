/**
 * Scenario Analysis Module
 * Management Case / Base Case / Downside Case
 */

import { runModelLight } from '../model/engine.js';

/**
 * Define scenario adjustments
 */
const SCENARIO_DEFINITIONS = {
    management: {
        name: 'Management Case',
        icon: '🚀',
        color: '#10b981',
        colorDim: 'rgba(16, 185, 129, 0.15)',
        description: 'Optimistic case with management projections',
        adjustments: {
            revenueCAGR: 1.25,        // 25% higher growth
            targetMargin: 1.10,        // 10% higher margin
            exitMultiple: 1.10,        // 10% higher exit multiple
            seniorRate: 0.95,          // 5% lower rate
            capexPercent: 0.90,        // 10% lower capex
            transactionFees: 1.0,
            debtRatio: 1.0
        }
    },
    base: {
        name: 'Base Case',
        icon: '📊',
        color: '#3b82f6',
        colorDim: 'rgba(59, 130, 246, 0.15)',
        description: 'Conservative underwriting assumptions',
        adjustments: {
            revenueCAGR: 1.0,
            targetMargin: 1.0,
            exitMultiple: 1.0,
            seniorRate: 1.0,
            capexPercent: 1.0,
            transactionFees: 1.0,
            debtRatio: 1.0
        }
    },
    downside: {
        name: 'Downside Case',
        icon: '⚠️',
        color: '#f59e0b',
        colorDim: 'rgba(245, 158, 11, 0.15)',
        description: 'Stress test with adverse conditions',
        adjustments: {
            revenueCAGR: 0.60,        // 40% lower growth
            targetMargin: 0.85,        // 15% lower margin target
            exitMultiple: 0.85,        // 15% lower exit multiple
            seniorRate: 1.15,          // 15% higher rate
            capexPercent: 1.20,        // 20% higher capex
            transactionFees: 1.0,
            debtRatio: 1.0
        }
    }
};

/**
 * Run scenario analysis
 * @param {Object} baseAssumptions - Base deal assumptions
 * @returns {Object} Results for each scenario
 */
export function runScenarioAnalysis(baseAssumptions) {
    const results = {};

    for (const [key, scenario] of Object.entries(SCENARIO_DEFINITIONS)) {
        // Apply adjustments to create scenario assumptions
        const scenarioAssumptions = createScenarioAssumptions(baseAssumptions, scenario.adjustments);
        const modelResult = runModelLight(scenarioAssumptions);

        results[key] = {
            ...scenario,
            assumptions: scenarioAssumptions,
            metrics: modelResult,
            // Key display metrics
            display: {
                equityIRR: modelResult.equityIRR,
                moic: modelResult.moic,
                entryEV: modelResult.entryEV,
                exitEV: modelResult.exitEV,
                equityInvested: modelResult.equityInvested,
                equityAtExit: modelResult.equityAtExit,
                entryLeverage: modelResult.entryLeverage,
                exitLeverage: modelResult.exitLeverage,
                debtPaydown: modelResult.debtPaydown
            }
        };
    }

    // Calculate probability-weighted returns (50% base, 30% mgmt, 20% downside)
    const weights = { management: 0.30, base: 0.50, downside: 0.20 };
    const weightedIRR = Object.entries(weights).reduce((sum, [key, w]) => {
        return sum + (results[key].metrics.equityIRR || 0) * w;
    }, 0);
    const weightedMOIC = Object.entries(weights).reduce((sum, [key, w]) => {
        return sum + (results[key].metrics.moic || 0) * w;
    }, 0);

    return {
        scenarios: results,
        weighted: {
            irr: weightedIRR,
            moic: weightedMOIC,
            weights
        }
    };
}

/**
 * Create scenario-adjusted assumptions
 */
function createScenarioAssumptions(base, adjustments) {
    return {
        ...base,
        revenueCAGR: base.revenueCAGR * adjustments.revenueCAGR,
        targetMargin: base.targetMargin * adjustments.targetMargin,
        exitMultiple: base.exitMultiple * adjustments.exitMultiple,
        seniorRate: base.seniorRate * adjustments.seniorRate,
        capexPercent: base.capexPercent * adjustments.capexPercent,
        transactionFees: base.transactionFees * adjustments.transactionFees,
        debtRatio: base.debtRatio * adjustments.debtRatio
    };
}

export { SCENARIO_DEFINITIONS };
