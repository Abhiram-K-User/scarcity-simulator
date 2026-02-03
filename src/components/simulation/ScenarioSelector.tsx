import { DiseaseScenario, DISEASE_SCENARIOS } from '@/types/DiseaseScenarios';
import { SimulationParams } from '@/types/simulation';

interface ScenarioSelectorProps {
    currentScenarioId: string;
    onSelectScenario: (scenario: DiseaseScenario) => void;
    disabled?: boolean;
}

export const ScenarioSelector = ({ currentScenarioId, onSelectScenario, disabled }: ScenarioSelectorProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-primary/80 uppercase tracking-wider">Disease Scenarios</h3>
                <span className="text-[10px] text-muted-foreground">Select a preset or customize</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {DISEASE_SCENARIOS.map(scenario => {
                    const isSelected = currentScenarioId === scenario.id;
                    const isCustom = scenario.id === 'custom';

                    return (
                        <button
                            key={scenario.id}
                            onClick={() => onSelectScenario(scenario)}
                            disabled={disabled}
                            className={`
                relative p-3 rounded-lg border-2 transition-all duration-300 text-left
                ${isSelected
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border/50 bg-white/40 hover:border-primary/50 hover:bg-white/60'
                                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
              `}
                        >
                            <div className="flex items-start gap-2 mb-2">
                                <span className="text-2xl">{scenario.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-foreground truncate">{scenario.name}</h4>
                                    {isSelected && (
                                        <span className="text-[9px] text-primary font-medium uppercase tracking-wide">Active</span>
                                    )}
                                </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground leading-snug mb-2 line-clamp-2">
                                {scenario.description}
                            </p>

                            {!isCustom && (
                                <div className="flex gap-1.5 flex-wrap">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                        T: {scenario.characteristics.transmission}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-stress-high/10 text-stress-high font-medium">
                                        M: {scenario.characteristics.mortality}
                                    </span>
                                </div>
                            )}

                            {isCustom && (
                                <div className="text-[9px] text-muted-foreground italic">
                                    Adjust parameters below
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
