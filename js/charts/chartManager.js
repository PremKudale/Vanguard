/**
 * Chart Lifecycle Manager
 * Creates, updates, and destroys Chart.js instances
 */

export class ChartManager {
    constructor() {
        this.charts = new Map();
    }

    /**
     * Create or update a chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} config - Chart.js configuration
     * @returns {Chart|null} Chart instance
     */
    createOrUpdate(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return null;
        }

        // Destroy existing chart on this canvas
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        return chart;
    }

    /**
     * Update chart data without recreating
     */
    updateData(canvasId, data) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        chart.data = data;
        chart.update('active');
    }

    /**
     * Destroy a specific chart
     */
    destroy(canvasId) {
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
            this.charts.delete(canvasId);
        }
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        for (const [id, chart] of this.charts) {
            chart.destroy();
        }
        this.charts.clear();
    }

    /**
     * Get a chart instance
     */
    get(canvasId) {
        return this.charts.get(canvasId);
    }

    /**
     * Resize all charts (call on window resize)
     */
    resizeAll() {
        for (const chart of this.charts.values()) {
            chart.resize();
        }
    }
}
