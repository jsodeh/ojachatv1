/**
 * This file is kept for backward compatibility but is no longer used
 * as all users are now required to authenticate.
 */

// Setting to 0 ensures all anonymous attempts will be blocked
export const ANONYMOUS_CHAT_LIMIT = 0;

// Key for local storage
const ANONYMOUS_CHATS_KEY = 'anonymous_chats_count';

/**
 * Get the current number of chats started by anonymous user
 * @deprecated - App now requires authentication
 */
export const getAnonymousChatCount = (): number => {
  return ANONYMOUS_CHAT_LIMIT; // Always return the limit (0) to block anonymous usage
};

/**
 * Always returns true since anonymous usage is no longer allowed
 * @deprecated - App now requires authentication
 */
export const hasReachedAnonymousChatLimit = (): boolean => {
  return true;
};

/**
 * No-op function kept for backward compatibility
 * @deprecated - App now requires authentication
 */
export const incrementAnonymousChatCount = (): number => {
  return ANONYMOUS_CHAT_LIMIT;
};

/**
 * No-op function kept for backward compatibility
 * @deprecated - App now requires authentication
 */
export const resetAnonymousChatCount = (): void => {
  // No-op
}; 