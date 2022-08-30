const githubUrlRegex = /https?:\/\/github\.com\/.*\/network\/members/;
if (typeof browser === "undefined") {
    var browser = chrome;
}

browser.tabs.onUpdated.addListener(function (tabId, info, tab) {
	if (
		info.status === "complete" &&
		tab.title.indexOf("Fork") !== -1 &&
		githubUrlRegex.test(tab.url)
	) {
		browser.scripting.executeScript({
			target: { tabId: tabId },
			files: ["js/main.js"],
		});
	}
});
