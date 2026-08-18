/**
 * Due Diligence Scorecard Engine
 * 6-dimension assessment framework with weighted scoring,
 * risk flags, and Go/No-Go recommendation
 */

/**
 * Default DD scorecard structure with questions per dimension
 */
export const DD_DIMENSIONS = {
    commercial: {
        name: 'Commercial DD',
        icon: '📊',
        weight: 0.25,
        color: '#3b82f6',
        criteria: [
            { id: 'market_size', name: 'Market Size & Growth', description: 'TAM/SAM size and growth trajectory' },
            { id: 'competitive_position', name: 'Competitive Position', description: 'Market share, differentiation, moat' },
            { id: 'customer_concentration', name: 'Customer Concentration', description: 'Top 10 customer revenue share' },
            { id: 'pricing_power', name: 'Pricing Power', description: 'Ability to pass through cost increases' },
            { id: 'channel_mix', name: 'Channel & Distribution', description: 'Multi-channel presence, distribution strength' }
        ]
    },
    operational: {
        name: 'Operational DD',
        icon: '⚙️',
        weight: 0.20,
        color: '#10b981',
        criteria: [
            { id: 'capacity_util', name: 'Capacity Utilization', description: 'Current vs. max production capacity' },
            { id: 'supply_chain', name: 'Supply Chain Resilience', description: 'Supplier diversification, lead times' },
            { id: 'tech_stack', name: 'Technology & Systems', description: 'ERP, automation, digital maturity' },
            { id: 'mgmt_quality', name: 'Management Quality', description: 'Track record, depth, retention' },
            { id: 'operational_efficiency', name: 'Operational Efficiency', description: 'Lean practices, waste reduction' }
        ]
    },
    financial: {
        name: 'Financial DD',
        icon: '💰',
        weight: 0.25,
        color: '#f59e0b',
        criteria: [
            { id: 'revenue_quality', name: 'Revenue Quality', description: 'Recurring vs. one-time, visibility' },
            { id: 'ebitda_adjustments', name: 'EBITDA Adjustments', description: 'Add-backs, normalization quality' },
            { id: 'working_capital', name: 'Working Capital', description: 'NWC trends, DSO/DPO/DIO' },
            { id: 'capex_requirements', name: 'CapEx Requirements', description: 'Maintenance vs. growth CapEx' },
            { id: 'cash_conversion', name: 'Cash Conversion', description: 'FCF/EBITDA ratio and trends' }
        ]
    },
    legal: {
        name: 'Legal & Regulatory',
        icon: '⚖️',
        weight: 0.10,
        color: '#ef4444',
        criteria: [
            { id: 'litigation_risk', name: 'Litigation Risk', description: 'Pending/potential legal matters' },
            { id: 'regulatory_compliance', name: 'Regulatory Compliance', description: 'Industry-specific regulations' },
            { id: 'ip_protection', name: 'IP Protection', description: 'Patents, trademarks, trade secrets' },
            { id: 'contract_review', name: 'Key Contracts', description: 'Change of control clauses, renewals' },
            { id: 'labor_compliance', name: 'Labor & Employment', description: 'Employee-related risks' }
        ]
    },
    esg: {
        name: 'ESG Assessment',
        icon: '🌱',
        weight: 0.10,
        color: '#8b5cf6',
        criteria: [
            { id: 'environmental', name: 'Environmental Impact', description: 'Carbon footprint, waste, compliance' },
            { id: 'social', name: 'Social Responsibility', description: 'Labor practices, community impact' },
            { id: 'governance', name: 'Governance Structure', description: 'Board composition, transparency' },
            { id: 'esg_improvement', name: 'ESG Improvement Potential', description: 'Scope for ESG value creation' },
            { id: 'sustainability', name: 'Sustainability Strategy', description: 'Long-term ESG roadmap' }
        ]
    },
    digital: {
        name: 'IT & Digital DD',
        icon: '💻',
        weight: 0.10,
        color: '#06b6d4',
        criteria: [
            { id: 'systems_maturity', name: 'Systems Maturity', description: 'IT infrastructure, cloud readiness' },
            { id: 'cybersecurity', name: 'Cybersecurity Posture', description: 'Security protocols, incident history' },
            { id: 'data_analytics', name: 'Data & Analytics', description: 'Data infrastructure, BI capabilities' },
            { id: 'digital_readiness', name: 'Digital Transformation', description: 'E-commerce, digital channels' },
            { id: 'tech_debt', name: 'Technical Debt', description: 'Legacy systems, upgrade needs' }
        ]
    }
};

/**
 * Default scores for the pre-loaded case study
 */
