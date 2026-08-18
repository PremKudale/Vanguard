/**
 * Export & Investment Memo Generator
 * Auto-generates professional IC memo, CSV export, print-to-PDF
 */

import { formatCurrency, formatPercent, formatMultiple, formatScore, getRecommendation } from './format.js';

/**
 * Generate Investment Committee Memo HTML
 * @param {Object} results - Full model results
 * @param {Object} ddResult - Due diligence scorecard
 * @param {Object} scenarioResult - Scenario analysis
 * @returns {string} HTML string for memo
 */
export function generateInvestmentMemo(results, ddResult, scenarioResult) {
    const { lbo, returns, valueCreation, assumptions } = results;
    const rec = getRecommendation(ddResult.overallScore);
    const today = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
        <div class="memo-header">
            <div class="memo-badge">Confidential | Investment Committee Memorandum</div>
            <h1>${assumptions.targetName || 'Target Company'}</h1>
            <div class="memo-subtitle">${assumptions.industryName || 'Consumer Products'} · Potential Acquisition</div>
            <div class="memo-date">Prepared: ${today} · Vanguard PE Advisory</div>
        </div>

        <!-- Recommendation -->
        <div class="memo-recommendation ${rec.class}">
            <div class="rec-label">Investment Recommendation</div>
            <div class="rec-value" style="color: ${rec.color}">${rec.icon} ${rec.label}</div>
            <div class="rec-rationale">
                Based on ${formatPercent(returns.equityIRR)} Equity IRR, ${formatMultiple(returns.moic)} MOIC, 
                and DD score of ${formatScore(ddResult.overallScore)}.
                ${returns.meetsHurdle ? 'Returns exceed 20% hurdle rate.' : 'Returns below 20% hurdle rate. Additional review recommended.'}
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="memo-section">
            <h2>📊 Key Metrics</h2>
            <div class="memo-metrics">
                <div class="memo-metric">
                    <div class="mm-label">Entry EV</div>
                    <div class="mm-value">${formatCurrency(returns.entryEV)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">Equity Check</div>
                    <div class="mm-value">${formatCurrency(returns.equityInvested)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">Equity IRR</div>
                    <div class="mm-value" style="color: ${returns.equityIRR >= 0.20 ? '#10b981' : '#f59e0b'}">${formatPercent(returns.equityIRR)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">MOIC</div>
                    <div class="mm-value">${formatMultiple(returns.moic)}</div>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="memo-section">
            <h2>📋 Executive Summary</h2>
            <p>
                We recommend ${rec.label === 'Strong Buy' || rec.label === 'Buy' ? 'proceeding with' : 'further review of'} 
                the acquisition of <strong>${assumptions.targetName}</strong>, a ${assumptions.industryName || 'consumer products'} company 
                with LTM revenue of ${formatCurrency(assumptions.ltmRevenue)} and LTM EBITDA of ${formatCurrency(assumptions.ltmEBITDA)} 
                (${formatPercent(assumptions.ltmEBITDA / assumptions.ltmRevenue)} margin).
            </p>
            <p>
                At an entry valuation of ${formatMultiple(assumptions.entryMultiple)} EV/EBITDA (${formatCurrency(returns.entryEV)} EV), 
                the deal generates a ${formatPercent(returns.equityIRR)} Equity IRR and ${formatMultiple(returns.moic)} MOIC over a 
                ${assumptions.holdPeriod || 5}-year hold period, with an exit at ${formatMultiple(assumptions.exitMultiple)} EV/EBITDA.
            </p>

            <h3>Investment Thesis</h3>
            <ul>
                <li><strong>Revenue Growth:</strong> ${formatPercent(assumptions.revenueCAGR / 100)} CAGR driven by distribution expansion, new product launches, and market share gains in a growing ${assumptions.industryName || 'consumer'} market.</li>
                <li><strong>Margin Expansion:</strong> EBITDA margin improvement from ${formatPercent(assumptions.ltmEBITDA / assumptions.ltmRevenue)} to ${formatPercent(assumptions.targetMargin / 100)} through procurement optimization, SG&A rationalization, and operational efficiencies.</li>
                <li><strong>Deleveraging:</strong> Strong free cash flow enables debt reduction from ${formatMultiple(returns.entryLeverage)} to ${formatMultiple(returns.exitLeverage)} over the hold period, creating ${formatCurrency(returns.debtPaydown)} of equity value through deleveraging.</li>
            </ul>
        </div>

        <!-- Financial Summary -->
        <div class="memo-section">
            <h2>💰 Financial Summary</h2>
            <table class="memo-table">
                <thead>
                    <tr><th>Metric</th><th>Value</th></tr>
                </thead>
                <tbody>
                    <tr><td>LTM Revenue</td><td>${formatCurrency(assumptions.ltmRevenue)}</td></tr>
                    <tr><td>LTM EBITDA</td><td>${formatCurrency(assumptions.ltmEBITDA)}</td></tr>
                    <tr><td>LTM EBITDA Margin</td><td>${formatPercent(assumptions.ltmEBITDA / assumptions.ltmRevenue)}</td></tr>
                    <tr><td>Entry EV/EBITDA</td><td>${formatMultiple(assumptions.entryMultiple)}</td></tr>
                    <tr><td>Enterprise Value</td><td>${formatCurrency(returns.entryEV)}</td></tr>
                    <tr><td>Equity Check</td><td>${formatCurrency(returns.equityInvested)}</td></tr>
                    <tr><td>Total Debt</td><td>${formatCurrency(lbo.sourcesUses.sources.seniorDebt)}</td></tr>
                    <tr><td>Entry Leverage</td><td>${formatMultiple(returns.entryLeverage)}</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Capital Structure -->
        <div class="memo-section">
            <h2>🏗️ Capital Structure: Sources & Uses</h2>
            <table class="memo-table">
                <thead>
                    <tr><th>Sources</th><th>Amount</th></tr>
                </thead>
                <tbody>
                    <tr><td>Senior Debt</td><td>${formatCurrency(lbo.sourcesUses.sources.seniorDebt)}</td></tr>
                    ${lbo.sourcesUses.sources.mezzanine > 0 ? `<tr><td>Mezzanine</td><td>${formatCurrency(lbo.sourcesUses.sources.mezzanine)}</td></tr>` : ''}
                    <tr><td>Sponsor Equity</td><td>${formatCurrency(lbo.sourcesUses.sources.equityContribution)}</td></tr>
                    <tr style="font-weight:700;border-top:2px solid rgba(255,255,255,0.1)"><td><strong>Total Sources</strong></td><td><strong>${formatCurrency(lbo.sourcesUses.sources.totalSources)}</strong></td></tr>
                </tbody>
            </table>
            <table class="memo-table" style="margin-top:14px">
                <thead>
                    <tr><th>Uses</th><th>Amount</th></tr>
                </thead>
                <tbody>
                    <tr><td>Enterprise Value</td><td>${formatCurrency(lbo.sourcesUses.uses.enterpriseValue)}</td></tr>
                    <tr><td>Transaction Fees</td><td>${formatCurrency(lbo.sourcesUses.uses.transactionFees)}</td></tr>
                    <tr><td>Financing Fees</td><td>${formatCurrency(lbo.sourcesUses.uses.financingFees)}</td></tr>
                    <tr style="font-weight:700;border-top:2px solid rgba(255,255,255,0.1)"><td><strong>Total Uses</strong></td><td><strong>${formatCurrency(lbo.sourcesUses.uses.totalUses)}</strong></td></tr>
                </tbody>
            </table>
        </div>

        <!-- Returns Analysis -->
        <div class="memo-section">
            <h2>📈 Returns Analysis</h2>
            <div class="memo-metrics">
                <div class="memo-metric">
                    <div class="mm-label">Equity IRR</div>
                    <div class="mm-value" style="color: ${returns.equityIRR >= 0.20 ? '#10b981' : '#f59e0b'}">${formatPercent(returns.equityIRR)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">MOIC</div>
                    <div class="mm-value">${formatMultiple(returns.moic)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">Cash-on-Cash</div>
                    <div class="mm-value">${formatPercent(returns.cashOnCash)}</div>
                </div>
                <div class="memo-metric">
                    <div class="mm-label">Exit EV</div>
                    <div class="mm-value">${formatCurrency(returns.exitEV)}</div>
                </div>
            </div>

            ${scenarioResult ? `
            <h3>Scenario Analysis</h3>
            <table class="memo-table">
                <thead>
                    <tr><th>Scenario</th><th>Equity IRR</th><th>MOIC</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(scenarioResult.scenarios).map(([key, s]) => `
                        <tr>
                            <td>${s.name}</td>
                            <td style="font-family: var(--font-mono); font-weight: 600;">${formatPercent(s.metrics.equityIRR)}</td>
                            <td style="font-family: var(--font-mono); font-weight: 600;">${formatMultiple(s.metrics.moic)}</td>
                        </tr>
                    `).join('')}
                    <tr style="font-weight:700;border-top:2px solid rgba(255,255,255,0.1)">
                        <td><strong>Prob-Weighted</strong></td>
                        <td style="font-family: var(--font-mono); font-weight: 700;">${formatPercent(scenarioResult.weighted.irr)}</td>
                        <td style="font-family: var(--font-mono); font-weight: 700;">${formatMultiple(scenarioResult.weighted.moic)}</td>
                    </tr>
                </tbody>
            </table>
            ` : ''}
        </div>

        <!-- Value Creation -->
        <div class="memo-section">
            <h2>🎯 Value Creation Plan</h2>
            <p>Total equity value creation of ${formatCurrency(valueCreation.totalValueCreated)} decomposed as follows:</p>
            <table class="memo-table">
                <thead><tr><th>Component</th><th>Value (₹ Cr)</th><th>% of Total</th></tr></thead>
                <tbody>
                    <tr><td>Revenue Growth</td><td>${formatCurrency(valueCreation.bridge.revenueGrowth.value)}</td><td>${formatPercent(valueCreation.bridge.revenueGrowth.pct)}</td></tr>
                    <tr><td>Margin Expansion</td><td>${formatCurrency(valueCreation.bridge.marginExpansion.value)}</td><td>${formatPercent(valueCreation.bridge.marginExpansion.pct)}</td></tr>
                    <tr><td>Multiple Expansion</td><td>${formatCurrency(valueCreation.bridge.multipleExpansion.value)}</td><td>${formatPercent(valueCreation.bridge.multipleExpansion.pct)}</td></tr>
                    <tr><td>Deleveraging</td><td>${formatCurrency(valueCreation.bridge.deleveraging.value)}</td><td>${formatPercent(valueCreation.bridge.deleveraging.pct)}</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Due Diligence -->
        <div class="memo-section">
            <h2>🔍 Due Diligence Assessment</h2>
            <p>Overall DD score: <strong>${formatScore(ddResult.overallScore)}</strong> (${ddResult.overallStatus.label})</p>
            <table class="memo-table">
                <thead><tr><th>Dimension</th><th>Score</th><th>Status</th></tr></thead>
                <tbody>
                    ${Object.values(ddResult.dimensions).map(d => `
                        <tr>
                            <td>${d.icon} ${d.name}</td>
                            <td style="font-family: var(--font-mono); font-weight: 600;">${d.averageScore.toFixed(1)}/5</td>
                            <td><span class="badge ${d.status.class}">${d.status.label}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            ${ddResult.flags.length > 0 ? `
                <h3>Key Risks & Mitigants</h3>
                <div class="risk-mitigant-table">
                    ${ddResult.flags.slice(0, 5).map(f => `
                        <div class="risk-mitigant-row">
                            <div class="risk-col">${f.message}</div>
                            <div class="mitigant-col">To be addressed through post-acquisition improvement plan</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>

        <!-- Disclaimer -->
        <div class="memo-section" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border-primary);">
            <p style="font-size: 0.72rem; color: var(--text-muted); text-align: center; line-height: 1.6;">
                <em>This memorandum is prepared for illustrative purposes. All projections are based on management estimates 
                and market research. Actual results may vary. Generated by Vanguard PE Analytics Platform.</em>
            </p>
        </div>
    `;
}

/**
 * Export financial data to CSV
 */
export function exportToCSV(results) {
    const { lbo } = results;
    const operatingModel = lbo.operatingModel;

    let csv = 'Operating Model - Vanguard PE\n\n';
    csv += 'Year,Revenue (Cr),EBITDA (Cr),EBITDA Margin,D&A (Cr),EBIT (Cr),Interest (Cr),EBT (Cr),Tax (Cr),Net Income (Cr),CapEx (Cr),FCFE (Cr)\n';

    for (const y of operatingModel) {
        csv += `${y.label},${y.revenue.toFixed(1)},${y.ebitda.toFixed(1)},${(y.ebitdaMargin * 100).toFixed(1)}%,`;
        csv += `${y.dna.toFixed(1)},${y.ebit.toFixed(1)},${y.interestExpense.toFixed(1)},${y.ebt.toFixed(1)},`;
        csv += `${y.taxExpense.toFixed(1)},${y.netIncome.toFixed(1)},${y.capex.toFixed(1)},${y.fcfe.toFixed(1)}\n`;
    }

    csv += '\n\nDebt Schedule\n';
    csv += 'Year,Opening Balance,Interest,Principal,Cash Sweep,Closing Balance,Leverage\n';
    for (const d of lbo.debtSchedule) {
        csv += `${d.label},${d.senior.opening.toFixed(1)},${d.senior.interest.toFixed(1)},`;
        csv += `${(d.senior.mandatoryAmort || 0).toFixed(1)},${(d.senior.cashSweep || 0).toFixed(1)},`;
        csv += `${d.senior.closing.toFixed(1)},${d.leverage.toFixed(1)}x\n`;
    }

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vanguard_pe_model_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Print memo (opens print dialog)
 */
export function printMemo() {
    window.print();
}
