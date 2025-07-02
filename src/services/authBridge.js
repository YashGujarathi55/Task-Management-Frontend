// authBridge.js
let onAuthError = null;

export const setAuthErrorHandler = (handler) => {
  onAuthError = handler;
};

export const triggerAuthError = () => {
  if (onAuthError) onAuthError();
};
