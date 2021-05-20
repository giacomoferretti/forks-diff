/**
 * Because we are running in an "isolated world" and need to hook 'replaceState', 
 * we need to inject our script into the page.
 *
 * https://developer.chrome.com/docs/extensions/mv3/content_scripts/#isolated_world
 */
(function () {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('js/main.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
})();
