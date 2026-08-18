/**
 * Vanguard PE - Application Orchestrator
 * Main entry point: wires up assumptions, model, charts, and UI
 */

import { AssumptionsManager } from './assumptions.js';
import { runModel } from './model/engine.js';
import { calculateDDScorecard, DEFAULT_DD_SCORES, DD_DIMENSIONS } from './analysis/dueDiligence.js';
import { runScenarioAnalysis } from './analysis/scenarios.js';
import { runTornadoAnalysis, buildTwoWayTable, runBreakevenAnalysis } from './analysis/sensitivity.js';
import { ChartManager } from './charts/chartManager.js';
import {
    getOperatingTrendConfig, getDebtScheduleConfig, getLeverageConfig,
    getWaterfallConfig, getRadarConfig, getTornadoConfig,
    getFootballFieldConfig, getMarginTrendConfig
} from './charts/chartConfigs.js';
import { formatCurrency, formatPercent, formatMultiple, formatScore, getScoreColor } from './utils/format.js';
import { generateInvestmentMemo, exportToCSV, printMemo } from './utils/export.js';
import { calculateLeverImpact } from './model/valueCreation.js';

class App {
    constructor() {
        this.assumptions = new AssumptionsManager();
        this.charts = new ChartManager();
        this.results = null;
        this.ddResult = null;
        this.scenarioResult = null;
        this.ddScores = JSON.parse(JSON.stringify(DEFAULT_DD_SCORES));
        this.activeTab = 'deal-overview';
    }

