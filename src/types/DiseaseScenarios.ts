import { SimulationParams } from './simulation';

export interface DiseaseScenario {
    id: string;
    name: string;
    description: string;
    icon: string;
    characteristics: {
        transmission: string;
        severity: string;
        mortality: string;
    };
    params: Partial<SimulationParams>;
}

export const DISEASE_SCENARIOS: DiseaseScenario[] = [
    {
        id: 'covid-19',
        name: 'COVID-19',
        description: 'Highly transmissible respiratory virus with moderate mortality',
        icon: '🦠',
        characteristics: {
            transmission: 'High',
            severity: 'Moderate',
            mortality: 'Low-Moderate',
        },
        params: {
            infectionRate: 0.22,      // R0 ~2.5-3 (highly transmissible)
            recoveryRate: 0.09,       // ~11 days average recovery
            deathRate: 0.018,         // ~1.8% CFR (case fatality rate)
            initialInfected: 2,
        },
    },
    {
        id: 'ebola',
        name: 'Ebola',
        description: 'Severe hemorrhagic fever with very high mortality but lower transmission',
        icon: '☣️',
        characteristics: {
            transmission: 'Low-Moderate',
            severity: 'Very High',
            mortality: 'Very High',
        },
        params: {
            infectionRate: 0.14,      // R0 ~1.5-2 (requires close contact)
            recoveryRate: 0.035,      // ~28 days recovery (long illness)
            deathRate: 0.065,         // ~6.5% CFR (adjusted from real 50-90% for gameplay balance)
            initialInfected: 1,
        },
    },
    {
        id: 'influenza',
        name: 'Seasonal Flu',
        description: 'Common seasonal influenza with high transmission but low mortality',
        icon: '🤧',
        characteristics: {
            transmission: 'Moderate-High',
            severity: 'Low',
            mortality: 'Very Low',
        },
        params: {
            infectionRate: 0.16,      // R0 ~1.3 (moderate spread)
            recoveryRate: 0.18,       // ~5-6 days recovery (fast)
            deathRate: 0.001,         // ~0.1% CFR (very low)
            initialInfected: 3,
        },
    },
    {
        id: 'sars',
        name: 'SARS',
        description: 'Severe acute respiratory syndrome with moderate transmission and mortality',
        icon: '😷',
        characteristics: {
            transmission: 'Moderate-High',
            severity: 'High',
            mortality: 'High',
        },
        params: {
            infectionRate: 0.18,      // R0 ~2-3 (moderate-high)
            recoveryRate: 0.055,      // ~18 days recovery
            deathRate: 0.095,         // ~9.5% CFR (high mortality)
            initialInfected: 2,
        },
    },
    {
        id: 'custom',
        name: 'Custom Disease',
        description: 'Configure your own disease parameters',
        icon: '⚙️',
        characteristics: {
            transmission: 'Variable',
            severity: 'Variable',
            mortality: 'Variable',
        },
        params: {
            infectionRate: 0.15,
            recoveryRate: 0.08,
            deathRate: 0.02,
            initialInfected: 2,
        },
    },
];

// Export for easy access
export const diseaseScenarios = DISEASE_SCENARIOS;

export const getScenarioById = (id: string): DiseaseScenario | undefined => {
    return DISEASE_SCENARIOS.find(s => s.id === id);
};

export const getDefaultScenario = (): DiseaseScenario => {
    return DISEASE_SCENARIOS[0]; // COVID-19 as default
};
