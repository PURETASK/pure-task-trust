import { useState, useCallback, useRef } from 'react';

interface RateLimiterOptions {
  maxAttempts?: number;
  windowMs?: number;
  lockoutMs?: number;
}

export function useRateLimiter({
  maxAttempts = 3,
  windowMs = 60_000, // 1 minute
  lockoutMs = 30_000, // 30 seconds
}: RateLimiterOptions = {}) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<number | null>(null);
  const attemptsRef = useRef<number[]>([]);

  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Check if currently locked out
    if (lockoutEndsAt && now < lockoutEndsAt) {
      return false;
    }
    
    // Clear lockout if expired
    if (lockoutEndsAt && now >= lockoutEndsAt) {
      setIsLocked(false);
      setLockoutEndsAt(null);
      attemptsRef.current = [];
    }

    // Clean old attempts outside window
    attemptsRef.current = attemptsRef.current.filter(t => now - t < windowMs);

    if (attemptsRef.current.length >= maxAttempts) {
      const lockEnd = now + lockoutMs;
      setIsLocked(true);
      setLockoutEndsAt(lockEnd);
      setTimeout(() => {
        setIsLocked(false);
        setLockoutEndsAt(null);
        attemptsRef.current = [];
      }, lockoutMs);
      return false;
    }

    attemptsRef.current.push(now);
    return true;
  }, [maxAttempts, windowMs, lockoutMs, lockoutEndsAt]);

  const remainingSeconds = lockoutEndsAt 
    ? Math.max(0, Math.ceil((lockoutEndsAt - Date.now()) / 1000))
    : 0;

  return { checkLimit, isLocked, remainingSeconds };
}
