chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        const currentUrl = tab.url;
        const allowedUrls = [
            "https://chat.openai.com/",
            "https://stackoverflow.com/",
            "https://www.google.com/",
            "https://purmerend.jarvis.bit-academy.nl",
            "chrome://extensions/",
            "https://chat.jarvis.bit-academy.nl/"
            // Add more allowed URLs here
        ];

        if (!hasSearchQuery(currentUrl) && !allowedUrls.some(allowedUrl => currentUrl.startsWith(allowedUrl))) {
            // If the current URL is not in the allowed list and doesn't contain a search query, redirect to a default URL
            chrome.tabs.update(tabId, { url: "https://purmerend.jarvis.bit-academy.nl" });
        }
    }
});

function hasSearchQuery(url) {
    // Check if the URL contains a query parameter (e.g., "?q=")
    const queryParameter = "?q=";

    return url.includes(queryParameter);
}
