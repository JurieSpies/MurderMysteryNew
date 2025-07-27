import type { GameScenario } from '../types/index';
import missingHeiressData from '../data/scenarios/missingHeiress.json';

export class ScenarioService {
  private scenarios: Map<string, GameScenario> = new Map();

  constructor() {
    this.loadScenarios();
  }

  private loadScenarios(): void {
    // Load the Missing Heiress scenario
    const missingHeiress = missingHeiressData as GameScenario;
    this.scenarios.set(missingHeiress.id, missingHeiress);
  }

  public getScenario(scenarioId?: string): GameScenario | null {
    if (!scenarioId) {
      // Return the first available scenario as default
      return Array.from(this.scenarios.values())[0] || null;
    }
    return this.scenarios.get(scenarioId) || null;
  }

  public getAllScenarios(): GameScenario[] {
    return Array.from(this.scenarios.values());
  }

  public getScenarioPreview(
    scenarioId: string
  ): Omit<GameScenario, 'solution'> | null {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return null;

    // Return scenario without solution for security
    // const { solution, ...preview } = scenario;
    return preview;
  }

  public getAllScenarioPreviews(): Omit<GameScenario, 'solution'>[] {
    return this.getAllScenarios().map((scenario) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { solution, ...preview } = scenario;
      return preview;
    });
  }

  public getCharacterById(scenarioId: string, characterId: string) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) return null;

    return scenario.characters.find((char) => char.id === characterId) || null;
  }

  public getClueById(scenarioId: string, clueId: string) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) return null;

    return scenario.clues.find((clue) => clue.id === clueId) || null;
  }

  public getCluesByCategory(scenarioId: string, category: string) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) return [];

    return scenario.clues.filter((clue) => clue.category === category);
  }

  public getCluesByRevealOrder(scenarioId: string) {
    const scenario = this.getScenario(scenarioId);
    if (!scenario) return [];

    return scenario.clues
      .filter((clue) => clue.revealOrder !== undefined)
      .sort((a, b) => (a.revealOrder || 0) - (b.revealOrder || 0));
  }

  public validateScenario(scenario: GameScenario): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!scenario.id) errors.push('Scenario ID is required');
    if (!scenario.title) errors.push('Scenario title is required');
    if (!scenario.description) errors.push('Scenario description is required');

    // Check characters
    if (
      !scenario.characters ||
      scenario.characters.length < scenario.minPlayers
    ) {
      errors.push(
        `Scenario must have at least ${scenario.minPlayers} characters`
      );
    }

    if (
      scenario.characters &&
      scenario.characters.length > scenario.maxPlayers
    ) {
      errors.push(
        `Scenario cannot have more than ${scenario.maxPlayers} characters`
      );
    }

    // Check clues
    if (!scenario.clues || scenario.clues.length < 3) {
      errors.push('Scenario must have at least 3 clues');
    }

    // Check solution
    if (!scenario.solution) {
      errors.push('Scenario must have a solution');
    } else {
      if (!scenario.solution.murderer)
        errors.push('Solution must specify the murderer');
      if (!scenario.solution.motive)
        errors.push('Solution must specify the motive');
      if (!scenario.solution.method)
        errors.push('Solution must specify the method');
      if (!scenario.solution.explanation)
        errors.push('Solution must include an explanation');
    }

    // Check character IDs are unique
    if (scenario.characters) {
      const characterIds = scenario.characters.map((char) => char.id);
      const uniqueIds = new Set(characterIds);
      if (characterIds.length !== uniqueIds.size) {
        errors.push('Character IDs must be unique');
      }
    }

    // Check clue IDs are unique
    if (scenario.clues) {
      const clueIds = scenario.clues.map((clue) => clue.id);
      const uniqueIds = new Set(clueIds);
      if (clueIds.length !== uniqueIds.size) {
        errors.push('Clue IDs must be unique');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export a singleton instance
export const scenarioService = new ScenarioService();
