const fetchedURLs = {};
let searchPower = false;

chrome.webRequest.onCompleted.addListener(event => {
    if (event.url.includes('streaks')) {
        if (fetchedURLs[event.url]) {
            return;
        }

        fetchedURLs[event.url] = true;

        fetch(event.url)
            .then(response => {
                if (!response.ok) {
                    throw Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const currentStreakLength = data.currentStreakLength;
                const daysThisWeek = data.daysThisWeek;
                const freezesAvailable = data.freezesAvailable;

                console.log('Current Streak Length: ' + currentStreakLength);
                console.log(daysThisWeek);
                console.log('Freezes Available: ' + freezesAvailable);

                if (daysThisWeek.hasOwnProperty(dayOfWeek)) {
                    searchPower = true;
                    console.log(searchPower);
                } else {
                    console.log(`Day of the week ${dayOfWeek} is not connected to daysThisWeek.`);
                    console.log(searchPower);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation: ' + error.message);
                if (!isAllowedUrl(event.url, allowedUrls)) {
                    if (!searchPower) {
                        chrome.tabs.update({ url: "https://purmerend.jarvis.bit-academy.nl" });
                    }
                }
            });
    }
    return;
}, { urls: ["<all_urls>"] });

var today = new Date();
var dayOfWeek = (today.getDay() - 1 + 7) % 7;

console.log(dayOfWeek);

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
        ];

        if (tab.url === "chrome://newtab/") {
            return;
        }

        if (!isAllowedUrl(currentUrl, allowedUrls) && !searchPower) { 
            chrome.tabs.update(tabId, { url: "https://purmerend.jarvis.bit-academy.nl" });
        }
    }
});

function isAllowedUrl(url, allowedUrls) {
    return allowedUrls.some(allowedUrl => url.startsWith(allowedUrl));
}

console.log('%cGitHub: %c(https://github.com/Dylan-Kuiper)', 'font-weight: bold; color: blue;', 'font-weight: normal; color: black;');
console.log('%cThe path to your %cdestiny%c begins with a steady streak.', 'font-weight: bold; color: red;', 'font-weight: bold; color: deepPink;', 'font-weight: bold; color: red;');
