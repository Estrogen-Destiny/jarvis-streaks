const fetchedURLs = [];
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
    listenForHandinXHR();
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
                return response.text(); // Change this line to get the response as text
            })
            .then(data => {
                console.log("Response text:", data); // Log the response text

                // Now try to parse as JSON
                try {
                    const jsonData = JSON.parse(data);
                    // Handle the parsed JSON data
                    if (event.url.includes('exercise')) {
                        const implementationId = jsonData.implementationId;
                        console.log(implementationId);
                    } else if (event.url.includes('streaks')) {
                        const daysThisWeek = jsonData.daysThisWeek;
                        const freezesAvailable = jsonData.freezesAvailable;
                        console.log("Days this week:", daysThisWeek);
                        console.log("dayOfWeek:", dayOfWeek);
                        console.log(freezesAvailable);

                        if (freezesAvailable != 0) {
                            searchPower = true;
                        }

                        if (daysThisWeek.hasOwnProperty(dayOfWeek)) {
                            searchPower = true;
                        }
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }
    if (event.url.includes('hand-in')) {
        listenForHandinXHR();
    }
}

function listenForHandinXHR() {
    const handinEndpoint = "https://your-api-url/handin"; // Replace with your actual "handin" API endpoint

    // Use chrome.webRequest to listen for XHR events on the "handin" endpoint
    chrome.webRequest.onCompleted.addListener(
        function (details) {
            // Check if the response code is 204
            if (details.url === handinEndpoint && details.statusCode === 204) {
                searchPower = true;
            }
        },
        { urls: [handinEndpoint], types: ["xmlhttprequest"] }
    );
}

if (!searchPower) {
    function checkTimeAndSetSearchPower() {
        const currentTime = new Date();
        const pauses = [
            { start: { hours: 11, minutes: 0 }, end: { hours: 11, minutes: 15 } },
            { start: { hours: 12, minutes: 30 }, end: { hours: 13, minutes: 15 } },
            { start: { hours: 14, minutes: 15 }, end: { hours: 14, minutes: 30 } }
        ];

        // Check if the current time is within one of the specified pauses
        const isInPause = pauses.some(pause => {
            const startPauseTime = new Date(currentTime);
            startPauseTime.setHours(pause.start.hours, pause.start.minutes, 0);

            const endPauseTime = new Date(currentTime);
            endPauseTime.setHours(pause.end.hours, pause.end.minutes, 0);

            return currentTime >= startPauseTime && currentTime <= endPauseTime;
        });

        if (isInPause) {
            searchPower = true;
        } else {
            searchPower = false;
        }
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
//make a xhr listener that listens to url handin api endoint and if 204 then searchpower is true