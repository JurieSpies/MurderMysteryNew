import type { GameScenario } from '../types/index';
import { scenarioService } from '../services/scenarioService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    characterCount: number;
    clueCount: number;
    categoryCount: number;
    averageSecretsPerCharacter: number;
    keyClueCount: number;
    redHerringCount: number;
  };
}

export class ScenarioValidator {
  public validateScenario(scenario: GameScenario): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    const basicValidation = scenarioService.validateScenario(scenario);
    errors.push(...basicValidation.errors);

    // Advanced validation
    this.validateCharacterBalance(scenario, warnings);
    this.validateClueDistribution(scenario, warnings);
    this.validateGameplayBalance(scenario, warnings);
    this.validateNarrative(scenario, warnings);

    // Calculate stats
    const stats = this.calculateStats(scenario);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  }

  private validateCharacterBalance(
    scenario: GameScenario,
    warnings: string[]
  ): void {
    const characters = scenario.characters;

    // Check if all characters have motives
    const charactersWithoutMotives = characters.filter(
      (char) => !char.motives || char.motives.length === 0
    );
    if (charactersWithoutMotives.length > 0) {
      warnings.push(
        `${charactersWithoutMotives.length} characters lack motives`
      );
    }

    // Check secret distribution
    const secretCounts = characters.map((char) => char.secrets.length);
    const minSecrets = Math.min(...secretCounts);
    const maxSecrets = Math.max(...secretCounts);

    if (maxSecrets - minSecrets > 2) {
      warnings.push('Uneven secret distribution between characters');
    }

    // Check relationship coverage
    characters.forEach((char) => {
      const relationshipCount = Object.keys(char.relationships).length;
      const otherCharacterCount = characters.length - 1;

      if (relationshipCount < otherCharacterCount * 0.5) {
        warnings.push(
          `${char.name} has few relationships with other characters`
        );
      }
    });
  }

  private validateClueDistribution(
    scenario: GameScenario,
    warnings: string[]
  ): void {
    const clues = scenario.clues;

    // Check category distribution
    const categories = new Set(clues.map((clue) => clue.category));
    if (categories.size < 3) {
      warnings.push('Consider adding more clue categories for variety');
    }

    // Check reveal order
    const cluesWithOrder = clues.filter(
      (clue) => clue.revealOrder !== undefined
    );
    if (cluesWithOrder.length !== clues.length) {
      warnings.push('Some clues lack reveal order specification');
    }

    // Check character connections
    const charactersInClues = new Set();
    clues.forEach((clue) => {
      if (clue.relatedCharacters) {
        clue.relatedCharacters.forEach((charId) =>
          charactersInClues.add(charId)
        );
      }
    });

    const allCharacterIds = new Set(scenario.characters.map((char) => char.id));
    const unconnectedCharacters = [...allCharacterIds].filter(
      (id) => !charactersInClues.has(id)
    );

    if (unconnectedCharacters.length > 0) {
      warnings.push(
        `${unconnectedCharacters.length} characters not connected to any clues`
      );
    }
  }

  private validateGameplayBalance(
    scenario: GameScenario,
    warnings: string[]
  ): void {
    const { solution } = scenario;

    // Check key clues vs red herrings ratio
    const keyClueCount = solution.keyClues?.length || 0;
    const redHerringCount = solution.redHerrings?.length || 0;

    if (keyClueCount < 3) {
      warnings.push(
        'Consider having at least 3 key clues for solving the mystery'
      );
    }

    if (redHerringCount === 0) {
      warnings.push('Consider adding red herrings to increase difficulty');
    }

    if (redHerringCount > keyClueCount) {
      warnings.push('Too many red herrings may make the game frustrating');
    }

    // Check difficulty balance
    const totalClues = scenario.clues.length;
    const difficultyRatio = keyClueCount / totalClues;

    if (difficultyRatio > 0.7) {
      warnings.push('Game might be too easy - consider fewer key clues');
    } else if (difficultyRatio < 0.3) {
      warnings.push('Game might be too hard - consider more key clues');
    }
  }

  private validateNarrative(scenario: GameScenario, warnings: string[]): void {
    const { solution } = scenario;

    // Check if murderer is a valid character
    const murdererExists = scenario.characters.some(
      (char) => char.id === solution.murderer || char.name === solution.murderer
    );

    if (!murdererExists) {
      warnings.push('Murderer not found among scenario characters');
    }

    // Check explanation length
    if (solution.explanation.length < 100) {
      warnings.push('Solution explanation seems too brief');
    }

    // Check motive consistency
    const murdererChar = scenario.characters.find(
      (char) => char.id === solution.murderer || char.name === solution.murderer
    );

    if (murdererChar && murdererChar.motives) {
      const motiveKeywords = solution.motive.toLowerCase();
      const hasMatchingMotive = murdererChar.motives.some((motive) =>
        motive.toLowerCase().includes(motiveKeywords.split(' ')[0])
      );

      if (!hasMatchingMotive) {
        warnings.push('Solution motive may not align with character motives');
      }
    }
  }

  private calculateStats(scenario: GameScenario) {
    const characters = scenario.characters;
    const clues = scenario.clues;
    const solution = scenario.solution;

    const totalSecrets = characters.reduce(
      (sum, char) => sum + char.secrets.length,
      0
    );
    const categories = new Set(clues.map((clue) => clue.category));

    return {
      characterCount: characters.length,
      clueCount: clues.length,
      categoryCount: categories.size,
      averageSecretsPerCharacter: totalSecrets / characters.length,
      keyClueCount: solution.keyClues?.length || 0,
      redHerringCount: solution.redHerrings?.length || 0,
    };
  }

  public generateReport(scenario: GameScenario): string {
    const validation = this.validateScenario(scenario);
    const { stats } = validation;

    let report = `# Scenario Validation Report: ${scenario.title}\n\n`;

    report += `## Overview\n`;
    report += `- **Status**: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
    report += `- **Characters**: ${stats.characterCount}\n`;
    report += `- **Clues**: ${stats.clueCount}\n`;
    report += `- **Categories**: ${stats.categoryCount}\n`;
    report += `- **Difficulty**: ${scenario.difficulty}\n`;
    report += `- **Duration**: ${scenario.estimatedDuration} minutes\n\n`;

    if (validation.errors.length > 0) {
      report += `## ❌ Errors\n`;
      validation.errors.forEach((error) => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    if (validation.warnings.length > 0) {
      report += `## ⚠️ Warnings\n`;
      validation.warnings.forEach((warning) => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }

    report += `## 📊 Statistics\n`;
    report += `- **Average secrets per character**: ${stats.averageSecretsPerCharacter.toFixed(1)}\n`;
    report += `- **Key clues**: ${stats.keyClueCount}\n`;
    report += `- **Red herrings**: ${stats.redHerringCount}\n`;
    report += `- **Clue categories**: ${stats.categoryCount}\n\n`;

    if (validation.isValid && validation.warnings.length === 0) {
      report += `## ✨ Conclusion\n`;
      report += `This scenario is well-balanced and ready for gameplay!\n`;
    }

    return report;
  }
}

export const scenarioValidator = new ScenarioValidator();
