const fetchedURLs = {};
let searchPower = false;
let dayOfWeek;
let createdTab; // Declare createdTab variable

function onStartup() {
    chrome.tabs.create({ url: "https://jarvis.bit-academy.nl/" }, (tab) => {
        createdTab = tab;
    });

    // Use chrome.tabs.onUpdated.addListener outside of chrome.tabs.create callback
    chrome.tabs.onUpdated.addListener(function onUpdatedListener(tabId, changeInfo) {
        if (tabId === createdTab.id && changeInfo.status === "complete") {
            if (searchPower) {
                chrome.tabs.remove(createdTab.id);
            }
        }
    });
}

function onCompleted(event) {
    if (event.url.includes('exercise') || event.url.includes('streaks')) {
        if (fetchedURLs[event.url]) {
            return;
        }

        fetchedURLs[event.url] = true;

        fetch(event.url)
            .then(response => {
                if (!response.ok) {
                    throw Error('Network response was not ok');
                }
                console.log(response.json);
                return response.json();
            })
            .then(data => {
                if (event.url.includes('exercise')) {
                    const implementationId = data.implementationId;
                    console.log(data.implementationId);
                } else if (event.url.includes('streaks')) {
                    const daysThisWeek = data.daysThisWeek;
                    const freezesAvailable = data.freezesAvailable;
                    console.log("Days this week:", daysThisWeek);
                    console.log("dayOfWeek:", dayOfWeek);
                    console.log(freezesAvailable);

                    if (freezesAvailable !== 0 || daysThisWeek.hasOwnProperty(dayOfWeek)) {
                        searchPower = true;
                    } else {
                        console.log(`Day of the week ${dayOfWeek} is not connected to daysThisWeek.`);
                    }
                }

                // Check for "minimal hand-in" or "hand-in-file-upload"
                if (event.url.includes('hand-in') || event.url.includes('hand-in-file-upload')) {
                    searchPower = true;
                    console.log(searchPower);
                    // Do something specific for hand-in URLs
                }
            })
            .catch(error => {
                console.log(error);
                console.error("Fetch error:", error);
            });
    }
}

function removeStartPage() {
    if (searchPower == true) {
        chrome.tabs.remove(createdTab.id);
    }
}

function initializeDayOfWeek() {
    var today = new Date();
    dayOfWeek = (today.getDay() - 1 + 7) % 7;
    console.log(dayOfWeek);
}

function onTabsUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        const currentUrl = tab.url;
        const allowedUrls = [
            "https://chat.openai.com/",
            "https://stackoverflow.com/",
            "https://www.google.com/",
            "jarvis.bit-academy.nl",
            "chrome://extensions/",
            "http://localhost"
        ];

        if (tab.url === "chrome://newtab/") {
            return;
        }

        if (!isAllowedUrl(currentUrl, allowedUrls) && !searchPower) {
            chrome.tabs.update(tabId, { url: "https://jarvis.bit-academy.nl" });
        }
    }
}

function isAllowedUrl(url, allowedUrls) {
    return allowedUrls.some(allowedUrl => url.includes(allowedUrl));
}

function logInfo() {
    console.log('%cGitHub: %c(https://github.com/Dylan-Kuiper)', 'font-weight: bold; color: blue;', 'font-weight: normal; color: black;');
    console.log('%cThe path to your %cdestiny%c begins with a steady streak.', 'font-weight: bold; color: red;', 'font-weight: bold; color: deepPink;', 'font-weight: bold; color: red;');
}

chrome.runtime.onStartup.addListener(onStartup);
chrome.webRequest.onCompleted.addListener(onCompleted, { urls: ["<all_urls>"] });
initializeDayOfWeek();
chrome.tabs.onUpdated.addListener(onTabsUpdated);
logInfo();
