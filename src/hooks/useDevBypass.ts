import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DevBypassState,
  hasUrlFlag,
  isOwnerEmail,
  isPreviewHost,
  readBypassState,
  writeBypassState,
} from '@/lib/devBypass';

/**
 * Returns the active dev-bypass state.
 * `active` is true only when:
 *   - we're on a preview host AND
 *   - (the logged-in user is an owner OR ?devPreview=1 is in the URL) AND
 *   - the user has explicitly enabled it via the Dev Tools widget
 */
export function useDevBypass() {
  const { user } = useAuth();
  const [state, setState] = useState<DevBypassState>(() => readBypassState());

  useEffect(() => {
    const handler = () => setState(readBypassState());
    window.addEventListener('puretask:dev-bypass-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('puretask:dev-bypass-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const allowed = isPreviewHost() && (isOwnerEmail(user?.email) || hasUrlFlag());
  const active = allowed && state.enabled;

  return {
    allowed,
    active,
    state,
    update: (patch: Partial<DevBypassState>) => writeBypassState({ ...state, ...patch }),
  };
}
