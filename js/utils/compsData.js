/**
 * Comparable Company & Industry Benchmark Data
 * Pre-loaded data for 6 industries relevant to PE analysis
 * All revenue/EBITDA values in ₹ Crores
 */

export const industryData = {
    consumer: {
        name: 'Consumer Products',
        icon: '🛒',
        benchmarks: {
            medianEVEBITDA: 9.5,
            medianMargin: 16.0,
            medianGrowth: 8.5,
            medianLeverage: 2.3,
            medianROCE: 18.0
        },
        companies: [
            { name: 'Meridian Foods Ltd', ticker: 'MFL', revenue: 3200, ebitda: 512, margin: 16.0, growth: 9.2, evEbitda: 10.2, evRevenue: 1.63, pe: 22.5, leverage: 2.3, roce: 19.5 },
            { name: 'Pinnacle Brands India', ticker: 'PBI', revenue: 2800, ebitda: 476, margin: 17.0, growth: 7.8, evEbitda: 9.5, evRevenue: 1.62, pe: 20.1, leverage: 2.0, roce: 21.0 },
            { name: 'Summit Nutrition Pvt', ticker: 'SNP', revenue: 1800, ebitda: 234, margin: 13.0, growth: 11.5, evEbitda: 8.8, evRevenue: 1.14, pe: 18.7, leverage: 3.1, roce: 14.2 },
            { name: 'Crestview Consumer', ticker: 'CVC', revenue: 4500, ebitda: 810, margin: 18.0, growth: 6.5, evEbitda: 11.5, evRevenue: 2.07, pe: 25.3, leverage: 1.8, roce: 23.5 },
            { name: 'Horizon Essentials', ticker: 'HEL', revenue: 2200, ebitda: 330, margin: 15.0, growth: 8.3, evEbitda: 9.0, evRevenue: 1.35, pe: 19.2, leverage: 2.5, roce: 17.0 },
            { name: 'Beacon Personal Care', ticker: 'BPC', revenue: 1500, ebitda: 195, margin: 13.0, growth: 12.1, evEbitda: 8.2, evRevenue: 1.07, pe: 17.5, leverage: 2.8, roce: 13.8 }
        ],
        precedentTransactions: [
            { target: 'Vitalife Health Foods', acquirer: 'Westbridge Capital', year: 2024, evEbitda: 9.8, evRevenue: 1.5, dealSize: 450 },
            { target: 'GreenLeaf Organics', acquirer: 'ChrysCapital', year: 2024, evEbitda: 10.5, evRevenue: 1.7, dealSize: 680 },
            { target: 'NatureFirst Products', acquirer: 'Advent International', year: 2023, evEbitda: 8.5, evRevenue: 1.1, dealSize: 320 },
            { target: 'UrbanBite Snacks', acquirer: 'Warburg Pincus', year: 2025, evEbitda: 11.2, evRevenue: 1.8, dealSize: 890 },
            { target: 'PureSkin Naturals', acquirer: 'KKR India', year: 2023, evEbitda: 9.0, evRevenue: 1.3, dealSize: 540 }
        ]
    },

    retail: {
        name: 'Retail & Hospitality',
        icon: '🏬',
        benchmarks: {
            medianEVEBITDA: 12.0,
            medianMargin: 10.0,
            medianGrowth: 12.0,
            medianLeverage: 2.8,
            medianROCE: 14.0
        },
        companies: [
            { name: 'UrbanCart Retail', ticker: 'UCR', revenue: 8500, ebitda: 935, margin: 11.0, growth: 15.2, evEbitda: 14.5, evRevenue: 1.60, pe: 32.1, leverage: 3.0, roce: 14.5 },
            { name: 'FreshMart Chain', ticker: 'FMC', revenue: 5200, ebitda: 468, margin: 9.0, growth: 18.0, evEbitda: 12.8, evRevenue: 1.15, pe: 28.5, leverage: 3.5, roce: 11.2 },
            { name: 'StyleQuotient Fashion', ticker: 'SQF', revenue: 3800, ebitda: 418, margin: 11.0, growth: 14.5, evEbitda: 11.5, evRevenue: 1.27, pe: 24.3, leverage: 2.5, roce: 15.8 },
            { name: 'HomeSpace Living', ticker: 'HSL', revenue: 2600, ebitda: 234, margin: 9.0, growth: 10.0, evEbitda: 10.0, evRevenue: 0.90, pe: 22.0, leverage: 2.8, roce: 12.0 },
            { name: 'QuickServe Hospitality', ticker: 'QSH', revenue: 4100, ebitda: 492, margin: 12.0, growth: 16.5, evEbitda: 13.5, evRevenue: 1.62, pe: 30.2, leverage: 2.2, roce: 16.5 },
            { name: 'ValueBazaar Stores', ticker: 'VBS', revenue: 6800, ebitda: 544, margin: 8.0, growth: 11.0, evEbitda: 9.5, evRevenue: 0.76, pe: 20.5, leverage: 3.2, roce: 10.5 }
        ],
        precedentTransactions: [
            { target: 'Metro Fresh Grocers', acquirer: 'Temasek', year: 2024, evEbitda: 12.5, evRevenue: 1.3, dealSize: 1200 },
            { target: 'Luxe Fashion Pvt', acquirer: 'Blackstone', year: 2025, evEbitda: 13.0, evRevenue: 1.5, dealSize: 850 },
            { target: 'CloudKitchen India', acquirer: 'Sequoia Capital', year: 2024, evEbitda: 15.0, evRevenue: 1.8, dealSize: 600 },
            { target: 'EverStyle Apparel', acquirer: 'TPG Capital', year: 2023, evEbitda: 10.5, evRevenue: 1.0, dealSize: 420 }
        ]
    },

    healthcare: {
        name: 'Healthcare & Pharma',
        icon: '🏥',
        benchmarks: {
            medianEVEBITDA: 14.0,
            medianMargin: 20.0,
            medianGrowth: 10.0,
            medianLeverage: 1.8,
            medianROCE: 22.0
        },
        companies: [
            { name: 'MedCore Diagnostics', ticker: 'MCD', revenue: 2800, ebitda: 616, margin: 22.0, growth: 12.0, evEbitda: 16.0, evRevenue: 3.52, pe: 35.0, leverage: 1.5, roce: 25.0 },
            { name: 'VitaCure Pharma', ticker: 'VCP', revenue: 4200, ebitda: 798, margin: 19.0, growth: 8.5, evEbitda: 13.5, evRevenue: 2.57, pe: 28.0, leverage: 2.0, roce: 21.0 },
            { name: 'HealthPrime Hospitals', ticker: 'HPH', revenue: 5500, ebitda: 990, margin: 18.0, growth: 14.0, evEbitda: 15.5, evRevenue: 2.79, pe: 32.5, leverage: 2.5, roce: 18.5 },
            { name: 'GenNext Biotech', ticker: 'GNB', revenue: 1200, ebitda: 276, margin: 23.0, growth: 18.5, evEbitda: 18.0, evRevenue: 4.14, pe: 42.0, leverage: 1.2, roce: 28.0 },
            { name: 'CarePlus Network', ticker: 'CPN', revenue: 3500, ebitda: 630, margin: 18.0, growth: 9.0, evEbitda: 12.5, evRevenue: 2.25, pe: 26.0, leverage: 2.0, roce: 20.0 },
            { name: 'NovaMed Devices', ticker: 'NMD', revenue: 1800, ebitda: 396, margin: 22.0, growth: 11.0, evEbitda: 14.0, evRevenue: 3.08, pe: 30.0, leverage: 1.5, roce: 24.0 }
        ],
        precedentTransactions: [
            { target: 'LifeSpan Diagnostics', acquirer: 'Bain Capital', year: 2024, evEbitda: 15.5, evRevenue: 3.2, dealSize: 1500 },
            { target: 'PharmaEdge Labs', acquirer: 'Carlyle Group', year: 2025, evEbitda: 14.0, evRevenue: 2.8, dealSize: 980 },
            { target: 'MediCare Clinics', acquirer: 'BPEA', year: 2024, evEbitda: 13.0, evRevenue: 2.5, dealSize: 750 },
            { target: 'BioGenesis India', acquirer: 'General Atlantic', year: 2023, evEbitda: 16.5, evRevenue: 3.5, dealSize: 620 }
        ]
    },

    industrials: {
        name: 'Industrials & Manufacturing',
        icon: '🏭',
        benchmarks: {
            medianEVEBITDA: 7.5,
            medianMargin: 14.0,
            medianGrowth: 7.0,
            medianLeverage: 2.5,
            medianROCE: 15.0
        },
        companies: [
            { name: 'Apex Engineering Works', ticker: 'AEW', revenue: 4800, ebitda: 720, margin: 15.0, growth: 8.0, evEbitda: 8.0, evRevenue: 1.20, pe: 16.5, leverage: 2.5, roce: 16.0 },
            { name: 'Titanforge Industries', ticker: 'TFI', revenue: 3200, ebitda: 416, margin: 13.0, growth: 6.5, evEbitda: 7.0, evRevenue: 0.91, pe: 14.0, leverage: 3.0, roce: 13.0 },
            { name: 'Precision Metals Corp', ticker: 'PMC', revenue: 2500, ebitda: 375, margin: 15.0, growth: 7.5, evEbitda: 7.5, evRevenue: 1.13, pe: 15.5, leverage: 2.2, roce: 17.0 },
            { name: 'InfraBuild Systems', ticker: 'IBS', revenue: 6000, ebitda: 780, margin: 13.0, growth: 9.0, evEbitda: 8.5, evRevenue: 1.11, pe: 18.0, leverage: 2.8, roce: 14.5 },
            { name: 'SpectraChem Process', ticker: 'SCP', revenue: 1800, ebitda: 270, margin: 15.0, growth: 5.5, evEbitda: 6.5, evRevenue: 0.98, pe: 13.0, leverage: 2.0, roce: 15.5 },
            { name: 'ElectroWatt Power Eq', ticker: 'EWP', revenue: 3500, ebitda: 490, margin: 14.0, growth: 7.0, evEbitda: 7.8, evRevenue: 1.09, pe: 16.0, leverage: 2.5, roce: 15.0 }
        ],
        precedentTransactions: [
            { target: 'SteelCraft Precision', acquirer: 'Brookfield', year: 2024, evEbitda: 7.8, evRevenue: 1.1, dealSize: 580 },
            { target: 'PowerDrive Systems', acquirer: 'Advent International', year: 2023, evEbitda: 8.0, evRevenue: 1.2, dealSize: 920 },
            { target: 'IndoForge Metals', acquirer: 'CVC Capital', year: 2025, evEbitda: 7.0, evRevenue: 0.9, dealSize: 450 },
            { target: 'QuantumFab Engg', acquirer: 'PAG', year: 2024, evEbitda: 8.5, evRevenue: 1.3, dealSize: 700 }
        ]
    },

    chemicals: {
        name: 'Chemicals & Materials',
        icon: '⚗️',
        benchmarks: {
            medianEVEBITDA: 10.0,
            medianMargin: 17.0,
            medianGrowth: 9.0,
            medianLeverage: 2.0,
            medianROCE: 18.0
        },
        companies: [
            { name: 'AquaChem Solutions', ticker: 'ACS', revenue: 2400, ebitda: 432, margin: 18.0, growth: 10.0, evEbitda: 11.0, evRevenue: 1.98, pe: 23.0, leverage: 1.8, roce: 20.0 },
            { name: 'PolymerTech India', ticker: 'PTI', revenue: 3600, ebitda: 576, margin: 16.0, growth: 8.5, evEbitda: 10.0, evRevenue: 1.60, pe: 20.5, leverage: 2.2, roce: 17.5 },
            { name: 'NeoCoat Speciality', ticker: 'NCS', revenue: 1500, ebitda: 270, margin: 18.0, growth: 12.0, evEbitda: 12.0, evRevenue: 2.16, pe: 25.0, leverage: 1.5, roce: 22.0 },
            { name: 'GreenChem Agro', ticker: 'GCA', revenue: 2800, ebitda: 448, margin: 16.0, growth: 9.0, evEbitda: 9.5, evRevenue: 1.52, pe: 19.0, leverage: 2.0, roce: 18.0 },
            { name: 'FlexMat Industries', ticker: 'FMI', revenue: 4200, ebitda: 672, margin: 16.0, growth: 7.0, evEbitda: 9.0, evRevenue: 1.44, pe: 18.0, leverage: 2.5, roce: 16.0 },
            { name: 'PureSynth Labs', ticker: 'PSL', revenue: 1200, ebitda: 228, margin: 19.0, growth: 14.0, evEbitda: 13.0, evRevenue: 2.47, pe: 27.0, leverage: 1.2, roce: 24.0 }
        ],
        precedentTransactions: [
            { target: 'AromaSpec Chemicals', acquirer: 'KKR', year: 2024, evEbitda: 10.5, evRevenue: 1.8, dealSize: 780 },
            { target: 'EliteCoat Industries', acquirer: 'Warburg Pincus', year: 2023, evEbitda: 9.5, evRevenue: 1.5, dealSize: 520 },
            { target: 'BioPolymer Pvt', acquirer: 'Blackstone', year: 2025, evEbitda: 11.5, evRevenue: 2.0, dealSize: 950 },
            { target: 'CatalystPrime Chem', acquirer: 'Apax Partners', year: 2024, evEbitda: 10.0, evRevenue: 1.7, dealSize: 680 }
        ]
    },

    automotive: {
        name: 'Automotive & Mobility',
        icon: '🚗',
        benchmarks: {
            medianEVEBITDA: 8.0,
            medianMargin: 12.0,
            medianGrowth: 8.0,
            medianLeverage: 2.5,
            medianROCE: 14.0
        },
        companies: [
            { name: 'DriveForce Auto', ticker: 'DFA', revenue: 5500, ebitda: 715, margin: 13.0, growth: 9.0, evEbitda: 8.5, evRevenue: 1.11, pe: 17.5, leverage: 2.5, roce: 15.0 },
            { name: 'PrecisionParts Mfg', ticker: 'PPM', revenue: 3200, ebitda: 384, margin: 12.0, growth: 7.0, evEbitda: 7.5, evRevenue: 0.90, pe: 15.0, leverage: 2.8, roce: 13.0 },
            { name: 'ElectraMotion EV', ticker: 'EME', revenue: 1800, ebitda: 234, margin: 13.0, growth: 22.0, evEbitda: 12.0, evRevenue: 1.56, pe: 28.0, leverage: 1.5, roce: 12.0 },
            { name: 'AutoAlliance Components', ticker: 'AAC', revenue: 4200, ebitda: 462, margin: 11.0, growth: 6.5, evEbitda: 7.0, evRevenue: 0.77, pe: 14.0, leverage: 3.0, roce: 12.5 },
            { name: 'SpeedLink Logistics', ticker: 'SLL', revenue: 2800, ebitda: 364, margin: 13.0, growth: 10.5, evEbitda: 9.0, evRevenue: 1.17, pe: 19.0, leverage: 2.2, roce: 16.0 },
            { name: 'NextGen Chassis', ticker: 'NGC', revenue: 2200, ebitda: 264, margin: 12.0, growth: 8.0, evEbitda: 8.0, evRevenue: 0.96, pe: 16.0, leverage: 2.5, roce: 14.0 }
        ],
        precedentTransactions: [
            { target: 'MotorCraft Precision', acquirer: 'Bain Capital', year: 2024, evEbitda: 8.0, evRevenue: 1.0, dealSize: 650 },
            { target: 'EV Components India', acquirer: 'General Atlantic', year: 2025, evEbitda: 10.5, evRevenue: 1.4, dealSize: 480 },
            { target: 'ChassisWorks Ltd', acquirer: 'ChrysCapital', year: 2023, evEbitda: 7.0, evRevenue: 0.8, dealSize: 380 },
            { target: 'SmartDrive Tech', acquirer: 'TPG Capital', year: 2024, evEbitda: 9.0, evRevenue: 1.2, dealSize: 550 }
        ]
    }
};

