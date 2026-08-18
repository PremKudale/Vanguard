/**
 * LBO Model Engine
 * Builds complete Leveraged Buyout model:
 * - Sources & Uses
 * - 5-Year Operating Model
 * - Debt Schedule
 * - Exit Analysis
 */

import { calculatePMT } from '../utils/financial.js';

/**
 * Build complete LBO model from assumptions
 * @param {Object} a - Assumptions object
 * @returns {Object} Complete LBO model results
 */
export function buildLBOModel(a) {
    const sourcesUses = buildSourcesAndUses(a);
    const operatingModel = buildOperatingModel(a);
    const debtSchedule = buildDebtSchedule(a, sourcesUses, operatingModel);
    const exitAnalysis = buildExitAnalysis(a, operatingModel, debtSchedule);

    return { sourcesUses, operatingModel, debtSchedule, exitAnalysis };
}

/**
 * Build Sources & Uses table
 */
function buildSourcesAndUses(a) {
    const enterpriseValue = a.ltmEBITDA * a.entryMultiple;
    const transactionFees = enterpriseValue * (a.transactionFees / 100);
    const financingFees = enterpriseValue * a.debtRatio * (a.financingFees / 100);
    const totalUses = enterpriseValue + transactionFees + financingFees;

    const seniorDebt = enterpriseValue * a.debtRatio;
    const mezzanine = enterpriseValue * (a.mezzRatio || 0);
    const equityContribution = totalUses - seniorDebt - mezzanine;

    return {
        uses: {
            enterpriseValue,
            transactionFees,
            financingFees,
            totalUses
        },
        sources: {
            seniorDebt,
            mezzanine,
            equityContribution,
            totalSources: seniorDebt + mezzanine + equityContribution
        }
    };
}

/**
 * Build 5-year operating model projections
 */
function buildOperatingModel(a) {
    const years = [];
    const holdPeriod = a.holdPeriod || 5;
    const entryMargin = a.ltmEBITDA / a.ltmRevenue;
    const targetMargin = a.targetMargin / 100;
    const marginStep = (targetMargin - entryMargin) / holdPeriod;

    for (let y = 0; y <= holdPeriod; y++) {
        const isLTM = y === 0;
        const revenue = isLTM ? a.ltmRevenue : a.ltmRevenue * Math.pow(1 + a.revenueCAGR / 100, y);
        const ebitdaMargin = entryMargin + marginStep * y;
        const ebitda = revenue * ebitdaMargin;

        const dna = revenue * (a.dnaPercent / 100);
        const ebit = ebitda - dna;

        const capex = revenue * (a.capexPercent / 100);
        const nwcDays = a.nwcDays || 30;
        const nwc = revenue * nwcDays / 365;

        let changeInNWC = 0;
        if (y > 0) {
            const prevRevenue = y === 1 ? a.ltmRevenue : a.ltmRevenue * Math.pow(1 + a.revenueCAGR / 100, y - 1);
            const prevNWC = prevRevenue * nwcDays / 365;
            changeInNWC = nwc - prevNWC;
        }

        // Unlevered Free Cash Flow (before debt service)
        const ufcf = ebitda - capex - changeInNWC;

        years.push({
            year: y,
            label: isLTM ? 'LTM' : `Year ${y}`,
            revenue,
            revenueGrowth: isLTM ? 0 : a.revenueCAGR / 100,
            ebitda,
            ebitdaMargin,
            dna,
            ebit,
            capex,
            nwc,
            changeInNWC,
            ufcf,
            // Interest, tax, FCFE will be calculated after debt schedule
            interestExpense: 0,
            mezzInterest: 0,
            ebt: 0,
            taxExpense: 0,
            netIncome: 0,
            fcfe: 0
        });
    }

    return years;
}

/**
 * Build debt amortization schedule
 */
