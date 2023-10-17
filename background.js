const fetchedURLs = {};
let searchPower = false; // Declare searchPower at a higher scope

chrome.webRequest.onCompleted.addListener(event => {
    if (event.url.includes('streaks')) {
        // Check if the URL has already been fetched
        if (fetchedURLs[event.url]) {
            return;
        }
        
        // Mark the URL as fetched
        fetchedURLs[event.url] = true;

        // Fetch the JSON data from the URL
        fetch(event.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Now you have the JSON data in the 'data' variable
                // You can access the values in the JSON like in the previous example
                const currentStreakLength = data.currentStreakLength;
                const daysThisWeek = data.daysThisWeek;
                const freezesAvailable = data.freezesAvailable;

                // You can use these variables as needed
                console.log('Current Streak Length: ' + currentStreakLength);
                console.log(daysThisWeek);
                console.log('Freezes Available: ' + freezesAvailable);
                
                // Check if dayOfWeek is connected to daysThisWeek (adjust based on data structure)
                if (daysThisWeek.hasOwnProperty(dayOfWeek)) {
                    let searchPower = true;
                    console.log(searchPower);
                } else {
                    console.log(`Day of the week ${dayOfWeek} is not connected to daysThisWeek.`);
                    console.log(searchPower);
                }             
                
                // Allow access to any URL after a successful fetch
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation: ' + error.message);
                // Handle the error by using the same logic as in isAllowedUrl
                if (!isAllowedUrl(event.url, allowedUrls)) {
                    // If the current URL is not in the allowed list, redirect to a default URL
                    chrome.tabs.update({ url: "https://purmerend.jarvis.bit-academy.nl" });
                }
            });
    }
    return;
}, { urls: ["<all_urls>"] });

var today = new Date();
var dayOfWeek = (today.getDay() - 1 + 7) % 7;

console.log(dayOfWeek); // Output: 1 (for Monday, assuming today is a Monday)

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

        if (!isAllowedUrl(currentUrl, allowedUrls) && searchPower == true) {
            // If the current URL is not in the allowed list and searchPower is true, redirect to a default URL
            chrome.tabs.update(tabId, { url: "https://purmerend.jarvis.bit-academy.nl" });
        }
    }
});

function isAllowedUrl(url, allowedUrls) {
    return allowedUrls.some(allowedUrl => url.startsWith(allowedUrl));
}

console.log('%cThis message is brought to you by %cDylan Kuiper', 'font-weight: bold; color: blue;', 'font-weight: normal; color: black;');
console.log('%c(GitHub: %chttps://github.com/Dylan-Kuiper%c)', 'font-weight: bold; color: blue;', 'font-weight: normal; color: black;');
console.log('%cThe path to your %cdestiny%c begins with every step you take.', 'font-weight: bold; color: red;', 'font-weight: normal; color: black;', 'font-weight: bold; color: red;');
