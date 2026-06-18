import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

type StorageContextValue = {
  ready: boolean;
  savedSiteIds: string[];
  plannedSiteIds: string[];
  hasSeenOnboarding: boolean;
  bestChallengeScore: number;
  bestRunScore: number;
  toggleSavedSite: (id: string) => void;
  isSiteSaved: (id: string) => boolean;
  clearSavedSite: (id: string) => void;
  togglePlannedSite: (id: string) => void;
  isSitePlanned: (id: string) => boolean;
  completeOnboarding: () => void;
  updateBestChallengeScore: (score: number) => void;
  updateBestRunScore: (score: number) => void;
};

const storageSlots = {
  savedSites: 'ecoranger-wildlife:saved-sites',
  plannedSites: 'ecoranger-wildlife:planned-sites',
  briefing: 'ecoranger-wildlife:briefing-complete',
  challenge: 'ecoranger-wildlife:best-challenge',
  rescueRun: 'ecoranger-wildlife:best-rescue-run',
};

const StorageContext = createContext<StorageContextValue | undefined>(undefined);

export function StorageProvider({children}: {children: React.ReactNode}) {
  const [ready, setReady] = useState(false);
  const [savedSiteIds, setSavedSiteIds] = useState<string[]>([]);
  const [plannedSiteIds, setPlannedSiteIds] = useState<string[]>([]);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [bestChallengeScore, setBestChallengeScore] = useState(0);
  const [bestRunScore, setBestRunScore] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      const [storedSavedSites, storedPlannedSites, storedOnboarding, storedChallenge, storedRun] = await Promise.all([
        AsyncStorage.getItem(storageSlots.savedSites),
        AsyncStorage.getItem(storageSlots.plannedSites),
        AsyncStorage.getItem(storageSlots.briefing),
        AsyncStorage.getItem(storageSlots.challenge),
        AsyncStorage.getItem(storageSlots.rescueRun),
      ]);

      if (!active) {
        return;
      }

      setSavedSiteIds(readIdList(storedSavedSites));
      setPlannedSiteIds(readIdList(storedPlannedSites));
      setHasSeenOnboarding(storedOnboarding === 'true');
      setBestChallengeScore(storedChallenge ? Number(storedChallenge) : 0);
      setBestRunScore(storedRun ? Number(storedRun) : 0);
      setReady(true);
    }

    load().catch(() => setReady(true));

    return () => {
      active = false;
    };
  }, []);

  const persistSavedSites = useCallback((next: string[]) => {
    setSavedSiteIds(next);
    AsyncStorage.setItem(storageSlots.savedSites, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistPlannedSites = useCallback((next: string[]) => {
    setPlannedSiteIds(next);
    AsyncStorage.setItem(storageSlots.plannedSites, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggleSavedSite = useCallback(
    (id: string) => {
      const next = savedSiteIds.includes(id)
        ? savedSiteIds.filter(item => item !== id)
        : [...savedSiteIds, id];
      persistSavedSites(next);
    },
    [persistSavedSites, savedSiteIds],
  );

  const clearSavedSite = useCallback(
    (id: string) => {
      persistSavedSites(savedSiteIds.filter(item => item !== id));
    },
    [persistSavedSites, savedSiteIds],
  );

  const isSiteSaved = useCallback(
    (id: string) => savedSiteIds.includes(id),
    [savedSiteIds],
  );

  const togglePlannedSite = useCallback(
    (id: string) => {
      const next = plannedSiteIds.includes(id)
        ? plannedSiteIds.filter(item => item !== id)
        : [...plannedSiteIds, id];
      persistPlannedSites(next);
    },
    [persistPlannedSites, plannedSiteIds],
  );

  const isSitePlanned = useCallback(
    (id: string) => plannedSiteIds.includes(id),
    [plannedSiteIds],
  );

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    AsyncStorage.setItem(storageSlots.briefing, 'true').catch(() => {});
  }, []);

  const updateBestChallengeScore = useCallback(
    (score: number) => {
      if (score <= bestChallengeScore) {
        return;
      }
      setBestChallengeScore(score);
      AsyncStorage.setItem(storageSlots.challenge, String(score)).catch(() => {});
    },
    [bestChallengeScore],
  );

  const updateBestRunScore = useCallback(
    (score: number) => {
      if (score <= bestRunScore) {
        return;
      }
      setBestRunScore(score);
      AsyncStorage.setItem(storageSlots.rescueRun, String(score)).catch(() => {});
    },
    [bestRunScore],
  );

  const value = useMemo(
    () => ({
      ready,
      savedSiteIds,
      plannedSiteIds,
      hasSeenOnboarding,
      bestChallengeScore,
      bestRunScore,
      toggleSavedSite,
      isSiteSaved,
      clearSavedSite,
      togglePlannedSite,
      isSitePlanned,
      completeOnboarding,
      updateBestChallengeScore,
      updateBestRunScore,
    }),
    [
      bestRunScore,
      bestChallengeScore,
      clearSavedSite,
      completeOnboarding,
      hasSeenOnboarding,
      isSitePlanned,
      isSiteSaved,
      plannedSiteIds,
      ready,
      savedSiteIds,
      togglePlannedSite,
      toggleSavedSite,
      updateBestRunScore,
      updateBestChallengeScore,
    ],
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const context = useContext(StorageContext);

  if (!context) {
    throw new Error('useStorage must be used inside StorageProvider');
  }

  return context;
}

function readIdList(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
