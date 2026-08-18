/**
 * Value Creation Bridge
 * Decomposes total PE returns into:
 * 1. Revenue Growth Effect
 * 2. Margin Expansion Effect
 * 3. Multiple Expansion Effect
 * 4. Deleveraging (Debt Paydown)
 */

/**
 * Build value creation bridge from LBO results
 * @param {Object} lboResult - Complete LBO model output
 * @param {Object} assumptions - Deal assumptions
 * @returns {Object} Value creation decomposition
 */
export function buildValueCreationBridge(lboResult, assumptions) {
    const { sourcesUses, operatingModel, debtSchedule, exitAnalysis } = lboResult;
    const holdPeriod = assumptions.holdPeriod || 5;

    const entryEquity = sourcesUses.sources.equityContribution;
    const exitEquity = exitAnalysis.equityValueAtExit;
    const totalValueCreated = exitEquity - entryEquity;

    // Entry parameters
    const entryRevenue = assumptions.ltmRevenue;
    const entryEBITDA = assumptions.ltmEBITDA;
    const entryMargin = entryEBITDA / entryRevenue;
    const entryMultiple = assumptions.entryMultiple;
    const entryEV = entryEBITDA * entryMultiple;
    const entryDebt = sourcesUses.sources.seniorDebt + sourcesUses.sources.mezzanine;

    // Exit parameters
    const exitRevenue = exitAnalysis.exitRevenue;
    const exitEBITDA = exitAnalysis.exitEBITDA;
    const exitMargin = exitEBITDA / exitRevenue;
    const exitMultiple = exitAnalysis.exitMultiple;
    const exitEV = exitAnalysis.exitEV;
    const exitDebt = exitAnalysis.netDebtAtExit;

    // ═══════════════════════════════════════════
    // VALUE CREATION DECOMPOSITION
    // ═══════════════════════════════════════════

    // 1. Revenue Growth Effect (at entry margin & entry multiple)
    const revenueGrowthEffect = (exitRevenue - entryRevenue) * entryMargin * entryMultiple;

    // 2. Margin Expansion Effect (on exit revenue, at entry multiple)
    const marginExpansionEffect = exitRevenue * (exitMargin - entryMargin) * entryMultiple;

    // 3. Multiple Expansion Effect (on exit EBITDA)
    const multipleExpansionEffect = exitEBITDA * (exitMultiple - entryMultiple);

    // 4. Deleveraging Effect (debt paid down)
    const deleveragingEffect = entryDebt - exitDebt;

    // 5. Fees & Other (reconciliation item)
    const totalExplained = revenueGrowthEffect + marginExpansionEffect + multipleExpansionEffect + deleveragingEffect;
    const feesAndOther = totalValueCreated - totalExplained;

    // Percentage attribution
    const total = Math.abs(totalValueCreated) || 1;

    // ═══════════════════════════════════════════
    // OPERATIONAL IMPROVEMENT ANALYSIS
    // ═══════════════════════════════════════════

    const operationalImprovements = {
        revenueGrowth: {
            entry: entryRevenue,
            exit: exitRevenue,
            change: exitRevenue - entryRevenue,
            cagr: Math.pow(exitRevenue / entryRevenue, 1 / holdPeriod) - 1
        },
        ebitdaMargin: {
            entry: entryMargin,
            exit: exitMargin,
            expansion: exitMargin - entryMargin
        },
        ebitdaGrowth: {
            entry: entryEBITDA,
            exit: exitEBITDA,
            change: exitEBITDA - entryEBITDA,
            cagr: Math.pow(exitEBITDA / entryEBITDA, 1 / holdPeriod) - 1
        },
        leverage: {
            entry: entryDebt / entryEBITDA,
            exit: exitDebt / exitEBITDA,
            debtPaydown: entryDebt - exitDebt
        },
        multiple: {
            entry: entryMultiple,
            exit: exitMultiple,
            expansion: exitMultiple - entryMultiple
        }
    };

    return {
        entryEquity,
        exitEquity,
        totalValueCreated,

        // Bridge components
        bridge: {
            revenueGrowth: {
                value: revenueGrowthEffect,
                pct: revenueGrowthEffect / total
            },
            marginExpansion: {
                value: marginExpansionEffect,
                pct: marginExpansionEffect / total
            },
            multipleExpansion: {
                value: multipleExpansionEffect,
                pct: multipleExpansionEffect / total
            },
            deleveraging: {
                value: deleveragingEffect,
                pct: deleveragingEffect / total
            },
            feesAndOther: {
                value: feesAndOther,
                pct: feesAndOther / total
            }
        },

        // Operational details
        operations: operationalImprovements,

        // Summary for charts
        bridgeLabels: ['Entry Equity', 'Revenue Growth', 'Margin Expansion', 'Multiple Expansion', 'Deleveraging', 'Fees & Other', 'Exit Equity'],
        bridgeValues: [entryEquity, revenueGrowthEffect, marginExpansionEffect, multipleExpansionEffect, deleveragingEffect, feesAndOther, exitEquity],
        bridgeColors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#64748b', '#10b981']
    };
}

/**
 * Calculate improvement lever impact
 * @param {Object} assumptions - Base assumptions
 * @param {Object} levers - Improvement lever values
 * @returns {Object} Impact of each lever on EBITDA
 */
export function calculateLeverImpact(assumptions, levers) {
    const baseRevenue = assumptions.ltmRevenue;
    const baseEBITDA = assumptions.ltmEBITDA;
    const baseMargin = baseEBITDA / baseRevenue;
    const baseCOGS = baseRevenue * (assumptions.cogsPercent / 100);
    const baseSGA = baseRevenue * (assumptions.sgaPercent / 100);

    // Pricing optimization → Revenue uplift
    const pricingImpact = baseRevenue * (levers.pricingUplift / 100) * baseMargin;

    // Procurement savings → COGS reduction
    const procurementImpact = baseCOGS * (levers.procurementSavings / 100);

    // SG&A rationalization
    const sgaImpact = baseSGA * (levers.sgaReduction / 100);

    // Working capital improvement → interest savings (estimated)
    const nwcImpact = baseRevenue * (levers.nwcImprovement / 100) * 0.10; // 10% cost of capital

    const totalImpact = pricingImpact + procurementImpact + sgaImpact + nwcImpact;
    const newEBITDA = baseEBITDA + totalImpact;
    const newMargin = newEBITDA / (baseRevenue * (1 + levers.pricingUplift / 100));

    return {
        pricing: { impact: pricingImpact, label: 'Pricing Optimization' },
        procurement: { impact: procurementImpact, label: 'Procurement Savings' },
        sga: { impact: sgaImpact, label: 'SG&A Rationalization' },
        nwc: { impact: nwcImpact, label: 'Working Capital' },
        total: totalImpact,
        newEBITDA,
        newMargin,
        marginLift: newMargin - baseMargin
    };
}
