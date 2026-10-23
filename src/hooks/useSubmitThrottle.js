/**
 * useSubmitThrottle — Reusable client-side brute-force / spam protection hook.
 *
 * Behaviour:
 *  - Tracks consecutive failures.
 *  - After `maxAttempts` failures, locks the form for an exponentially growing
 *    cooldown period (baseSecs → baseSecs*2 → baseSecs*4 … capped at maxSecs).
 *  - On success, resets all counters.
 *  - Returns helpers that any form page can consume without duplicating logic.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

export function useSubmitThrottle({
  maxAttempts = 3,
  baseSecs = 30,
  maxSecs = 600
} = {}) {
  const [failCount, setFailCount]   = useState(0)
  const [lockoutEnd, setLockoutEnd] = useState(null)   // timestamp ms
  const [countdown, setCountdown]   = useState(0)      // seconds remaining
  const timerRef = useRef(null)

  // Countdown ticker
  useEffect(() => {
    if (!lockoutEnd) return
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000)
      if (remaining <= 0) {
        setCountdown(0)
        setLockoutEnd(null)
        clearInterval(timerRef.current)
      } else {
        setCountdown(remaining)
      }
    }, 500)
    return () => clearInterval(timerRef.current)
  }, [lockoutEnd])

  const isLockedOut = !!(lockoutEnd && Date.now() < lockoutEnd)

  // Call this inside the form's catch block
  const recordFailure = useCallback(() => {
    setFailCount(prev => {
      const newFail = prev + 1
      const tier = newFail - maxAttempts
      if (tier > 0) {
        const secs = Math.min(baseSecs * Math.pow(2, tier - 1), maxSecs)
        setLockoutEnd(Date.now() + secs * 1000)
        setCountdown(secs)
      }
      return newFail
    })
  }, [maxAttempts, baseSecs, maxSecs])

  // Call this inside the form's success block
  const recordSuccess = useCallback(() => {
    setFailCount(0)
    setLockoutEnd(null)
    setCountdown(0)
    clearInterval(timerRef.current)
  }, [])

  // How many attempts remain before lock kicks in
  const attemptsLeft = Math.max(0, maxAttempts - failCount)

  return { isLockedOut, countdown, failCount, attemptsLeft, recordFailure, recordSuccess }
}
