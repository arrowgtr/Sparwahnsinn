// ==UserScript==
// @name         Captcha Solver Scheduled + Retry (Ctrl+R)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Solve 4-digit numeric captchas automatically at specific time + retry if field empty, Ctrl+R manual trigger
// @author       You
// @match        https://sante-testen.de/reinigungsgel*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js
// ==/UserScript==

(function() {
  'use strict';

  console.log('✅ Captcha Solver loaded — Ctrl+R manual or scheduled execution');

  let isRunning = false;
  let retryCount = 0;
  const maxRetries = 10;

  // Scheduled time configuration
  const TARGET_TIME = "06:59:58"; // Berlin time in HH:MM:SS
  const CHECK_INTERVAL = 1000; // Check every second

  // 💬 Visual counter
  const counterDiv = document.createElement('div');
  counterDiv.style.position = 'fixed';
  counterDiv.style.bottom = '20px';
  counterDiv.style.right = '20px';
  counterDiv.style.zIndex = '999999';
  counterDiv.style.background = 'rgba(0,0,0,0.7)';
  counterDiv.style.color = '#0f0';
  counterDiv.style.padding = '10px 15px';
  counterDiv.style.borderRadius = '8px';
  counterDiv.style.fontFamily = 'monospace';
  counterDiv.style.fontSize = '16px';
  counterDiv.style.display = 'none';
  counterDiv.style.boxShadow = '0 0 10px #0f0';
  counterDiv.textContent = 'Ready (Ctrl+R)';
  document.body.appendChild(counterDiv);

  function updateCounter() {
    if (!isRunning) {
      counterDiv.textContent = 'Ready (Ctrl+R)';
      counterDiv.style.color = '#0f0';
    } else {
      counterDiv.textContent = `🔁 Attempt ${retryCount + 1} / ${maxRetries}`;
      counterDiv.style.color = retryCount < maxRetries ? '#0f0' : '#f00';
    }
    counterDiv.style.display = 'block';
  }

  // 🧠 Solve captcha once
  async function solveCaptchaOnce() {
    const img = document.querySelector('img[src*="captcha"], img[alt*="captcha"]');
    const input = document.querySelector('input[name="captcha"], input[id*="captcha"]');
    const button = document.querySelector('#btnSubmit, button[type="submit"], button[name="btnSubmit"]');

    if (!img || !input || !button) {
      console.log('⚠️ Captcha elements not found');
      return false;
    }

    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    try {
      const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng', {
        tessedit_char_whitelist: '0123456789'
      });

      const solved = text.trim().replace(/\D/g, '').slice(0, 4);
      console.log(`🔢 OCR result: [${solved}]`);

      if (solved.length === 4) {
        input.value = solved;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => button.click(), 500);
        console.log('✅ Captcha filled and submitted');
        return true;
      } else {
        console.log('❌ Invalid OCR result');
        return false;
      }
    } catch (err) {
      console.error('⚠️ OCR error:', err);
      return false;
    }
  }

  // 🔁 Retry loop until field filled or max retries
  async function startRetryLoop() {
    retryCount = 0;
    isRunning = true;
    updateCounter();

    const input = document.querySelector('input[name="captcha"], input[id*="captcha"]');
    if (!input) {
      console.log('⚠️ No captcha input found');
      isRunning = false;
      return;
    }

    while (isRunning && retryCount < maxRetries) {
      retryCount++;
      updateCounter();
      await solveCaptchaOnce();

      // Wait 2 seconds, check if input is filled
      await new Promise(res => setTimeout(res, 2000));
      if (input.value && input.value.length === 4) {
        console.log('✅ Captcha accepted, stopping retries');
        isRunning = false;
        break;
      } else {
        console.log('⚠️ Captcha field empty — retrying...');
      }
    }

    if (retryCount >= maxRetries) {
      console.log('⛔ Max retries reached');
      counterDiv.textContent = '❌ Max retries reached';
      counterDiv.style.color = '#f00';
      isRunning = false;
    }

    updateCounter();
  }

  // 🕒 Scheduled execution
  function getBerlinTime() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  }

  function startScheduler() {
    const interval = setInterval(() => {
      const now = getBerlinTime();
      const [h, m, s] = TARGET_TIME.split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() === s) {
        clearInterval(interval);
        console.log(`🎯 Scheduled time reached (${TARGET_TIME} Berlin) — starting captcha solver`);
        startRetryLoop();
      }
    }, 1000);
  }

  // 🎯 Ctrl+R manual trigger
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      if (!isRunning) {
        console.log('🚀 Ctrl+R manual captcha retries starting...');
        startRetryLoop();
      } else {
        console.log('⚠️ Already running');
      }
    }
  });

  // 🛑 Stop if page reloads
  window.addEventListener('beforeunload', () => {
    isRunning = false;
    console.log('🛑 Page reloading — stopping solver');
  });

  // Start scheduler immediately
  startScheduler();
})();
