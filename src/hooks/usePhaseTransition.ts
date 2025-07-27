import { useState } from 'react';
import { GamePhase } from '../types/index';

// Hook for managing phase transitions
export const usePhaseTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    fromPhase: GamePhase;
    toPhase: GamePhase;
  } | null>(null);

  const startTransition = (fromPhase: GamePhase, toPhase: GamePhase) => {
    setTransitionData({ fromPhase, toPhase });
    setIsTransitioning(true);
  };

  const completeTransition = () => {
    setIsTransitioning(false);
    setTransitionData(null);
  };

  return {
    isTransitioning,
    transitionData,
    startTransition,
    completeTransition,
  };
};
