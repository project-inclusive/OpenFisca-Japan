import { useEffect, useState } from 'react';

import {
  createInitialReferralState,
  REFERRAL_STORAGE_KEY,
  sanitizeReferralState,
} from '../state';
import { ReferralState } from '../types';

export const loadReferralSession = (): ReferralState => {
  if (typeof window === 'undefined') {
    return createInitialReferralState();
  }

  try {
    const savedState = window.sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!savedState) {
      return createInitialReferralState();
    }

    const restoredState = sanitizeReferralState(JSON.parse(savedState));
    if (restoredState) {
      return restoredState;
    }

    window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    try {
      window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch {
      // sessionStorage itself can be blocked. Continue with in-memory state.
    }
  }

  return createInitialReferralState();
};

export const clearReferralSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers. The in-memory
    // flow remains usable even when clearing persistent state fails.
  }
};

export const useReferralSession = (state: ReferralState) => {
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        REFERRAL_STORAGE_KEY,
        JSON.stringify(state)
      );
      setStorageError(null);
    } catch {
      setStorageError(
        '入力内容をこのタブに保存できませんでした。画面を再読み込みせずにご利用ください。'
      );
    }
  }, [state]);

  return { storageError };
};
