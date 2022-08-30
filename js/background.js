const githubUrlRegex = /https?:\/\/github\.com\/.*\/network\/members/;
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
	if (
		info.status === "complete" &&
		tab.title.indexOf("Fork") !== -1 &&
		githubUrlRegex.test(tab.url)
	) {
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			files: ["js/main.js"],
		});
	}
});
