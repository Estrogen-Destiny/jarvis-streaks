chrome.webRequest.onCompleted.addListener((event) => {
    if (event.url.includes('streaks'))
        console.log(event);
},
    { urls: ["<all_urls>"] }
)

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

        // Check if the current tab is a new tab
        if (tab.url === "chrome://newtab/") {
            return; // Do nothing for new tabs
        }

        if (!isAllowedUrl(currentUrl, allowedUrls)) {
            // If the current URL is not in the allowed list, redirect to a default URL
            chrome.tabs.update(tabId, { url: "https://purmerend.jarvis.bit-academy.nl" });
        }
    }
});

function isAllowedUrl(url, allowedUrls) {
    return allowedUrls.some(allowedUrl => url.startsWith(allowedUrl));
}
