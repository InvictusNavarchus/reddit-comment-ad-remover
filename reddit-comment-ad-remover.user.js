// ==UserScript==
// @name         Reddit Comment Ad Remover
// @namespace    https://github.com/InvictusNavarchus/reddit-comment-ad-remover
// @downloadURL  https://raw.githubusercontent.com/InvictusNavarchus/reddit-comment-ad-remover/master/reddit-comment-ad-remover.user.js
// @updateURL    https://raw.githubusercontent.com/InvictusNavarchus/reddit-comment-ad-remover/master/reddit-comment-ad-remover.user.js
// @icon         https://www.redditinc.com/assets/images/site/reddit-logo.png
// @version      0.1.0
// @description  Removes ads from Reddit comment sections based on shreddit-comments-page-ad and shreddit-comment-tree-ad elements.
// @author       InvictusNavarchus
// @match        https://www.reddit.com/r/*/comments/*
// @match        https://www.reddit.com/
// @match        https://www.reddit.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Function to identify and remove all types of ad elements
    function removeAds() {
        let adsRemovedThisRun = 0;

        // --- Comment Ads ---

        // 1. Remove standalone ad containers in comments, e.g., <shreddit-comments-page-ad class="promotedlink">
        const standaloneAds = document.querySelectorAll('shreddit-comments-page-ad.promotedlink');
        standaloneAds.forEach(ad => {
            if (ad.parentElement) {
                console.log('Reddit Ad Remover: Removing standalone comment ad:', ad.id || ad.className);
                ad.parentElement.removeChild(ad);
                adsRemovedThisRun++;
            }
        });

        // 2. Remove ad placeholders/wrappers within the comment tree, e.g., <shreddit-comment-tree-ad>
        const commentTreeAdPlaceholders = document.querySelectorAll('shreddit-comment-tree-ad');
        commentTreeAdPlaceholders.forEach(placeholder => {
            if (placeholder.parentElement) {
                const isLikelyAd = placeholder.querySelector('shreddit-comments-page-ad') || (placeholder.id && placeholder.id.startsWith('comment-tree-ad_'));
                if (isLikelyAd) {
                    console.log('Reddit Ad Remover: Removing comment tree ad placeholder:', placeholder.id || placeholder.className);
                    placeholder.parentElement.removeChild(placeholder);
                    adsRemovedThisRun++;
                }
            }
        });

        // 3. Remove <shreddit-comment-tree-ads> containers, which hold ad templates.
        const adTemplateContainers = document.querySelectorAll('shreddit-comment-tree-ads');
        adTemplateContainers.forEach(container => {
            if (container.parentElement) {
                console.log('Reddit Ad Remover: Removing ad template container:', container.id || container.className);
                container.parentElement.removeChild(container);
                adsRemovedThisRun++;
            }
        });

        // --- Post/Feed Ads ---

        // 4. Remove promoted posts from the main feed, typically <shreddit-ad-post>
        const promotedPosts = document.querySelectorAll('shreddit-ad-post.promotedlink, shreddit-ad-post[promoted]');
        promotedPosts.forEach(ad => {
            if (ad.parentElement) {
                console.log('Reddit Ad Remover: Removing promoted post:', ad.id || ad.className);

                // Ads in the feed are sometimes preceded by an <hr> separator. Remove it to avoid double lines.
                if (ad.previousElementSibling && ad.previousElementSibling.tagName === 'HR') {
                    ad.previousElementSibling.remove();
                }

                ad.remove(); // Modern and cleaner way to remove the element
                adsRemovedThisRun++;
            }
        });

        if (adsRemovedThisRun > 0) {
            console.log(`Reddit Ad Remover: Removed ${adsRemovedThisRun} ad elements in this pass.`);
        }
    }

    // Initial removal attempts on page load
    requestAnimationFrame(() => {
        removeAds();
        // Additional checks for late-loading elements
        setTimeout(removeAds, 500);
        setTimeout(removeAds, 1500);
    });

    // --- Dynamic Ad Detection ---

    // Define all known ad selectors in one place for easier maintenance
    const adSelectors = [
        'shreddit-comments-page-ad.promotedlink',
        'shreddit-comment-tree-ad',
        'shreddit-comment-tree-ads',
        'shreddit-ad-post.promotedlink',
        'shreddit-ad-post[promoted]'
    ].join(', ');

    // Observe DOM changes to catch dynamically loaded ads (e.g., from infinite scroll)
    const observer = new MutationObserver(mutations => {
        let potentialAdsAdded = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    // Check if the added node is an element node
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node itself is an ad, or if it contains an ad.
                        if (node.matches(adSelectors) || node.querySelector(adSelectors)) {
                            potentialAdsAdded = true;
                            break;
                        }
                    }
                }
            }
            if (potentialAdsAdded) break;
        }

        if (potentialAdsAdded) {
            // Use requestAnimationFrame to run removeAds efficiently after DOM changes
            requestAnimationFrame(removeAds);
        }
    });

    // Start observing the entire document body for new nodes
    observer.observe(document.body, {
        childList: true, // Observe additions or removals of child nodes
        subtree: true    // Observe changes in all descendants
    });

    console.log('Reddit Ad Remover userscript active.');

})();