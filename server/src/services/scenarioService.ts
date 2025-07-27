import { GameScenario, Character, Clue } from '../types';

export class ScenarioService {
  private scenarios: Map<string, GameScenario> = new Map();

  constructor() {
    this.loadDefaultScenarios();
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

  private loadDefaultScenarios(): void {
    // Create the default "Missing Heiress" scenario
    const missingHeiressScenario = this.createMissingHeiressScenario();
    this.scenarios.set(missingHeiressScenario.id, missingHeiressScenario);
  }

  private createMissingHeiressScenario(): GameScenario {
    const characters: Character[] = [
      {
        id: 'char_butler',
        name: 'James the Butler',
        description: 'The loyal family butler who has served the Blackwood family for 30 years.',
        publicInfo: 'Has been with the family for decades and knows all their secrets.',
        privateInfo: 'You discovered Lady Blackwood was planning to fire you and replace you with a younger butler. You have gambling debts that Lady Blackwood recently discovered.',
        secrets: [
          'You have been stealing small amounts of money from the household budget to pay gambling debts.',
          'You overheard Lady Blackwood on the phone with an employment agency last week.'
        ],
        relationships: {
          'char_heiress': 'Served her since she was a child',
          'char_nephew': 'Disapproves of his wild lifestyle',
          'char_doctor': 'Old friends, you recommended him to the family'
        }
      },
      {
        id: 'char_nephew',
        name: 'Richard Blackwood',
        description: 'Lady Blackwood\'s nephew and potential heir to the fortune.',
        publicInfo: 'A charming but irresponsible young man with expensive tastes.',
        privateInfo: 'You are deeply in debt and desperately need your inheritance. Lady Blackwood recently threatened to change her will.',
        secrets: [
          'You owe £50,000 to dangerous people who have threatened violence.',
          'You forged Lady Blackwood\'s signature on a check last month.'
        ],
        relationships: {
          'char_heiress': 'Your aunt who controls your inheritance',
          'char_butler': 'He knows about your debts and disapproves',
          'char_secretary': 'She handles your aunt\'s finances and knows too much'
        }
      },
      {
        id: 'char_doctor',
        name: 'Dr. Margaret Thornfield',
        description: 'The family physician and Lady Blackwood\'s close friend.',
        publicInfo: 'A respected doctor who has been treating the family for years.',
        privateInfo: 'You have been slowly poisoning Lady Blackwood with small doses of arsenic in her medication, planning to make it look like natural causes.',
        secrets: [
          'You have been having an affair with Lady Blackwood\'s late husband before he died.',
          'You falsified medical records to cover up the real cause of Lord Blackwood\'s death.'
        ],
        relationships: {
          'char_heiress': 'Your patient and friend for over 10 years',
          'char_butler': 'Old friends who trust each other',
          'char_gardener': 'You buy herbs from him for "medicinal purposes"'
        }
      },
      {
        id: 'char_secretary',
        name: 'Miss Eleanor Hartwell',
        description: 'Lady Blackwood\'s personal secretary and financial advisor.',
        publicInfo: 'Efficient and professional, she manages all of Lady Blackwood\'s affairs.',
        privateInfo: 'You have been embezzling money from Lady Blackwood\'s accounts for years. She was getting suspicious and hired an auditor.',
        secrets: [
          'You have stolen over £100,000 over the past five years.',
          'You created fake invoices and shell companies to hide the theft.'
        ],
        relationships: {
          'char_heiress': 'Your employer who trusts you completely',
          'char_nephew': 'You know about his financial troubles',
          'char_maid': 'She sometimes helps you with paperwork'
        }
      },
      {
        id: 'char_gardener',
        name: 'Thomas Green',
        description: 'The estate gardener who tends to the extensive grounds.',
        publicInfo: 'A quiet man who knows every inch of the estate and its hidden places.',
        privateInfo: 'You are actually Lady Blackwood\'s illegitimate son, given up for adoption. You recently discovered the truth and want recognition.',
        secrets: [
          'You found documents proving Lady Blackwood is your mother.',
          'You have been watching the family for months, planning your approach.'
        ],
        relationships: {
          'char_heiress': 'Your biological mother who doesn\'t know who you are',
          'char_doctor': 'She buys rare plants from you',
          'char_maid': 'You have romantic feelings for her'
        }
      },
      {
        id: 'char_maid',
        name: 'Sarah Mills',
        description: 'The young housemaid who sees and hears everything in the house.',
        publicInfo: 'Hardworking and observant, she keeps the house running smoothly.',
        privateInfo: 'You witnessed the murder but are too scared to speak up because you saw who did it and they threatened you.',
        secrets: [
          'You saw someone entering Lady Blackwood\'s room the night she died.',
          'You found a threatening note left in your room after the murder.'
        ],
        relationships: {
          'char_heiress': 'Your kind employer who treats you well',
          'char_secretary': 'She sometimes asks you to help with filing',
          'char_gardener': 'You suspect he has feelings for you'
        }
      }
    ];

    const clues: Clue[] = [
      {
        id: 'clue_poison_bottle',
        title: 'Empty Poison Bottle',
        content: 'A small glass bottle labeled "Arsenic - For Pest Control" found hidden in the garden shed. The bottle is empty but has recent fingerprints.',
        type: 'text',
        category: 'Physical Evidence',
        isPublic: true
      },
      {
        id: 'clue_threatening_letter',
        title: 'Threatening Letter',
        content: 'A letter found in Lady Blackwood\'s desk drawer: "Pay what you owe or face the consequences. You have one week." The handwriting is disguised.',
        type: 'text',
        category: 'Documents',
        isPublic: true
      },
      {
        id: 'clue_financial_records',
        title: 'Financial Discrepancies',
        content: 'Bank statements showing irregular withdrawals and transfers. Someone has been moving money from Lady Blackwood\'s accounts.',
        type: 'text',
        category: 'Financial',
        isPublic: true
      },
      {
        id: 'clue_medical_records',
        title: 'Medical Records',
        content: 'Lady Blackwood\'s recent medical records show elevated levels of arsenic in her blood from tests taken last month.',
        type: 'text',
        category: 'Medical',
        isPublic: true
      },
      {
        id: 'clue_witness_testimony',
        title: 'Witness Account',
        content: 'A neighbor reported seeing someone in dark clothing leaving the estate around midnight on the night of the murder.',
        type: 'text',
        category: 'Witness',
        isPublic: true
      },
      {
        id: 'clue_forged_signature',
        title: 'Forged Check',
        content: 'A check made out for £5,000 with Lady Blackwood\'s signature, but the handwriting analysis shows it\'s a forgery.',
        type: 'text',
        category: 'Documents',
        isPublic: true
      }
    ];

    return {
      id: 'scenario_missing_heiress',
      title: 'The Case of the Missing Heiress',
      description: 'Lady Victoria Blackwood, a wealthy heiress, has been found dead in her locked study. The cause appears to be poisoning, but who among her household had motive and opportunity?',
      characters,
      clues,
      solution: {
        murderer: 'Dr. Margaret Thornfield',
        motive: 'To cover up her affair with Lord Blackwood and prevent Lady Blackwood from discovering she had been slowly poisoning her.',
        method: 'Arsenic poisoning administered through her regular medication over several weeks, with a final lethal dose given the night of her death.',
        explanation: 'Dr. Thornfield had been having an affair with Lord Blackwood before his death and had been slowly poisoning Lady Blackwood to inherit her fortune through a forged will. When Lady Blackwood became suspicious and threatened to change doctors, Dr. Thornfield administered a final lethal dose of arsenic.'
      },
      minPlayers: 4,
      maxPlayers: 6
    };
  }
}
