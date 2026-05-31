// ==UserScript==
// @name         Claude Better Enter Behavior
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Enter key for newline, Cmd+Enter (Mac) or Ctrl+Enter (Windows) to send message.
// @author       Jason Han
// @license      MIT
// @match        https://claude.ai/*
// ==/UserScript==

// Based on this: https://greasyfork.org/en/scripts/531913-ai-enter-as-newline
(() => {
  'use strict';

  function getEventTarget(e) {
    return e.composedPath ? e.composedPath()[0] || e.target : e.target;
  }

  function isInPromptTextArea(target) {
    return (
      target.dataset?.testid === 'chat-input'
      || target.closest('[data-testid="chat-input"]')
      || target.tagName === 'TEXTAREA'
    );
  }

  function isPlainEnter(e) {
    return e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey;
  }

  function isSendShortcut(e) {
    if (e.key !== 'Enter') return false;
    const isCtrlOnly = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
    const isMetaOnly = e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
    return isCtrlOnly || isMetaOnly;
  }

  function isPotentialSendShortcut(e) {
    if (e.key !== 'Enter') return false;
    const isCtrlOnly = e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey;
    const isAltOnly = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    const isMetaOnly = e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
    return isCtrlOnly || isAltOnly || isMetaOnly;
  }

  function handleKeydown(e) {
    if (e.isComposing || e.keyCode === 229) return;

    if (isPlainEnter(e)) {
      const target = getEventTarget(e);
      if (isInPromptTextArea(target)) {
        e.preventDefault();
        e.stopPropagation();

        if (target.tagName === 'TEXTAREA') {
          const start = target.selectionStart;
          const end = target.selectionEnd;
          const value = target.value;
          target.value = value.substring(0, start) + '\n' + value.substring(end);
          target.selectionStart = target.selectionEnd = start + 1;
          target.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          const shiftEnter = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
          });
          target.dispatchEvent(shiftEnter);

          if (!shiftEnter.defaultPrevented) {
            document.execCommand('insertParagraph');
          }
        }
        return;
      }
    }

    if (isSendShortcut(e)) return;

    if (isPotentialSendShortcut(e)) {
      const target = getEventTarget(e);
      if (isInPromptTextArea(target)) {
        e.stopPropagation();
      }
    }
  }

  function handleKeypress(e) {
    if (e.isComposing || e.keyCode === 229) return;

    if (isPlainEnter(e)) {
      const target = getEventTarget(e);
      if (isInPromptTextArea(target)) {
        e.stopPropagation();
      }
    }

    if (isSendShortcut(e)) return;

    if (isPotentialSendShortcut(e)) {
      const target = getEventTarget(e);
      if (isInPromptTextArea(target)) {
        e.stopPropagation();
      }
    }
  }

  window.addEventListener('keydown', handleKeydown, true);
  window.addEventListener('keypress', handleKeypress, true);
})();
