# Vanguard PE: Private Equity Portfolio Intelligence & Due Diligence Platform

<div align="center">

**A professional-grade PE analysis platform with full LBO modeling, value creation bridge, due diligence scorecards, comparable company analysis, and automated investment committee memo generation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4.4-FF6384?logo=chartdotjs)](https://www.chartjs.org/)
![Status](https://img.shields.io/badge/Status-Production-10b981)

</div>

---

## Overview

**Vanguard PE** is an interactive web-based private equity analysis platform that models the complete PE investment lifecycle: from deal screening and LBO modeling, through due diligence and value creation planning, to exit analysis and investment committee reporting.

Built as a case study around **Project Atlas**, a hypothetical mid-market consumer products turnaround (Rs.1,200 Cr revenue, Rs.180 Cr EBITDA), it demonstrates institutional-grade PE analytics used by firms like Alvarez & Marsal, Bain Capital, and KKR.

The platform runs a **complete LBO model** with 5-year operating projections, debt schedules, value creation decomposition, and multi-methodology valuation, all computed in real-time as assumptions change.

### Key Capabilities

| Category | Features |
|----------|----------|
| **LBO Modeling** | Sources & Uses, 5-year operating model, debt schedule with amortization and cash sweep |
| **Value Creation** | Waterfall bridge (revenue growth, margin expansion, multiple expansion, deleveraging) |
| **Due Diligence** | 6-dimension scorecard (Commercial, Operational, Financial, Legal, ESG, IT/Digital) |
| **Comps & Valuation** | Trading comps, precedent transactions, football field valuation chart |
| **Returns Analysis** | Equity IRR (Newton-Raphson), MOIC, Cash-on-Cash, payback period |
| **Scenario Analysis** | Management / Base / Downside cases with probability-weighted returns |
| **Sensitivity** | Tornado chart (8 variables), two-way data table (Exit Multiple x Revenue CAGR) |
| **Reporting** | Auto-generated Investment Committee memorandum, CSV export, print-ready PDF |

---

## Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- Any local HTTP server (ES modules require a server)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/PremKudale/Vanguard-PE.git
cd Vanguard-PE

# Option 1: Python
python -m http.server 5500

# Option 2: Node.js
npx serve

# Option 3: VS Code
# Install "Live Server" extension, right-click index.html, "Open with Live Server"

# Open in browser
# Navigate to http://localhost:5500
```

---

## Dashboard Tabs

### 1. Deal Overview
- 8 key metric cards: Entry EV, Exit EV, Equity IRR, MOIC, Equity Check, Total Debt, Exit Equity, Total Return
- Revenue & EBITDA trajectory chart (5-year projection)
- EBITDA margin expansion bar chart
- All values update in real-time as assumptions change

### 2. LBO Model
- **Sources & Uses table**: Enterprise Value + Transaction Fees + Financing Fees = Total Uses; Senior Debt + Mezzanine + Equity = Total Sources
- **5-year operating projections**: Revenue, EBITDA, D&A, EBIT, Interest, EBT, Tax, Net Income, CapEx, FCFE
- **Debt schedule**: Opening balance, interest, mandatory amortization, excess cash flow sweep, closing balance, leverage ratio
- **Debt service profile** stacked bar chart (Principal + Interest)
- **Leverage trajectory** line chart (Net Debt / EBITDA declining over hold period)

### 3. Value Creation Bridge
- **Waterfall chart** decomposing total equity value creation into:
  - Revenue Growth contribution
  - Margin Expansion (EBITDA margin improvement)
  - Multiple Expansion (entry vs exit EV/EBITDA)
  - Deleveraging (debt paydown)
- **Before/After comparison cards** showing entry vs exit: Revenue, EBITDA Margin, EBITDA, Leverage
- **Improvement lever impact analysis** with adjustable sliders: Pricing Optimization, Procurement Savings, SGA Rationalization, Working Capital Improvement

### 4. Due Diligence Scorecard
- **6 due diligence dimensions**, each with 5 criteria scored 1-5:
  1. Commercial DD: Market Size, Competitive Position, Customer Concentration, Pricing Power, Distribution
  2. Operational DD: Capacity Utilization, Supply Chain, Technology, Management Quality, Efficiency
  3. Financial DD: Revenue Quality, EBITDA Adjustments, Working Capital, CapEx, Cash Conversion
  4. Legal & Regulatory: Litigation, Compliance, IP Protection, Contracts, Labor
  5. ESG Assessment: Environmental, Social, Governance, ESG Improvement Potential, Sustainability
  6. IT & Digital: Systems Maturity, Cybersecurity, Data Analytics, Digital Readiness, Tech Debt
- **Interactive scoring**: Click any dot to adjust scores in real-time
- **Radar chart** showing strengths and vulnerabilities across all dimensions
- **Risk flags** auto-generated for low-scoring criteria
- **Go/No-Go recommendation** (Strong Buy / Buy / Hold / Pass) based on weighted scores

### 5. Comps & Valuation
- **Trading comparables table** with 6 companies per industry: Revenue, EBITDA, Margin, Growth, EV/EBITDA, EV/Revenue, P/E, Leverage
- **Target company highlighted** against comp set with median and mean statistics
- **Precedent transactions** with deal size, acquirer, and multiples paid
- **Football field valuation chart**: Implied EV range from Trading Comps, Precedent Transactions, DCF Analysis, and LBO Implied
- **Implied valuation range** (Low / Median / High) from comps

### 6. Scenario & Sensitivity Analysis
- **3 scenario cards** (Management Case / Base Case / Downside Case) with side-by-side IRR, MOIC, Entry/Exit EV, Leverage
- **Probability-weighted returns** (30% Management, 50% Base, 20% Downside)
- **Tornado chart**: Top 8 variables ranked by impact on Equity IRR
- **Two-way sensitivity table**: Exit Multiple x Revenue CAGR matrix showing IRR with heat-map coloring
- **Breakeven analysis**: Minimum CAGR and exit multiple to achieve 20% hurdle rate, with cushion metrics

### 7. Investment Committee Memo
- **Auto-generated professional report** including:
  - Executive Summary with investment recommendation
  - Investment Thesis (3 key drivers)
  - Financial Summary (key metrics table)
  - Capital Structure (Sources & Uses)
  - Returns Analysis with scenario comparison
  - Value Creation Plan summary
  - Due Diligence Assessment with risk flags
  - Disclaimer
- **One-click print to PDF**
- **CSV export** of all financial data

---

## Architecture

### Project Structure

```
vanguard-pe/
|
├── index.html                          # Application shell (sidebar + 7 tabs + KPI bar)
├── README.md
|
├── css/
│   ├── index.css                       # Design system (CSS custom properties, dark theme)
│   ├── dashboard.css                   # KPI cards, tab layout, responsive grid
│   ├── sidebar.css                     # Assumptions panel, custom form controls
│   ├── charts.css                      # Chart containers, heat maps, DD grid
│   └── memo.css                        # Investment memo, print styles
|
└── js/
    ├── app.js                          # Application orchestrator & event handling
    ├── assumptions.js                  # Input management, validation, defaults
    |
    ├── model/                          # Financial Model Engine
    │   ├── engine.js                   # Central orchestrator (runs all sub-models)
    │   ├── lbo.js                      # Sources & Uses, operating model, debt schedule
    │   ├── valuation.js                # Comps analysis, precedent txns, football field
    │   ├── valueCreation.js            # Value creation bridge & improvement levers
    │   └── returns.js                  # IRR, MOIC, Cash-on-Cash, payback
    |
    ├── analysis/                       # Risk & Scenario Analysis
    │   ├── dueDiligence.js             # 6-dimension DD scorecard engine
    │   ├── scenarios.js                # Management/Base/Downside scenario manager
    │   └── sensitivity.js              # Tornado, two-way tables, breakeven
    |
    ├── charts/                         # Data Visualization
    │   ├── chartConfigs.js             # Chart.js dark theme configurations
    │   └── chartManager.js             # Chart lifecycle management
    |
    └── utils/                          # Utility Functions
        ├── financial.js                # IRR (Newton-Raphson), NPV, PMT, WACC
        ├── format.js                   # Indian numbering (Cr/Lakhs), currency formatting
        ├── compsData.js                # Pre-loaded industry benchmarks (6 sectors)
        └── export.js                   # Investment memo generator, CSV export
```

### Model Flow

```
Assumptions (Sidebar UI Inputs)
    |
    v
┌─────────────────────────────────────────────────────────┐
│                    MODEL ENGINE                          │
│                                                          │
│  Sources & Uses --> Operating Model --> Debt Schedule     │
│       |                  |                  |            │
│       v                  v                  v            │
│  Equity Check      EBITDA Trajectory    Amortization     │
│       |                  |              + Cash Sweep     │
│       v                  v                  |            │
│  Value Creation    Exit Analysis            |            │
│  Bridge            (EV, Equity) <-----------+            │
│       |                  |                               │
│       v                  v                               │
│  Decomposition     Returns (IRR, MOIC, Payback)          │
└─────────────────────────────────────────────────────────┘
    |
    v
Dashboard (Charts, KPIs, Tables, IC Memo)
```

---

## Default Case Study: Project Atlas

A mid-market consumer products company requiring operational turnaround:

| Parameter | Default Value | Description |
|-----------|--------------|-------------|
| Target Company | Atlas Consumer Products | Hypothetical mid-market consumer business |
| Industry | Consumer Products | One of 6 selectable industries |
| LTM Revenue | Rs.1,200 Cr | Last Twelve Months revenue |
| LTM EBITDA | Rs.180 Cr (15% margin) | Pre-acquisition profitability |
| Entry EV/EBITDA | 8.0x | Purchase price multiple |
| Exit EV/EBITDA | 9.0x | Projected exit multiple |
| Debt : Equity | 60 : 40 | Capital structure |
| Senior Debt Rate | 10.0% | Cost of debt |
| Loan Tenor | 6 years | Repayment period |
| Cash Sweep | 50% | Excess cash flow directed to debt paydown |
| Revenue CAGR | 8.0% | Projected annual growth |
| Target EBITDA Margin | 20.0% | Post-improvement target (from 15%) |
| CapEx (% Revenue) | 3.5% | Capital expenditure intensity |
| Hold Period | 5 years | Investment horizon |
| Tax Rate | 25.2% | Corporate tax (incl. surcharge) |

**Value Creation Thesis:**
1. Revenue growth through distribution expansion and new product launches
2. EBITDA margin improvement from 15% to 20% via procurement optimization and SGA rationalization
3. Multiple expansion from improved growth profile and operational quality
4. Deleveraging through strong free cash flow generation

All assumptions are fully adjustable in real-time through the sidebar panel.

---

## Financial Mathematics

### IRR Calculation (Newton-Raphson Method)

The platform implements a custom IRR solver using the Newton-Raphson iterative method with a bisection fallback:

```javascript
// Newton-Raphson iteration
rate = rate - NPV(rate) / NPV'(rate)

// Convergence criteria: |delta_rate| < 10^-7
// Fallback: Bisection method over [-0.5, 5.0] range
```

### LBO Returns

```
MOIC = Exit Equity Value / Invested Equity
IRR  = Rate such that NPV(equity cash flows) = 0
CoC  = (Exit Equity - Invested Equity) / Invested Equity
```

### Value Creation Decomposition

```
Revenue Growth Effect    = (Exit Revenue - Entry Revenue) x Entry Margin x Entry Multiple
Margin Expansion Effect  = Exit Revenue x (Exit Margin - Entry Margin) x Entry Multiple
Multiple Expansion       = Exit EBITDA x (Exit Multiple - Entry Multiple)
Deleveraging             = Entry Debt - Exit Debt

Check: Sum of components = Exit Equity - Entry Equity
```

### Debt Schedule

```
Mandatory Amort = PMT(rate, tenor, principal) - Interest
Cash Sweep      = min(Excess CF x Sweep%, Remaining Balance)
CFADS           = EBITDA - Interest - CapEx - Delta NWC
```

---

## Supported Industries

The platform includes pre-loaded comparable companies and benchmarks for 6 industries:

| Industry | Median EV/EBITDA | Median Margin | Median Growth |
|----------|-----------------|---------------|---------------|
| Consumer Products | 9.5x | 16.0% | 8.5% |
| Retail & Hospitality | 12.0x | 10.0% | 12.0% |
| Healthcare & Pharma | 14.0x | 20.0% | 10.0% |
| Industrials & Manufacturing | 7.5x | 14.0% | 7.0% |
| Chemicals & Materials | 10.0x | 17.0% | 9.0% |
| Automotive & Mobility | 8.0x | 12.0% | 8.0% |

Each industry includes 6 comparable companies and 4-5 precedent transactions.

---

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic application structure |
| **CSS3** | Dark-mode design system with glassmorphism, CSS Grid, custom properties |
| **JavaScript (ES6+)** | Financial model engine, DOM manipulation, ES modules |
| **Chart.js 4.4** | Interactive data visualization (line, bar, radar, waterfall) |
| **Inter + JetBrains Mono** | Typography (Google Fonts) |

**Zero build tools. Zero dependencies (except Chart.js CDN). Pure vanilla web technologies.**

---

## Contributing

Contributions are welcome! Some ideas for extension:

- [ ] Add Monte Carlo simulation for probabilistic IRR distribution
- [ ] Implement debt sculpting with target DSCR optimization
- [ ] Add management rollover and co-invest structuring
- [ ] Integrate real-time market data APIs for live comps
- [ ] Add portfolio-level analysis across multiple deals
- [ ] Implement dividend recapitalization modeling
- [ ] Add foreign currency hedging for cross-border deals

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built for private equity professionals and aspiring investment bankers.**

*Vanguard PE: Where Strategy Meets Capital*

</div>
