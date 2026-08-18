/**
 * Chart.js Configuration Factory
 * Dark theme configurations for all chart types
 */

const CHART_COLORS = {
    blue: '#3b82f6',
    blueDim: 'rgba(59, 130, 246, 0.15)',
    emerald: '#10b981',
    emeraldDim: 'rgba(16, 185, 129, 0.15)',
    amber: '#f59e0b',
    amberDim: 'rgba(245, 158, 11, 0.15)',
    red: '#ef4444',
    redDim: 'rgba(239, 68, 68, 0.15)',
    purple: '#8b5cf6',
    purpleDim: 'rgba(139, 92, 246, 0.15)',
    cyan: '#06b6d4',
    cyanDim: 'rgba(6, 182, 212, 0.15)',
    gray: '#64748b',
    grayDim: 'rgba(100, 116, 139, 0.15)',
    white: '#f1f5f9',
    grid: 'rgba(255, 255, 255, 0.06)',
    gridHover: 'rgba(255, 255, 255, 0.12)'
};

const FONT_CONFIG = {
    family: "'Inter', -apple-system, sans-serif",
    monoFamily: "'JetBrains Mono', monospace"
};

/**
 * Base chart defaults (applied to all charts)
 */
export function getBaseDefaults() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: CHART_COLORS.white,
                    font: { family: FONT_CONFIG.family, size: 11, weight: '500' },
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: CHART_COLORS.white,
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { family: FONT_CONFIG.family, size: 12, weight: '600' },
                bodyFont: { family: FONT_CONFIG.monoFamily, size: 11 },
                displayColors: true,
                boxPadding: 4
            }
        },
        scales: {
            x: {
                grid: { color: CHART_COLORS.grid, drawBorder: false },
                ticks: {
                    color: '#64748b',
                    font: { family: FONT_CONFIG.family, size: 10 }
                }
            },
            y: {
                grid: { color: CHART_COLORS.grid, drawBorder: false },
                ticks: {
                    color: '#64748b',
                    font: { family: FONT_CONFIG.monoFamily, size: 10 }
                }
            }
        }
    };
}

/**
 * Revenue/EBITDA trend line chart
 */
export function getOperatingTrendConfig(operatingModel) {
    const labels = operatingModel.map(y => y.label);
    return {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: operatingModel.map(y => y.revenue),
                    borderColor: CHART_COLORS.blue,
                    backgroundColor: CHART_COLORS.blueDim,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                },
                {
                    label: 'EBITDA',
                    data: operatingModel.map(y => y.ebitda),
                    borderColor: CHART_COLORS.emerald,
                    backgroundColor: CHART_COLORS.emeraldDim,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...getBaseDefaults(),
            plugins: {
                ...getBaseDefaults().plugins,
                title: { display: false }
            },
            scales: {
                ...getBaseDefaults().scales,
                y: {
                    ...getBaseDefaults().scales.y,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        callback: (v) => `₹${v.toFixed(0)} Cr`
                    }
                }
            }
        }
    };
}

/**
 * Debt schedule stacked bar chart
 */
export function getDebtScheduleConfig(debtSchedule) {
    const labels = debtSchedule.filter(d => d.year > 0).map(d => d.label);
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Principal',
                    data: debtSchedule.filter(d => d.year > 0).map(d => d.senior.totalRepayment || d.senior.mandatoryAmort),
                    backgroundColor: CHART_COLORS.blue,
                    borderRadius: 3
                },
                {
                    label: 'Interest',
                    data: debtSchedule.filter(d => d.year > 0).map(d => d.senior.interest),
                    backgroundColor: CHART_COLORS.amber,
                    borderRadius: 3
                }
            ]
        },
        options: {
            ...getBaseDefaults(),
            plugins: {
                ...getBaseDefaults().plugins,
                title: { display: false }
            },
            scales: {
                ...getBaseDefaults().scales,
                x: { ...getBaseDefaults().scales.x, stacked: true },
                y: {
                    ...getBaseDefaults().scales.y,
                    stacked: true,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        callback: (v) => `₹${v.toFixed(0)} Cr`
                    }
                }
            }
        }
    };
}

/**
 * Leverage trajectory line chart
 */
