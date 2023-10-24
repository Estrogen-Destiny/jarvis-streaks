const fetchedURLs = {};
let searchPower = false;
let dayOfWeek;

function onStartup() {
    chrome.tabs.create({ url: "https://purmerend.jarvis.bit-academy.nl" }, (tab) => {
        createdTab = tab;
        chrome.tabs.onUpdated.addListener(function onUpdatedListener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === "complete") {
                if (searchPower) {
                    chrome.tabs.remove(tab.id); // Close the tab when searchPower is true
                }
            }
        });
    });
}


function onCompleted(event) {
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
                const daysThisWeek = data.daysThisWeek;
                const freezesAvailable = data.freezesAvailable;
                console.log("Days this week:", daysThisWeek);
                console.log("dayOfWeek:", dayOfWeek);
                console.log(freezesAvailable);

                if (freezesAvailable != 0){
                    searchPower = true;
                }

                if (daysThisWeek.hasOwnProperty(dayOfWeek)) {
                    searchPower = true;    
                } else {
                    console.log(`Day of the week ${dayOfWeek} is not connected to daysThisWeek.`);
                }

                if (searchPower == true){
                    chrome.tabs.remove(createdTab.id);
                }
            })
    }
    return;
}

function removeStartPage(){
    if (searchPower == true){
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
            "https://purmerend.jarvis.bit-academy.nl",
            "chrome://extensions/",
            "https://chat.jarvis.bit-academy.nl/",
            "http://localhost"
        ];

        if (tab.url === "chrome://newtab/") {
            return;
        }

        if (!isAllowedUrl(currentUrl, allowedUrls) && !searchPower) {
            chrome.tabs.update(tabId, { url: "https://purmerend.jarvis.bit-academy.nl" });
        }
    }
}

function isAllowedUrl(url, allowedUrls) {
    return allowedUrls.some(allowedUrl => url.startsWith(allowedUrl));
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