    init() {
        this.assumptions.bindInputs();
        this.setupTabNavigation();
        this.setupSidebar();
        this.setupExportButtons();
        this.setupDDInteractivity();

        // Listen for assumption changes
        this.assumptions.onChange(() => this.recalculate());

        // Initial calculation
        this.recalculate();

        // Resize charts on window resize
        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => this.charts.resizeAll(), 200);
        });
    }

    // ═══════════════════════════════════════════
    // MODEL EXECUTION
    // ═══════════════════════════════════════════

    recalculate() {
        try {
            const a = this.assumptions.get();
            this.results = runModel(a);
            this.ddResult = calculateDDScorecard(this.ddScores);
            this.updateKPIBar();
            this.renderActiveTab();
        } catch (e) {
            console.error('Model calculation error:', e);
        }
    }

    // ═══════════════════════════════════════════
    // KPI BAR
    // ═══════════════════════════════════════════

    updateKPIBar() {
        const r = this.results.returns;
        const dd = this.ddResult;

        this.setKPI('kpi-ev', formatCurrency(r.entryEV));
        this.setKPI('kpi-equity', formatCurrency(r.equityInvested));

        const irrEl = document.getElementById('kpi-irr');
        if (irrEl) {
            irrEl.textContent = formatPercent(r.equityIRR);
            irrEl.className = 'kpi-value ' + (r.equityIRR >= 0.20 ? 'positive' : r.equityIRR >= 0.12 ? 'warning' : 'negative');
        }

        this.setKPI('kpi-moic', formatMultiple(r.moic));

        const levEl = document.getElementById('kpi-leverage');
        if (levEl) {
            levEl.textContent = formatMultiple(r.entryLeverage);
            levEl.className = 'kpi-value ' + (r.entryLeverage <= 4.0 ? 'positive' : r.entryLeverage <= 5.5 ? 'warning' : 'negative');
        }

        const ddEl = document.getElementById('kpi-dd');
        if (ddEl) {
            ddEl.textContent = formatScore(dd.overallScore);
            ddEl.style.color = getScoreColor(dd.overallScore);
        }

        // Update deal name in header
        const dealNameEl = document.getElementById('deal-name');
        if (dealNameEl) dealNameEl.textContent = `- ${this.assumptions.get().targetName}`;
    }

    setKPI(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // ═══════════════════════════════════════════
    // TAB NAVIGATION
    // ═══════════════════════════════════════════

    setupTabNavigation() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabId) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabId)?.classList.add('active');

        this.activeTab = tabId;
        this.renderActiveTab();
    }

    renderActiveTab() {
        if (!this.results) return;

        switch (this.activeTab) {
            case 'deal-overview': this.renderDealOverview(); break;
            case 'lbo-model': this.renderLBOModel(); break;
            case 'value-creation': this.renderValueCreation(); break;
            case 'due-diligence': this.renderDueDiligence(); break;
            case 'comps': this.renderComps(); break;
            case 'scenarios': this.renderScenarios(); break;
            case 'memo': this.renderMemo(); break;
        }
    }

    // ═══════════════════════════════════════════
    // SIDEBAR
    // ═══════════════════════════════════════════

    setupSidebar() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const closeBtn = document.getElementById('sidebar-close');
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main-content');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                main.classList.toggle('sidebar-open');
                setTimeout(() => this.charts.resizeAll(), 400);
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('open');
                main.classList.remove('sidebar-open');
                setTimeout(() => this.charts.resizeAll(), 400);
            });
        }

        // Collapsible sections
        document.querySelectorAll('.sidebar-section-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('collapsed');
            });
        });

        // Reset button
        const resetBtn = document.getElementById('btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.assumptions.reset();
                this.ddScores = JSON.parse(JSON.stringify(DEFAULT_DD_SCORES));
                this.recalculate();
            });
        }
    }

    // ═══════════════════════════════════════════
    // EXPORT BUTTONS
    // ═══════════════════════════════════════════

    setupExportButtons() {
        document.getElementById('btn-export-csv')?.addEventListener('click', () => exportToCSV(this.results));
        document.getElementById('btn-print-memo')?.addEventListener('click', () => printMemo());
    }

    // ═══════════════════════════════════════════
    // TAB 1: DEAL OVERVIEW
    // ═══════════════════════════════════════════

    renderDealOverview() {
        const { lbo, returns, valueCreation } = this.results;
        const a = this.assumptions.get();

        // Overview metric cards
        const metrics = [
            { id: 'ov-entry-ev', val: formatCurrency(returns.entryEV), sub: `${formatMultiple(a.entryMultiple)} EV/EBITDA` },
            { id: 'ov-exit-ev', val: formatCurrency(returns.exitEV), sub: `${formatMultiple(a.exitMultiple)} EV/EBITDA` },
            { id: 'ov-equity-irr', val: formatPercent(returns.equityIRR), cls: returns.equityIRR >= 0.20 ? 'positive' : 'warning' },
            { id: 'ov-moic', val: formatMultiple(returns.moic) },
            { id: 'ov-equity-check', val: formatCurrency(returns.equityInvested), sub: `${((1 - a.debtRatio) * 100).toFixed(0)}% of EV` },
            { id: 'ov-total-debt', val: formatCurrency(lbo.sourcesUses.sources.seniorDebt), sub: `${formatMultiple(returns.entryLeverage)} leverage` },
            { id: 'ov-exit-equity', val: formatCurrency(returns.equityAtExit), cls: 'positive' },
            { id: 'ov-total-return', val: formatCurrency(returns.totalReturn), cls: 'positive' }
        ];

        metrics.forEach(m => {
            const el = document.getElementById(m.id);
            if (el) {
                el.textContent = m.val;
                if (m.cls) el.className = 'metric-value ' + m.cls;
            }
            if (m.sub) {
                const subEl = document.getElementById(m.id + '-sub');
                if (subEl) subEl.textContent = m.sub;
            }
        });

        // Charts
        this.charts.createOrUpdate('chart-operating-trend', getOperatingTrendConfig(lbo.operatingModel));
        this.charts.createOrUpdate('chart-margin-trend', getMarginTrendConfig(lbo.operatingModel));
    }

    // ═══════════════════════════════════════════
    // TAB 2: LBO MODEL
    // ═══════════════════════════════════════════

    renderLBOModel() {
        const { lbo, returns } = this.results;

        // Sources & Uses
        this.renderSourcesUses(lbo.sourcesUses);

        // Operating Model Table
        this.renderOperatingTable(lbo.operatingModel);

        // Debt Schedule Table
        this.renderDebtTable(lbo.debtSchedule);

        // Charts
        this.charts.createOrUpdate('chart-debt-schedule', getDebtScheduleConfig(lbo.debtSchedule));
        this.charts.createOrUpdate('chart-leverage', getLeverageConfig(lbo.debtSchedule));
    }

    renderSourcesUses(su) {
        const container = document.getElementById('sources-uses-content');
        if (!container) return;

        container.innerHTML = `
            <div class="su-table">
                <div class="su-section-header">Uses</div>
                <div class="su-row"><span class="su-label">Enterprise Value</span><span class="su-value">${formatCurrency(su.uses.enterpriseValue)}</span></div>
                <div class="su-row"><span class="su-label">Transaction Fees</span><span class="su-value">${formatCurrency(su.uses.transactionFees)}</span></div>
                <div class="su-row"><span class="su-label">Financing Fees</span><span class="su-value">${formatCurrency(su.uses.financingFees)}</span></div>
                <div class="su-total"><span>Total Uses</span><span>${formatCurrency(su.uses.totalUses)}</span></div>
            </div>
            <div class="su-table" style="margin-top:16px">
                <div class="su-section-header">Sources</div>
                <div class="su-row"><span class="su-label">Senior Debt</span><span class="su-value">${formatCurrency(su.sources.seniorDebt)}</span></div>
                ${su.sources.mezzanine > 0 ? `<div class="su-row"><span class="su-label">Mezzanine</span><span class="su-value">${formatCurrency(su.sources.mezzanine)}</span></div>` : ''}
                <div class="su-row"><span class="su-label">Sponsor Equity</span><span class="su-value">${formatCurrency(su.sources.equityContribution)}</span></div>
                <div class="su-total"><span>Total Sources</span><span>${formatCurrency(su.sources.totalSources)}</span></div>
            </div>
        `;
    }

    renderOperatingTable(model) {
        const tbody = document.getElementById('operating-tbody');
        if (!tbody) return;

        const rows = [
            { label: 'Revenue', key: 'revenue', format: 'currency' },
            { label: 'Revenue Growth', key: 'revenueGrowth', format: 'percent', skipFirst: true },
            { label: 'EBITDA', key: 'ebitda', format: 'currency', bold: true },
            { label: 'EBITDA Margin', key: 'ebitdaMargin', format: 'percent' },
            { label: 'D&A', key: 'dna', format: 'currency' },
            { label: 'EBIT', key: 'ebit', format: 'currency' },
            { label: 'Interest', key: 'interestExpense', format: 'currency' },
            { label: 'EBT', key: 'ebt', format: 'currency' },
            { label: 'Tax', key: 'taxExpense', format: 'currency' },
            { label: 'Net Income', key: 'netIncome', format: 'currency', bold: true },
            { label: 'CapEx', key: 'capex', format: 'currency' },
            { label: 'FCFE', key: 'fcfe', format: 'currency', bold: true }
        ];

        tbody.innerHTML = rows.map(row => {
            const cells = model.map((y, i) => {
                if (row.skipFirst && i === 0) return '<td>—</td>';
                const val = y[row.key];
                let formatted;
                if (row.format === 'currency') formatted = val.toFixed(1);
                else if (row.format === 'percent') formatted = (val * 100).toFixed(1) + '%';
                else formatted = val.toFixed(1);

                const cls = row.format === 'currency' && val < 0 ? ' class="negative"' : '';
                return `<td${cls}>${formatted}</td>`;
            }).join('');

            const rowClass = row.bold ? ' class="total-row"' : '';
            return `<tr${rowClass}><td>${row.label}</td>${cells}</tr>`;
        }).join('');
    }

    renderDebtTable(schedule) {
        const tbody = document.getElementById('debt-tbody');
        if (!tbody) return;

        tbody.innerHTML = schedule.map(d => {
            return `<tr>
                <td>${d.label}</td>
                <td>${d.senior.opening.toFixed(1)}</td>
                <td>${d.senior.interest.toFixed(1)}</td>
                <td>${(d.senior.mandatoryAmort || 0).toFixed(1)}</td>
                <td>${(d.senior.cashSweep || 0).toFixed(1)}</td>
                <td>${d.senior.closing.toFixed(1)}</td>
                <td>${d.leverage.toFixed(1)}x</td>
            </tr>`;
        }).join('');
    }

    // ═══════════════════════════════════════════
    // TAB 3: VALUE CREATION
    // ═══════════════════════════════════════════

    renderValueCreation() {
        const vc = this.results.valueCreation;
        const a = this.assumptions.get();

        // Bridge metrics
        const bridgeData = [
            { id: 'vc-rev-growth', val: formatCurrency(vc.bridge.revenueGrowth.value), pct: formatPercent(vc.bridge.revenueGrowth.pct) },
            { id: 'vc-margin-exp', val: formatCurrency(vc.bridge.marginExpansion.value), pct: formatPercent(vc.bridge.marginExpansion.pct) },
            { id: 'vc-multiple-exp', val: formatCurrency(vc.bridge.multipleExpansion.value), pct: formatPercent(vc.bridge.multipleExpansion.pct) },
            { id: 'vc-deleveraging', val: formatCurrency(vc.bridge.deleveraging.value), pct: formatPercent(vc.bridge.deleveraging.pct) }
        ];

        bridgeData.forEach(b => {
            const el = document.getElementById(b.id);
            if (el) el.textContent = b.val;
            const pctEl = document.getElementById(b.id + '-pct');
            if (pctEl) pctEl.textContent = b.pct;
        });

        // Before/After cards
        const ops = vc.operations;
        this.setKPI('vc-entry-rev', formatCurrency(ops.revenueGrowth.entry));
        this.setKPI('vc-exit-rev', formatCurrency(ops.revenueGrowth.exit));
        this.setKPI('vc-entry-margin', formatPercent(ops.ebitdaMargin.entry));
        this.setKPI('vc-exit-margin', formatPercent(ops.ebitdaMargin.exit));
        this.setKPI('vc-entry-leverage', formatMultiple(ops.leverage.entry));
        this.setKPI('vc-exit-leverage', formatMultiple(ops.leverage.exit));
        this.setKPI('vc-entry-ebitda', formatCurrency(ops.ebitdaGrowth.entry));
        this.setKPI('vc-exit-ebitda', formatCurrency(ops.ebitdaGrowth.exit));

        // Lever impact
        const levers = calculateLeverImpact(a, {
            pricingUplift: a.pricingUplift,
            procurementSavings: a.procurementSavings,
            sgaReduction: a.sgaReduction,
            nwcImprovement: a.nwcImprovement
        });

        this.setKPI('lever-pricing', `+₹${levers.pricing.impact.toFixed(1)} Cr`);
        this.setKPI('lever-procurement', `+₹${levers.procurement.impact.toFixed(1)} Cr`);
        this.setKPI('lever-sga', `+₹${levers.sga.impact.toFixed(1)} Cr`);
        this.setKPI('lever-nwc', `+₹${levers.nwc.impact.toFixed(1)} Cr`);

        // Waterfall chart
        this.charts.createOrUpdate('chart-waterfall', getWaterfallConfig(vc));
    }

    // ═══════════════════════════════════════════
    // TAB 4: DUE DILIGENCE
    // ═══════════════════════════════════════════

    renderDueDiligence() {
        const dd = this.ddResult;

        // Overall score
        this.setKPI('dd-overall-score', formatScore(dd.overallScore));
        const overallEl = document.getElementById('dd-overall-score');
        if (overallEl) overallEl.style.color = getScoreColor(dd.overallScore);

        // Recommendation
        const recEl = document.getElementById('dd-recommendation');
        if (recEl) {
            recEl.className = `recommendation-badge ${dd.recommendation.class}`;
            recEl.innerHTML = `${dd.recommendation.icon} ${dd.recommendation.label}`;
        }

        // Render dimension cards
        const grid = document.getElementById('dd-grid');
        if (grid) {
            grid.innerHTML = Object.entries(dd.dimensions).map(([key, dim]) => `
                <div class="dd-card" style="--dim-color: ${dim.color}">
                    <div class="dd-card-header">
                        <div class="dd-card-title">
                            <span class="dd-icon">${dim.icon}</span>
                            ${dim.name}
                        </div>
                        <span class="dd-card-score" style="color: ${dim.status.color}">${dim.averageScore.toFixed(1)}</span>
                    </div>
                    <div class="dd-criteria-list">
                        ${dim.criteria.map(c => `
                            <div class="dd-criterion">
                                <span class="dd-criterion-name">${c.name}</span>
                                <div class="dd-criterion-score">
                                    ${[1,2,3,4,5].map(i => `
                                        <div class="dd-dot ${i <= c.score ? 'filled ' + c.status.label.toLowerCase() : ''}"></div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // Risk flags
        const flagsList = document.getElementById('dd-flags');
        if (flagsList) {
            if (dd.flags.length === 0) {
                flagsList.innerHTML = '<div class="empty-state"><span class="empty-icon">✅</span><span class="empty-text">No significant risks identified</span></div>';
            } else {
                flagsList.innerHTML = dd.flags.map(f => `
                    <li class="flag-item ${f.type}">
                        <span class="flag-icon">${f.type === 'critical' ? '🔴' : '🟡'}</span>
                        <div class="flag-content">
                            <div class="flag-title">${f.dimension}: ${f.criterion}</div>
                            <div class="flag-desc">${f.message}</div>
                        </div>
                    </li>
                `).join('');
            }
        }

        // Radar chart
        this.charts.createOrUpdate('chart-radar', getRadarConfig(dd.radarData));
    }

    setupDDInteractivity() {
        // DD scores can be adjusted via clicking on dots
        document.addEventListener('click', (e) => {
            const dot = e.target.closest('.dd-dot');
            if (!dot) return;

            const criterion = dot.closest('.dd-criterion');
            const card = dot.closest('.dd-card');
            if (!criterion || !card) return;

            const dots = Array.from(criterion.querySelectorAll('.dd-dot'));
            const newScore = dots.indexOf(dot) + 1;
            const criterionName = criterion.querySelector('.dd-criterion-name')?.textContent;

            // Find dimension and criterion keys
            for (const [dimKey, dimConfig] of Object.entries(DD_DIMENSIONS)) {
                for (const c of dimConfig.criteria) {
                    if (c.name === criterionName) {
                        this.ddScores[dimKey][c.id] = newScore;
                        this.ddResult = calculateDDScorecard(this.ddScores);
                        this.renderDueDiligence();
                        this.updateKPIBar();
                        return;
                    }
                }
            }
        });
    }

    // ═══════════════════════════════════════════
    // TAB 5: COMPS & VALUATION
    // ═══════════════════════════════════════════

    renderComps() {
        const { comps, precedent, footballField } = this.results;
        const a = this.assumptions.get();

        // Comps table
        const compsTbody = document.getElementById('comps-tbody');
        if (compsTbody) {
            let rows = comps.companies.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.revenue.toLocaleString('en-IN')}</td>
                    <td>${c.ebitda.toLocaleString('en-IN')}</td>
                    <td>${c.margin.toFixed(1)}%</td>
                    <td>${c.growth.toFixed(1)}%</td>
                    <td>${c.evEbitda.toFixed(1)}x</td>
                    <td>${c.evRevenue.toFixed(1)}x</td>
                    <td>${c.pe.toFixed(1)}x</td>
                    <td>${c.leverage.toFixed(1)}x</td>
                </tr>
            `).join('');

            // Target company row
            rows += `
                <tr class="target-row">
                    <td>▸ ${a.targetName}</td>
                    <td>${a.ltmRevenue.toLocaleString('en-IN')}</td>
                    <td>${a.ltmEBITDA.toLocaleString('en-IN')}</td>
                    <td>${(a.ltmEBITDA / a.ltmRevenue * 100).toFixed(1)}%</td>
                    <td>${a.revenueCAGR.toFixed(1)}%</td>
                    <td>${a.entryMultiple.toFixed(1)}x</td>
                    <td>${(a.ltmEBITDA * a.entryMultiple / a.ltmRevenue).toFixed(1)}x</td>
                    <td>—</td>
                    <td>${(a.debtRatio * a.entryMultiple).toFixed(1)}x</td>
                </tr>
            `;

            // Stats rows
            const s = comps.stats;
            rows += `
                <tr class="stats-row"><td>Median</td><td></td><td></td><td>${s.margin.median.toFixed(1)}%</td><td>${s.growth.median.toFixed(1)}%</td><td>${s.evEbitda.median.toFixed(1)}x</td><td>${s.evRevenue.median.toFixed(1)}x</td><td>${s.pe.median.toFixed(1)}x</td><td>${s.leverage.median.toFixed(1)}x</td></tr>
                <tr class="stats-row"><td>Mean</td><td></td><td></td><td>${s.margin.mean.toFixed(1)}%</td><td>${s.growth.mean.toFixed(1)}%</td><td>${s.evEbitda.mean.toFixed(1)}x</td><td>${s.evRevenue.mean.toFixed(1)}x</td><td>${s.pe.mean.toFixed(1)}x</td><td>${s.leverage.mean.toFixed(1)}x</td></tr>
            `;

            compsTbody.innerHTML = rows;
        }

        // Precedent transactions table
        const precTbody = document.getElementById('precedent-tbody');
        if (precTbody) {
            precTbody.innerHTML = precedent.transactions.map(t => `
                <tr>
                    <td>${t.target}</td>
                    <td>${t.acquirer}</td>
                    <td>${t.year}</td>
                    <td>₹${t.dealSize} Cr</td>
                    <td>${t.evEbitda.toFixed(1)}x</td>
                    <td>${t.evRevenue.toFixed(1)}x</td>
                </tr>
            `).join('');
        }

        // Football field chart
        this.charts.createOrUpdate('chart-football', getFootballFieldConfig(footballField));

        // Implied valuation metrics
        this.setKPI('comps-implied-low', formatCurrency(comps.impliedValuation.low));
        this.setKPI('comps-implied-mid', formatCurrency(comps.impliedValuation.mid));
        this.setKPI('comps-implied-high', formatCurrency(comps.impliedValuation.high));
    }

    // ═══════════════════════════════════════════
    // TAB 6: SCENARIOS & SENSITIVITY
    // ═══════════════════════════════════════════

    renderScenarios() {
        const a = this.assumptions.get();

        // Run analyses (these are compute-intensive, only run when tab is active)
        this.scenarioResult = runScenarioAnalysis(a);
        const tornado = runTornadoAnalysis(a);
        const twoWay = buildTwoWayTable(a);
        const breakeven = runBreakevenAnalysis(a);

        // Scenario cards
        const scenarioGrid = document.getElementById('scenario-grid');
        if (scenarioGrid) {
            scenarioGrid.innerHTML = Object.entries(this.scenarioResult.scenarios).map(([key, s]) => `
                <div class="scenario-card ${key}">
                    <div class="scenario-header">
                        <span class="scenario-name">${s.icon} ${s.name}</span>
                        <span class="badge" style="background:${s.colorDim};color:${s.color};border:1px solid ${s.color}30">${s.description.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div class="scenario-metrics">
                        <div class="scenario-metric">
                            <span class="scenario-metric-label">Equity IRR</span>
                            <span class="scenario-metric-value" style="color:${s.metrics.equityIRR >= 0.20 ? '#10b981' : s.metrics.equityIRR >= 0.12 ? '#f59e0b' : '#ef4444'}">${formatPercent(s.metrics.equityIRR)}</span>
                        </div>
                        <div class="scenario-metric">
                            <span class="scenario-metric-label">MOIC</span>
                            <span class="scenario-metric-value">${formatMultiple(s.metrics.moic)}</span>
                        </div>
                        <div class="scenario-metric">
                            <span class="scenario-metric-label">Entry EV</span>
                            <span class="scenario-metric-value">${formatCurrency(s.metrics.entryEV)}</span>
                        </div>
                        <div class="scenario-metric">
                            <span class="scenario-metric-label">Exit EV</span>
                            <span class="scenario-metric-value">${formatCurrency(s.metrics.exitEV)}</span>
                        </div>
                        <div class="scenario-metric">
                            <span class="scenario-metric-label">Exit Leverage</span>
                            <span class="scenario-metric-value">${formatMultiple(s.metrics.exitLeverage)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Probability-weighted returns
        this.setKPI('weighted-irr', formatPercent(this.scenarioResult.weighted.irr));
        this.setKPI('weighted-moic', formatMultiple(this.scenarioResult.weighted.moic));

        // Tornado chart
        this.charts.createOrUpdate('chart-tornado', getTornadoConfig(tornado));

        // 2-way table
        const twoWayEl = document.getElementById('two-way-table');
        if (twoWayEl) {
            let html = '<table class="sensitivity-table"><thead><tr>';
            html += `<th>${twoWay.rowLabel} \\ ${twoWay.colLabel}</th>`;
            twoWay.colValues.forEach((c, ci) => {
                html += `<th${ci === twoWay.baseCol ? ' style="color:var(--accent-blue)"' : ''}>${c.toFixed(1)}%</th>`;
            });
            html += '</tr></thead><tbody>';

            twoWay.rowValues.forEach((r, ri) => {
                html += `<tr><td style="font-weight:600;text-align:left;${ri === twoWay.baseRow ? 'color:var(--accent-blue)' : ''}">${r.toFixed(1)}x</td>`;
                twoWay.table[ri].forEach((cell, ci) => {
                    const irr = cell.irr;
                    let heatClass = '';
                    if (irr >= 0.25) heatClass = 'heat-green';
                    else if (irr >= 0.20) heatClass = 'heat-light-green';
                    else if (irr >= 0.15) heatClass = 'heat-yellow';
                    else if (irr >= 0.10) heatClass = 'heat-orange';
                    else heatClass = 'heat-red';

                    const highlight = cell.isBase ? ' highlight' : '';
                    html += `<td class="${heatClass}${highlight}">${formatPercent(irr)}</td>`;
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            twoWayEl.innerHTML = html;
        }

        // Breakeven
        this.setKPI('breakeven-cagr', `${breakeven.breakevenCAGR.toFixed(1)}%`);
        this.setKPI('breakeven-multiple', `${breakeven.breakevenMultiple.toFixed(1)}x`);
        this.setKPI('breakeven-cagr-cushion', `+${breakeven.cagrCushion.toFixed(1)} pp`);
        this.setKPI('breakeven-mult-cushion', `+${breakeven.multipleCushion.toFixed(1)}x`);
    }

    // ═══════════════════════════════════════════
    // TAB 7: INVESTMENT MEMO
    // ═══════════════════════════════════════════

    renderMemo() {
        if (!this.scenarioResult) {
            this.scenarioResult = runScenarioAnalysis(this.assumptions.get());
        }

        const memoContent = document.getElementById('memo-content');
        if (memoContent) {
            memoContent.innerHTML = generateInvestmentMemo(this.results, this.ddResult, this.scenarioResult);
        }
    }
}

// ═══════════════════════════════════════════
// INITIALIZE ON DOM READY
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Expose for debugging
    window.__vanguardPE = app;
});