export const DEFAULT_DD_SCORES = {
    commercial: { market_size: 4, competitive_position: 3, customer_concentration: 3, pricing_power: 3, channel_mix: 4 },
    operational: { capacity_util: 3, supply_chain: 3, tech_stack: 2, mgmt_quality: 4, operational_efficiency: 3 },
    financial: { revenue_quality: 4, ebitda_adjustments: 3, working_capital: 3, capex_requirements: 4, cash_conversion: 3 },
    legal: { litigation_risk: 4, regulatory_compliance: 4, ip_protection: 3, contract_review: 4, labor_compliance: 4 },
    esg: { environmental: 3, social: 4, governance: 3, esg_improvement: 4, sustainability: 3 },
    digital: { systems_maturity: 2, cybersecurity: 3, data_analytics: 2, digital_readiness: 3, tech_debt: 2 }
};

/**
 * Calculate due diligence scorecard
 * @param {Object} scores - Scores object { dimension: { criterion: score } }
 * @returns {Object} Scorecard results with weighted scores, flags, recommendation
 */
export function calculateDDScorecard(scores = DEFAULT_DD_SCORES) {
    const dimensionResults = {};
    let weightedTotal = 0;
    let totalWeight = 0;

    for (const [dimKey, dimConfig] of Object.entries(DD_DIMENSIONS)) {
        const dimScores = scores[dimKey] || {};
        const criteria = dimConfig.criteria;
        let sum = 0;
        let count = 0;
        const criteriaResults = [];

        for (const criterion of criteria) {
            const score = dimScores[criterion.id] || 3; // Default to 3 (neutral)
            sum += score;
            count++;

            criteriaResults.push({
                ...criterion,
                score,
                status: getScoreStatus(score)
            });
        }

        const avgScore = count > 0 ? sum / count : 0;
        const weightedScore = avgScore * dimConfig.weight;
        weightedTotal += weightedScore;
        totalWeight += dimConfig.weight;

        dimensionResults[dimKey] = {
            ...dimConfig,
            criteria: criteriaResults,
            averageScore: avgScore,
            weightedScore,
            status: getScoreStatus(avgScore),
            flags: generateFlags(dimKey, criteriaResults)
        };
    }

    const overallScore = totalWeight > 0 ? weightedTotal / totalWeight : 0;

    // Generate red flags
    const allFlags = [];
    for (const dim of Object.values(dimensionResults)) {
        allFlags.push(...dim.flags);
    }

    // Sort flags by severity
    allFlags.sort((a, b) => a.severity - b.severity);

    return {
        dimensions: dimensionResults,
        overallScore,
        overallStatus: getScoreStatus(overallScore),
        recommendation: getRecommendation(overallScore),
        flags: allFlags,
        radarData: {
            labels: Object.values(dimensionResults).map(d => d.name),
            scores: Object.values(dimensionResults).map(d => d.averageScore),
            colors: Object.values(dimensionResults).map(d => d.color)
        }
    };
}

/**
 * Get score status label
 */
function getScoreStatus(score) {
    if (score >= 4.0) return { label: 'Strong', class: 'badge-emerald', color: '#10b981' };
    if (score >= 3.0) return { label: 'Adequate', class: 'badge-blue', color: '#3b82f6' };
    if (score >= 2.0) return { label: 'Caution', class: 'badge-amber', color: '#f59e0b' };
    return { label: 'Risk', class: 'badge-red', color: '#ef4444' };
}

/**
 * Get investment recommendation
 */
function getRecommendation(score) {
    if (score >= 4.0) return { label: 'Strong Buy', class: 'strong-buy', color: '#10b981', icon: '✅' };
    if (score >= 3.5) return { label: 'Buy', class: 'buy', color: '#3b82f6', icon: '👍' };
    if (score >= 2.5) return { label: 'Hold / Conditional', class: 'hold', color: '#f59e0b', icon: '⚠️' };
    return { label: 'Pass', class: 'pass', color: '#ef4444', icon: '🚫' };
}

/**
 * Generate risk flags for a dimension
 */
function generateFlags(dimensionKey, criteriaResults) {
    const flags = [];
    const dimName = DD_DIMENSIONS[dimensionKey].name;

    for (const criterion of criteriaResults) {
        if (criterion.score <= 2) {
            flags.push({
                severity: criterion.score === 1 ? 1 : 2,
                type: criterion.score === 1 ? 'critical' : 'warning',
                dimension: dimName,
                criterion: criterion.name,
                message: criterion.score === 1
                    ? `Critical risk: ${criterion.name} scores extremely low`
                    : `Warning: ${criterion.name} needs attention`,
                color: criterion.score === 1 ? '#ef4444' : '#f59e0b'
            });
        }
    }

    return flags;
}
