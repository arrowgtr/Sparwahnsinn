// ==UserScript==
// @name         Smart Form Auto-Filler with Overlay Remover
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Removes overlay and fills form with specific random selections
// @author       You
// @match        https://sante-testen.de/reinigungsgel*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('Smart Form Auto-Filler loaded');

    // Remove overlay immediately and keep checking
    removeOverlay();
    setInterval(removeOverlay, 500); // Check every 500ms

    // Wait for page to fully load
    window.addEventListener('load', function() {
        setTimeout(fillFormRandomly, 1500); // Wait 1.5 seconds after page load
    });

    function removeOverlay() {
        // Remove the sold out overlay
        const overlay = document.querySelector('.soldOutOverlay');
        if (overlay) {
            overlay.remove();
            console.log('Overlay removed!');
        }

        // Also remove any other blocking overlays
        const allOverlays = document.querySelectorAll('[class*="soldOut"], [class*="overlay"]');
        allOverlays.forEach(el => {
            if (el.style.display !== 'none') {
                el.style.display = 'none';
            }
        });
    }

    function fillFormRandomly() {
        console.log('Starting form filling...');

        // Question 0: Wie oft kaufen Sie ein Reinigungsgel? (1 random)
        handleQuestion0();

        // Question 8: Was ist für Sie bei der Auswahl am wichtigsten? (1 random)
        handleQuestion8();

        // Question 10: Haben Sie schon einmal SANTE ausprobiert? (Always "Ja")
        handleQuestion10();

        // Question 13: Was erwarten Sie von einem Reinigungsgel? (3 random)
        handleQuestion13();

        // Check terms and conditions
        checkTermsAndConditions();

        console.log('Form filling complete!');
    }

    function handleQuestion0() {
        // Get all radio buttons for question 0
        const radios = document.querySelectorAll('input[id^="root_question0_"]');

        if (radios.length > 0) {
            // Pick one random option
            const randomIndex = Math.floor(Math.random() * radios.length);
            const selectedRadio = radios[randomIndex];
            selectedRadio.checked = true;
            selectedRadio.click();

            const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
            console.log(`Question 0: Selected "${label ? label.textContent.trim() : 'option ' + (randomIndex + 1)}"`);
        }
    }

    function handleQuestion8() {
        // Get all checkboxes for question 8
        const checkboxes = document.querySelectorAll('#root_question8 input[type="checkbox"]');

        if (checkboxes.length > 0) {
            console.log(`Found ${checkboxes.length} checkboxes for Question 8`);

            // Uncheck all first
            checkboxes.forEach(cb => {
                cb.checked = false;
            });

            // Pick ONE random checkbox
            const randomIndex = Math.floor(Math.random() * checkboxes.length);
            const selectedCheckbox = checkboxes[randomIndex];

            // Try multiple ways to check it
            selectedCheckbox.checked = true;
            selectedCheckbox.setAttribute('checked', 'checked');

            // Trigger events
            selectedCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
            selectedCheckbox.dispatchEvent(new Event('click', { bubbles: true }));
            selectedCheckbox.dispatchEvent(new Event('input', { bubbles: true }));

            const label = document.querySelector(`label[for="${selectedCheckbox.id}"]`);
            console.log(`Question 8: Selected "${label ? label.textContent.trim() : 'option ' + (randomIndex + 1)}" (ID: ${selectedCheckbox.id})`);
        } else {
            console.log('No checkboxes found for Question 8');
        }
    }

    function handleQuestion10() {
        // Always select "Ja" (first option)
        const jaRadio = document.querySelector('input[id="root_question10_0"]');

        if (jaRadio) {
            jaRadio.checked = true;
            jaRadio.click();
            console.log('Question 10: Selected "Ja"');
        }
    }

    function handleQuestion13() {
        // Get all checkboxes for question 13
        const checkboxes = document.querySelectorAll('#root_question13 input[type="checkbox"]');

        if (checkboxes.length > 0) {
            console.log(`Found ${checkboxes.length} checkboxes for Question 13`);

            // Uncheck all first
            checkboxes.forEach(cb => {
                cb.checked = false;
            });

            // Create array of indices and shuffle
            const indices = Array.from({length: checkboxes.length}, (_, i) => i);
            shuffleArray(indices);

            // Select exactly 3 random checkboxes
            const numToSelect = Math.min(3, checkboxes.length);
            const selectedLabels = [];

            for (let i = 0; i < numToSelect; i++) {
                const checkbox = checkboxes[indices[i]];

                // Try multiple ways to check it
                checkbox.checked = true;
                checkbox.setAttribute('checked', 'checked');

                // Trigger events
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                checkbox.dispatchEvent(new Event('click', { bubbles: true }));
                checkbox.dispatchEvent(new Event('input', { bubbles: true }));

                const label = document.querySelector(`label[for="${checkbox.id}"]`);
                if (label) {
                    selectedLabels.push(label.textContent.trim());
                }
            }

            console.log(`Question 13: Selected 3 options: ${selectedLabels.join(', ')}`);
        } else {
            console.log('No checkboxes found for Question 13');
        }
    }

    function checkTermsAndConditions() {
        const termsCheckbox = document.querySelector('#root_termsAndPrivacy');
        if (termsCheckbox && !termsCheckbox.checked) {
            termsCheckbox.checked = true;
            termsCheckbox.click();
            console.log('Terms and conditions checked');
        }
    }

    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Add a manual trigger button (optional)
    function addTriggerButton() {
        const button = document.createElement('button');
        button.textContent = '🎲 Fill Form';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 99999;
            padding: 12px 24px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            transition: all 0.3s;
        `;

        button.onmouseover = () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
        };

        button.onmouseout = () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
        };

        button.onclick = () => {
            removeOverlay();
            fillFormRandomly();
        };

        document.body.appendChild(button);
    }

    // Add the button
    addTriggerButton();

})();