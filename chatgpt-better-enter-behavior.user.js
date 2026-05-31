// ==UserScript==
// @name         ChatGPT Better Enter Behavior
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Enter key for newline, Cmd+Enter (Mac) or Ctrl+Enter (Windows) to send message.
// @author       Jason Han
// @license      MIT
// @match        https://chatgpt.com/*
// ==/UserScript==

// Based on this: https://greasyfork.org/en/scripts/531913-ai-enter-as-newline
(() => {
  'use strict';

  function getEventTarget(e) {
    return e.composedPath ? e.composedPath()[0] || e.target : e.target;
  }

  function isInPromptTextArea(target) {
    return (
      target.id === 'prompt-textarea'
      || target.closest('#prompt-textarea')
      || (target.getAttribute && target.getAttribute('contenteditable') === 'true')
    );
  }

  function isPotentialSendShortcut(e) {
    if (e.key !== 'Enter') return false;

    const isCtrlOnly = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
    const isAltOnly = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    const isMetaOnly = e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
    return isCtrlOnly || isAltOnly || isMetaOnly;
  }

  function isSendShortcut(e) {
    if (e.key !== 'Enter') return false;

    const shortcuts = {
      ctrl: false, // Ctrl + Enter
      alt: false, // Alt/Option + Enter
      meta: true, // Win/Cmd/Super + Enter
    };
    return (
      (shortcuts.ctrl && e.ctrlKey && !e.altKey && !e.metaKey)
      || (shortcuts.alt && e.altKey && !e.ctrlKey && !e.metaKey)
      || (shortcuts.meta && e.metaKey && !e.ctrlKey && !e.altKey)
    );
  }

  function isPlainEnter(e) {
    return e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey;
  }

  window.addEventListener(
    'keydown',
    (e) => {
      if (isPlainEnter(e)) {
        const target = getEventTarget(e);
        if (isInPromptTextArea(target)) {
          e.stopPropagation();
          e.preventDefault();

          const shiftEnterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          });
          target.dispatchEvent(shiftEnterEvent);

          return;
        }
      }

      if (isSendShortcut(e)) {
        const target = getEventTarget(e);
        if (isInPromptTextArea(target)) {
          const submitButton = document.querySelector('button[data-testid="send-button"]');
          if (submitButton && !submitButton.disabled) {
            e.preventDefault();
            e.stopPropagation();
            submitButton.click();
          }
        }
      }

      if (isPotentialSendShortcut(e)) {
        const target = getEventTarget(e);
        if (isInPromptTextArea(target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    },
    true,
  );
})();
