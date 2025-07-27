import { GameScenario } from '../types';
export declare class ScenarioService {
    private scenarios;
    constructor();
    getScenario(scenarioId?: string): GameScenario | null;
    getAllScenarios(): GameScenario[];
    private loadDefaultScenarios;
    private createMissingHeiressScenario;
}
//# sourceMappingURL=scenarioService.d.ts.map