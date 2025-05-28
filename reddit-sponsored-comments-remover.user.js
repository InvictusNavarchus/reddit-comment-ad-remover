// ==UserScript==
// @name         Reddit Comment Ad Remover
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Removes ads from Reddit comment sections based on shreddit-comments-page-ad and shreddit-comment-tree-ad elements.
// @author       Your AI Assistant
// @match        https://www.reddit.com/r/*/comments/*
// @match        https://www.reddit.com/
// @match        https://www.reddit.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Function to identify and remove ad elements
    function removeAds() {
        let adsRemovedThisRun = 0;

        // 1. Remove standalone ad containers, typically <shreddit-comments-page-ad class="promotedlink">
        // These can appear directly in the feed or comments page.
        const standaloneAds = document.querySelectorAll('shreddit-comments-page-ad.promotedlink');
        standaloneAds.forEach(ad => {
            // It's good practice to ensure the parent exists before removing.
            if (ad.parentElement) {
                console.log('Reddit Ad Remover: Removing standalone ad element:', ad.id || ad.className);
                ad.parentElement.removeChild(ad); // Removing the element itself
                adsRemovedThisRun++;
            }
        });

        // 2. Remove ad placeholders/wrappers within the comment tree, typically <shreddit-comment-tree-ad>
        // These elements often act as slots where ads (like <shreddit-comments-page-ad>) are injected.
        // Removing the wrapper <shreddit-comment-tree-ad> is usually effective.
        const commentTreeAdPlaceholders = document.querySelectorAll('shreddit-comment-tree-ad');
        commentTreeAdPlaceholders.forEach(placeholder => {
            if (placeholder.parentElement) {
                // Check if it directly contains a known ad structure or if its ID suggests it's an ad slot.
                const actualAdInside = placeholder.querySelector('shreddit-comments-page-ad.promotedlink');
                const isLikelyAdSlot = placeholder.id && placeholder.id.startsWith('comment-tree-ad_');

                if (actualAdInside || isLikelyAdSlot || placeholder.classList.contains('promotedlink')) {
                    console.log('Reddit Ad Remover: Removing comment tree ad placeholder:', placeholder.id || placeholder.className);
                    placeholder.parentElement.removeChild(placeholder);
                    adsRemovedThisRun++;
                }
            }
        });

        // 3. Remove the <shreddit-comment-tree-ads> container, which usually holds ad templates.
        // This can prevent ads defined in templates from being instantiated.
        const adTemplateContainers = document.querySelectorAll('shreddit-comment-tree-ads');
        adTemplateContainers.forEach(container => {
            if (container.parentElement) {
                console.log('Reddit Ad Remover: Removing ad template container:', container.id || container.className);
                container.parentElement.removeChild(container);
                adsRemovedThisRun++;
            }
        });

        if (adsRemovedThisRun > 0) {
            console.log(`Reddit Ad Remover: Removed ${adsRemovedThisRun} ad elements in this pass.`);
        }
    }

    // Initial removal attempt when the script runs
    // Using requestAnimationFrame to ensure the DOM is more likely to be settled
    requestAnimationFrame(() => {
        removeAds();
        // Second pass shortly after, as Reddit's new UI can be tricky with timing
        setTimeout(removeAds, 500);
        setTimeout(removeAds, 1500); // And another one for good measure
    });


    // Observe DOM changes to catch dynamically loaded ads
    const observer = new MutationObserver(mutations => {
        let potentialAdsAdded = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node itself is an ad or contains an ad
                        if (node.matches && (node.matches('shreddit-comments-page-ad.promotedlink') || node.matches('shreddit-comment-tree-ad') || node.matches('shreddit-comment-tree-ads'))) {
                            potentialAdsAdded = true;
                            break;
                        }
                        if (node.querySelector && (node.querySelector('shreddit-comments-page-ad.promotedlink') || node.querySelector('shreddit-comment-tree-ad') || node.querySelector('shreddit-comment-tree-ads'))) {
                            potentialAdsAdded = true;
                            break;
                        }
                    }
                }
            }
            if (potentialAdsAdded) break;
        }

        if (potentialAdsAdded) {
            // console.log('Reddit Ad Remover: DOM changed, re-checking for ads...');
            // Use requestAnimationFrame to batch DOM changes and avoid layout thrashing
            requestAnimationFrame(removeAds);
        }
    });

    // Start observing the document body for broader coverage, as ads can be injected in various places.
    // Reddit's structure can be complex, so observing the body is a safe bet.
    observer.observe(document.body, {
        childList: true, // Observe additions or removals of child nodes
        subtree: true    // Observe changes in all descendants of the target
    });

    // Fallback: Periodically run removeAds, as some ad injection methods might evade MutationObserver
    // This is a less efficient fallback but can catch stubborn ads.
    // setInterval(removeAds, 3000); // Adjust interval as needed.

    console.log('Reddit Comment Ad Remover userscript active.');
})();
