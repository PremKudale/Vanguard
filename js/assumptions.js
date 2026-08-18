/**
 * Assumptions Manager
 * Manages deal parameters, validation, defaults, and industry presets
 */

import { getIndustryData } from './utils/compsData.js';

/**
 * Default deal assumptions - "Project Atlas" Consumer Products case
 */
export const DEFAULT_ASSUMPTIONS = {
    // Deal parameters
    targetName: 'Atlas Consumer Products',
    industry: 'consumer',
    industryName: 'Consumer Products',
    ltmRevenue: 1200,        // ₹ Crores
    ltmEBITDA: 180,          // ₹ Crores (15% margin)

    // Valuation
    entryMultiple: 8.0,      // EV/EBITDA
    exitMultiple: 9.0,       // EV/EBITDA

    // Capital structure
    debtRatio: 0.60,         // 60% debt
    mezzRatio: 0.0,          // 0% mezzanine
    seniorRate: 10.0,        // 10% interest rate
    mezzRate: 14.0,          // 14% mezzanine rate (PIK)
    loanTenor: 6,            // 6-year loan
    cashSweepPct: 50,        // 50% excess cash flow sweep

    // Operating assumptions
    revenueCAGR: 8.0,        // 8% annual growth
    targetMargin: 20.0,      // 20% target EBITDA margin
    cogsPercent: 55.0,       // 55% cost of goods
    sgaPercent: 18.0,        // 18% SG&A
    dnaPercent: 3.0,         // 3% D&A as % of revenue
    capexPercent: 3.5,       // 3.5% CapEx as % of revenue
    nwcDays: 35,             // Net working capital days

    // Tax & fees
    taxRate: 25.2,           // 25.2% corporate tax
    transactionFees: 2.0,    // 2% of EV
    financingFees: 1.5,      // 1.5% of debt

    // Hold period
    holdPeriod: 5,           // 5 years

    // Value creation levers
    pricingUplift: 2.0,      // 2% revenue uplift from pricing
    procurementSavings: 3.0, // 3% COGS reduction
    sgaReduction: 5.0,       // 5% SG&A rationalization
    nwcImprovement: 10.0     // 10% NWC improvement (days reduction)
};

/**
 * Assumptions Manager class
 */
export class AssumptionsManager {
    constructor() {
        this.assumptions = { ...DEFAULT_ASSUMPTIONS };
        this.listeners = [];
        this.inputBindings = {};
    }

    /**
     * Get current assumptions
     */
    get() {
        return { ...this.assumptions };
    }

    /**
     * Update a single assumption
     */
    set(key, value) {
        if (this.assumptions[key] !== value) {
            this.assumptions[key] = value;
            this.notifyListeners();
        }
    }

    /**
     * Update multiple assumptions
     */
    update(updates) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if (this.assumptions[key] !== value) {
                this.assumptions[key] = value;
                changed = true;
            }
        }
        if (changed) this.notifyListeners();
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.assumptions = { ...DEFAULT_ASSUMPTIONS };
        this.syncInputs();
        this.notifyListeners();
    }

    /**
     * Subscribe to changes
     */
    onChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners
     */
    notifyListeners() {
        const data = this.get();
        for (const cb of this.listeners) {
            cb(data);
        }
    }

    /**
     * Bind sidebar inputs to assumptions
     */
    bindInputs() {
        const bindings = [
            { id: 'inp-target-name', key: 'targetName', type: 'text' },
            { id: 'inp-industry', key: 'industry', type: 'select' },
            { id: 'inp-ltm-revenue', key: 'ltmRevenue', type: 'number' },
            { id: 'inp-ltm-ebitda', key: 'ltmEBITDA', type: 'number' },
            { id: 'inp-entry-multiple', key: 'entryMultiple', type: 'number', step: 0.5 },
            { id: 'inp-exit-multiple', key: 'exitMultiple', type: 'number', step: 0.5 },
            { id: 'inp-debt-ratio', key: 'debtRatio', type: 'percent' },
            { id: 'inp-senior-rate', key: 'seniorRate', type: 'number', step: 0.5 },
            { id: 'inp-loan-tenor', key: 'loanTenor', type: 'number', step: 1 },
            { id: 'inp-cash-sweep', key: 'cashSweepPct', type: 'number', step: 5 },
            { id: 'inp-revenue-cagr', key: 'revenueCAGR', type: 'number', step: 0.5 },
            { id: 'inp-target-margin', key: 'targetMargin', type: 'number', step: 0.5 },
            { id: 'inp-cogs-pct', key: 'cogsPercent', type: 'number', step: 1 },
            { id: 'inp-sga-pct', key: 'sgaPercent', type: 'number', step: 0.5 },
            { id: 'inp-dna-pct', key: 'dnaPercent', type: 'number', step: 0.5 },
            { id: 'inp-capex-pct', key: 'capexPercent', type: 'number', step: 0.5 },
            { id: 'inp-nwc-days', key: 'nwcDays', type: 'number', step: 5 },
            { id: 'inp-tax-rate', key: 'taxRate', type: 'number', step: 0.5 },
            { id: 'inp-txn-fees', key: 'transactionFees', type: 'number', step: 0.5 },
            { id: 'inp-fin-fees', key: 'financingFees', type: 'number', step: 0.5 },
            { id: 'inp-hold-period', key: 'holdPeriod', type: 'number', step: 1 },
            { id: 'inp-pricing-uplift', key: 'pricingUplift', type: 'range' },
            { id: 'inp-procurement-savings', key: 'procurementSavings', type: 'range' },
            { id: 'inp-sga-reduction', key: 'sgaReduction', type: 'range' },
            { id: 'inp-nwc-improvement', key: 'nwcImprovement', type: 'range' }
        ];

        for (const binding of bindings) {
            const el = document.getElementById(binding.id);
            if (!el) continue;

            this.inputBindings[binding.key] = el;

            // Set initial value
            if (binding.type === 'percent') {
                el.value = (this.assumptions[binding.key] * 100).toFixed(0);
            } else {
                el.value = this.assumptions[binding.key];
            }

            // Listen for changes
            const eventType = binding.type === 'range' ? 'input' : 'change';
            el.addEventListener(eventType, () => {
                let value;
                if (binding.type === 'text' || binding.type === 'select') {
                    value = el.value;
                } else if (binding.type === 'percent') {
                    value = parseFloat(el.value) / 100;
                } else {
                    value = parseFloat(el.value);
                }

                if (binding.type !== 'text' && binding.type !== 'select' && isNaN(value)) return;

                this.assumptions[binding.key] = value;

                // Update slider display
                if (binding.type === 'range') {
                    const display = document.getElementById(binding.id + '-val');
                    if (display) display.textContent = value.toFixed(1) + '%';
                }

                // Special: if industry changes, update benchmarks
                if (binding.key === 'industry') {
                    this.onIndustryChange(value);
                }

                this.notifyListeners();
            });
        }
    }

    /**
     * Handle industry change - load benchmarks
     */
    onIndustryChange(industryKey) {
        const data = getIndustryData(industryKey);
        this.assumptions.industryName = data.name;
    }

    /**
     * Sync input elements to current assumption values
     */
    syncInputs() {
        for (const [key, el] of Object.entries(this.inputBindings)) {
            if (!el) continue;

            const value = this.assumptions[key];
            if (key === 'debtRatio') {
                el.value = (value * 100).toFixed(0);
            } else {
                el.value = value;
            }

            // Update range display
            if (el.type === 'range') {
                const display = document.getElementById(el.id + '-val');
                if (display) display.textContent = value.toFixed(1) + '%';
            }
        }
    }
}