/**
 * Get industry data by key
 */
export function getIndustryData(industryKey) {
    return industryData[industryKey] || industryData.consumer;
}

/**
 * Get all industry keys
 */
export function getIndustryKeys() {
    return Object.keys(industryData);
}

/**
 * Calculate comps statistics for a given industry
 */
export function calculateCompsStats(industryKey) {
    const data = getIndustryData(industryKey);
    const companies = data.companies;

    const metrics = ['evEbitda', 'evRevenue', 'pe', 'margin', 'growth', 'leverage', 'roce'];
    const stats = {};

    for (const metric of metrics) {
        const values = companies.map(c => c[metric]).sort((a, b) => a - b);
        const n = values.length;

        stats[metric] = {
            min: values[0],
            q1: values[Math.floor(n * 0.25)],
            median: n % 2 === 0 ? (values[n / 2 - 1] + values[n / 2]) / 2 : values[Math.floor(n / 2)],
            q3: values[Math.floor(n * 0.75)],
            max: values[n - 1],
            mean: values.reduce((s, v) => s + v, 0) / n
        };
    }

    return stats;
}

/**
 * Calculate precedent transaction statistics
 */
export function calculatePrecedentStats(industryKey) {
    const data = getIndustryData(industryKey);
    const txns = data.precedentTransactions;

    const evEbitdaValues = txns.map(t => t.evEbitda).sort((a, b) => a - b);
    const evRevValues = txns.map(t => t.evRevenue).sort((a, b) => a - b);
    const n = evEbitdaValues.length;

    return {
        evEbitda: {
            min: evEbitdaValues[0],
            median: n % 2 === 0 ? (evEbitdaValues[n / 2 - 1] + evEbitdaValues[n / 2]) / 2 : evEbitdaValues[Math.floor(n / 2)],
            max: evEbitdaValues[n - 1],
            mean: evEbitdaValues.reduce((s, v) => s + v, 0) / n
        },
        evRevenue: {
            min: evRevValues[0],
            median: n % 2 === 0 ? (evRevValues[n / 2 - 1] + evRevValues[n / 2]) / 2 : evRevValues[Math.floor(n / 2)],
            max: evRevValues[n - 1],
            mean: evRevValues.reduce((s, v) => s + v, 0) / n
        }
    };
}