export function getLeverageConfig(debtSchedule) {
    const labels = debtSchedule.map(d => d.label);
    return {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Net Debt / EBITDA',
                data: debtSchedule.map(d => d.leverage),
                borderColor: CHART_COLORS.cyan,
                backgroundColor: CHART_COLORS.cyanDim,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5
            }]
        },
        options: {
            ...getBaseDefaults(),
            plugins: {
                ...getBaseDefaults().plugins,
                legend: { display: false }
            },
            scales: {
                ...getBaseDefaults().scales,
                y: {
                    ...getBaseDefaults().scales.y,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        callback: (v) => `${v.toFixed(1)}x`
                    }
                }
            }
        }
    };
}

/**
 * Value creation waterfall chart
 */
export function getWaterfallConfig(valueCreation) {
    const { bridgeLabels, bridgeValues } = valueCreation;

    // Calculate running totals for waterfall
    const datasets = [];
    const invisibleBases = [];
    const barValues = [];
    const colors = [];

    let running = 0;
    for (let i = 0; i < bridgeLabels.length; i++) {
        if (i === 0 || i === bridgeLabels.length - 1) {
            // Entry/Exit equity: full bars from 0
            invisibleBases.push(0);
            barValues.push(bridgeValues[i]);
            colors.push(i === 0 ? CHART_COLORS.blue : CHART_COLORS.emerald);
            running = bridgeValues[i];
        } else {
            // Incremental bars
            const base = running;
            const value = bridgeValues[i];
            if (value >= 0) {
                invisibleBases.push(base);
                barValues.push(value);
                colors.push(value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');
            } else {
                invisibleBases.push(base + value);
                barValues.push(Math.abs(value));
                colors.push('rgba(239, 68, 68, 0.8)');
            }
            running += value;
        }
    }

    return {
        type: 'bar',
        data: {
            labels: bridgeLabels,
            datasets: [
                {
                    label: 'Base',
                    data: invisibleBases,
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                    borderSkipped: false
                },
                {
                    label: 'Value',
                    data: barValues,
                    backgroundColor: colors,
                    borderRadius: 4,
                    borderSkipped: false
                }
            ]
        },
        options: {
            ...getBaseDefaults(),
            plugins: {
                ...getBaseDefaults().plugins,
                legend: { display: false },
                tooltip: {
                    ...getBaseDefaults().plugins.tooltip,
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.datasetIndex === 0) return null;
                            return `₹${ctx.parsed.y.toFixed(1)} Cr`;
                        }
                    }
                }
            },
            scales: {
                ...getBaseDefaults().scales,
                x: {
                    ...getBaseDefaults().scales.x,
                    stacked: true,
                    ticks: {
                        ...getBaseDefaults().scales.x.ticks,
                        maxRotation: 30,
                        font: { family: FONT_CONFIG.family, size: 9 }
                    }
                },
                y: {
                    ...getBaseDefaults().scales.y,
                    stacked: true,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        callback: (v) => `₹${v.toFixed(0)} Cr`
                    }
                }
            }
        }
    };
}

/**
 * Due diligence radar chart
 */
export function getRadarConfig(radarData) {
    return {
        type: 'radar',
        data: {
            labels: radarData.labels,
            datasets: [{
                label: 'DD Score',
                data: radarData.scores,
                borderColor: CHART_COLORS.blue,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 2.5,
                pointBackgroundColor: radarData.scores.map(s =>
                    s >= 4 ? CHART_COLORS.emerald :
                    s >= 3 ? CHART_COLORS.blue :
                    s >= 2 ? CHART_COLORS.amber : CHART_COLORS.red
                ),
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: getBaseDefaults().plugins.tooltip
            },
            scales: {
                r: {
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 1,
                        color: '#64748b',
                        backdropColor: 'transparent',
                        font: { size: 10 }
                    },
                    grid: { color: CHART_COLORS.grid },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { family: FONT_CONFIG.family, size: 11, weight: '500' }
                    },
                    angleLines: { color: CHART_COLORS.grid }
                }
            }
        }
    };
}

/**
 * Tornado chart (horizontal bar)
 */