function buildDebtSchedule(a, sourcesUses, operatingModel) {
    const schedule = [];
    const holdPeriod = a.holdPeriod || 5;
    const seniorDebt = sourcesUses.sources.seniorDebt;
    const mezzanine = sourcesUses.sources.mezzanine;
    const seniorRate = a.seniorRate / 100;
    const mezzRate = (a.mezzRate || 0) / 100;
    const loanTenor = a.loanTenor || 6;
    const cashSweepPct = (a.cashSweepPct || 50) / 100;

    // Calculate mandatory amortization (level PMT over loan tenor)
    const annualPMT = seniorDebt > 0 ? calculatePMT(seniorRate, loanTenor, seniorDebt) : 0;

    let seniorBalance = seniorDebt;
    let mezzBalance = mezzanine;

    for (let y = 0; y <= holdPeriod; y++) {
        const isLTM = y === 0;

        if (isLTM) {
            schedule.push({
                year: y,
                label: 'LTM',
                senior: {
                    opening: seniorDebt,
                    interest: 0,
                    mandatoryAmort: 0,
                    cashSweep: 0,
                    closing: seniorDebt
                },
                mezz: {
                    opening: mezzanine,
                    pikInterest: 0,
                    cashInterest: 0,
                    closing: mezzanine
                },
                totalDebt: seniorDebt + mezzanine,
                leverage: operatingModel[0].ebitda > 0 ? (seniorDebt + mezzanine) / operatingModel[0].ebitda : 0
            });
            continue;
        }

        const seniorInterest = seniorBalance * seniorRate;
        let mandatoryPrincipal = Math.min(annualPMT - seniorInterest, seniorBalance);
        mandatoryPrincipal = Math.max(0, mandatoryPrincipal);

        // Mezzanine PIK interest (capitalizes)
        const mezzPIK = mezzBalance * mezzRate;
        const mezzCashInterest = 0; // All PIK for simplicity

        // Calculate CFADS for cash sweep
        const ebitda = operatingModel[y].ebitda;
        const capex = operatingModel[y].capex;
        const changeNWC = operatingModel[y].changeInNWC;
        const cfads = ebitda - seniorInterest - mezzCashInterest - capex - changeNWC;

        // Excess cash flow for sweep = CFADS - mandatory principal
        const excessCF = Math.max(0, cfads - mandatoryPrincipal);
        const cashSweep = Math.min(excessCF * cashSweepPct, seniorBalance - mandatoryPrincipal);
        const actualCashSweep = Math.max(0, cashSweep);

        const totalPrincipal = mandatoryPrincipal + actualCashSweep;
        const seniorClosing = Math.max(0, seniorBalance - totalPrincipal);
        const mezzClosing = mezzBalance + mezzPIK;

        // Update operating model with interest & tax
        const totalInterest = seniorInterest + mezzCashInterest;
        const ebt = operatingModel[y].ebit - totalInterest;
        const taxExpense = ebt > 0 ? ebt * (a.taxRate / 100) : 0;
        const netIncome = ebt - taxExpense;
        const fcfe = netIncome + operatingModel[y].dna - capex - changeNWC - totalPrincipal;

        operatingModel[y].interestExpense = seniorInterest;
        operatingModel[y].mezzInterest = mezzCashInterest;
        operatingModel[y].ebt = ebt;
        operatingModel[y].taxExpense = taxExpense;
        operatingModel[y].netIncome = netIncome;
        operatingModel[y].fcfe = fcfe;

        schedule.push({
            year: y,
            label: `Year ${y}`,
            senior: {
                opening: seniorBalance,
                interest: seniorInterest,
                mandatoryAmort: mandatoryPrincipal,
                cashSweep: actualCashSweep,
                totalRepayment: totalPrincipal,
                closing: seniorClosing
            },
            mezz: {
                opening: mezzBalance,
                pikInterest: mezzPIK,
                cashInterest: mezzCashInterest,
                closing: mezzClosing
            },
            totalDebt: seniorClosing + mezzClosing,
            leverage: ebitda > 0 ? (seniorClosing + mezzClosing) / ebitda : 0
        });

        seniorBalance = seniorClosing;
        mezzBalance = mezzClosing;
    }

    return schedule;
}

/**
 * Build exit analysis
 */
function buildExitAnalysis(a, operatingModel, debtSchedule) {
    const holdPeriod = a.holdPeriod || 5;
    const exitYear = operatingModel[holdPeriod];
    const exitDebt = debtSchedule[holdPeriod];

    const exitEBITDA = exitYear.ebitda;
    const exitMultiple = a.exitMultiple;
    const exitEV = exitEBITDA * exitMultiple;
    const netDebtAtExit = exitDebt.totalDebt;
    const equityValueAtExit = exitEV - netDebtAtExit;

    return {
        exitYear: holdPeriod,
        exitRevenue: exitYear.revenue,
        exitEBITDA,
        exitEBITDAMargin: exitYear.ebitdaMargin,
        exitMultiple,
        exitEV,
        netDebtAtExit,
        equityValueAtExit,
        entryEV: a.ltmEBITDA * a.entryMultiple,
        entryEBITDA: a.ltmEBITDA
    };
}
