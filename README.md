# Reddit Comment Ad Remover

**Reddit Comment Ad Remover** is a userscript designed to enhance your Browse experience on Reddit by decluttering comment sections. Its primary function is to identify and remove various forms of advertisements and promoted content that appear within and around comment threads. This allows for a cleaner, less distracting, and more focused reading experience, letting you engage with discussions without interruption.

The script works by targeting specific HTML structures and custom elements (like `shreddit-comments-page-ad`, `shreddit-comment-tree-ad`, and `shreddit-comment-tree-ads`) that Reddit commonly uses to display ads. To effectively handle Reddit's dynamic loading of content (such as with infinite scrolling or expanding comment chains), the userscript utilizes a `MutationObserver`. This powerful browser feature allows the script to monitor the page for changes in real-time and remove newly injected ad elements as they appear, ensuring continued cleanliness as you navigate.

## License

This project is open-source and is licensed under the **MIT License**. You are free to use, inspect, modify, and distribute it according to the terms of the license.