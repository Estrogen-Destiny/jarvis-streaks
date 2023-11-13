const fetchedURLs = {};
let searchPower = false;
let dayOfWeek;

function onStartup() {
    chrome.tabs.create({ url: "https://jarvis.bit-academy.nl/" }, (tab) => {
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

                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    // Parse as JSON only if the content type is JSON
                    return response.json();
                } else {
                    throw Error('Response is not in JSON format');
                }
            })
            .then(data => {
                // Handle the parsed JSON data
                if (event.url.includes('exercise')) {
                    const implementationId = data.implementationId;
                    console.log(data.implementationId);
                } else if (event.url.includes('streaks')) {
                    const daysThisWeek = data.daysThisWeek;
                    const freezesAvailable = data.freezesAvailable;
                    console.log("Days this week:", daysThisWeek);
                    console.log("dayOfWeek:", dayOfWeek);
                    console.log(freezesAvailable);

                    if (freezesAvailable != 0) {
                        searchPower = true;
                    }

                    if (daysThisWeek.hasOwnProperty(dayOfWeek)) {
                        searchPower = true;
                    } else {
                        console.log(`Day of the week ${dayOfWeek} is not connected to daysThisWeek.`);
                    }
                }
            })
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

function callHandInAPI(implementationId) {
    // Call the hand-in API endpoint with the dynamically extracted implementationId
    fetch(`https://your-api-base-url/v1/implementations/${implementationId}/hand-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers if needed
        },
    })
    .then(response => {
        if (response.status === 204) {
            console.log("Hand-in successful!");
            searchPower = true;
        } else if (response.status === 400) {
            console.error("Hand-in failed BLAST checks");
        } else if (response.status === 429) {
            console.error("Too many recent hand-in attempts");
        } else {
            console.error(`Unexpected response: ${response.status}`);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}