export function getTornadoConfig(tornadoData) {
    const top8 = tornadoData.variables.slice(0, 8);
    const labels = top8.map(v => v.name);
    const baseIRR = tornadoData.baseIRR;

    const lowDeltas = top8.map(v => (v.lowIRR - baseIRR) * 100);
    const highDeltas = top8.map(v => (v.highIRR - baseIRR) * 100);

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Decrease',
                    data: lowDeltas,
                    backgroundColor: lowDeltas.map(d => d < 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'),
                    borderRadius: 3
                },
                {
                    label: 'Increase',
                    data: highDeltas,
                    backgroundColor: highDeltas.map(d => d >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                    borderRadius: 3
                }
            ]
        },
        options: {
            ...getBaseDefaults(),
            indexAxis: 'y',
            plugins: {
                ...getBaseDefaults().plugins,
                legend: {
                    ...getBaseDefaults().plugins.legend,
                    display: false
                },
                tooltip: {
                    ...getBaseDefaults().plugins.tooltip,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.x >= 0 ? '+' : ''}${ctx.parsed.x.toFixed(1)} pp`
                    }
                }
            },
            scales: {
                x: {
                    ...getBaseDefaults().scales.x,
                    ticks: {
                        ...getBaseDefaults().scales.x.ticks,
                        callback: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} pp`
                    },
                    title: {
                        display: true,
                        text: 'Change in IRR (percentage points)',
                        color: '#64748b',
                        font: { family: FONT_CONFIG.family, size: 10 }
                    }
                },
                y: {
                    ...getBaseDefaults().scales.y,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        font: { family: FONT_CONFIG.family, size: 11, weight: '500' },
                        color: '#94a3b8'
                    }
                }
            }
        }
    };
}

/**
 * Football field horizontal bar chart
 */
export function getFootballFieldConfig(footballData) {
    const methodologies = footballData.methodologies;
    const labels = methodologies.map(m => m.label);

    return {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Low',
                    data: methodologies.map(m => m.low),
                    backgroundColor: 'transparent',
                    borderColor: 'transparent'
                },
                {
                    label: 'Range',
                    data: methodologies.map(m => m.high - m.low),
                    backgroundColor: methodologies.map(m => m.color + '60'),
                    borderColor: methodologies.map(m => m.color),
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            ...getBaseDefaults(),
            indexAxis: 'y',
            plugins: {
                ...getBaseDefaults().plugins,
                legend: { display: false },
                tooltip: {
                    ...getBaseDefaults().plugins.tooltip,
                    callbacks: {
                        label: (ctx) => {
                            if (ctx.datasetIndex === 0) return null;
                            const m = methodologies[ctx.dataIndex];
                            return [`Low: ₹${m.low.toFixed(0)} Cr`, `Mid: ₹${m.mid.toFixed(0)} Cr`, `High: ₹${m.high.toFixed(0)} Cr`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ...getBaseDefaults().scales.x,
                    stacked: true,
                    ticks: {
                        ...getBaseDefaults().scales.x.ticks,
                        callback: (v) => `₹${v.toFixed(0)} Cr`
                    }
                },
                y: {
                    ...getBaseDefaults().scales.y,
                    stacked: true,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        font: { family: FONT_CONFIG.family, size: 11, weight: '500' },
                        color: '#94a3b8'
                    }
                }
            }
        }
    };
}

/**
 * EBITDA margin trend chart
 */
export function getMarginTrendConfig(operatingModel) {
    const labels = operatingModel.map(y => y.label);
    return {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'EBITDA Margin',
                data: operatingModel.map(y => (y.ebitdaMargin * 100)),
                backgroundColor: operatingModel.map((y, i) => {
                    const pct = i / (operatingModel.length - 1);
                    return `rgba(${Math.round(59 + (16 - 59) * pct)}, ${Math.round(130 + (185 - 130) * pct)}, ${Math.round(246 + (129 - 246) * pct)}, 0.7)`;
                }),
                borderRadius: 5,
                borderSkipped: false
            }]
        },
        options: {
            ...getBaseDefaults(),
            plugins: {
                ...getBaseDefaults().plugins,
                legend: { display: false }
            },
            scales: {
                ...getBaseDefaults().scales,
                y: {
                    ...getBaseDefaults().scales.y,
                    ticks: {
                        ...getBaseDefaults().scales.y.ticks,
                        callback: (v) => `${v.toFixed(0)}%`
                    },
                    beginAtZero: true
                }
            }
        }
    };
}

export { CHART_COLORS, FONT_CONFIG };
