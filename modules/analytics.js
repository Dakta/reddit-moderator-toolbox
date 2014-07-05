function analytics() {
// analytics.js - Google Analytics tracker module, © 2014 Dakota Schneider
// based on http://stackoverflow.com/a/10371025

var analytics = new TB.Module("Analytics");

analytics.config["devmode"] = true; // srsly hush-hush

analytics.init = function init() {
    var UPDATE_INTERVAL = 2 * 60 * 60 * 1000; // Update after 2 hour

    // Retrieve GA from storage
    chrome.storage.local.get({
        lastUpdated: 0,
        code: ''
    }, function(items) {
        if (Date.now() - items.lastUpdated > UPDATE_INTERVAL) {
            // Get updated file, and if found, save it.
            get('https://ssl.google-analytics.com/ga.js', function(code) {
                if (!code) return;
                chrome.storage.local.set({lastUpdated: Date.now(), code: code});
            });
        }
        if (items.code) // Cached GA is available, use it
            execute(items.code);
        else // No cached version yet. Load from extension
            get(chrome.extension.getURL('ga.js'), execute);
    });

    // Typically run within a few milliseconds
    function execute(code) {
        try { window.eval(code); } catch (e) { console.error(e); }
        // Run the rest of your code.
        // If your extension depends on GA, initialize it from here.
        // ...
    }

    function get(url, callback) {
        var x = new XMLHttpRequest();
        x.onload = x.onerror = function() { callback(x.responseText); };
        x.open('GET', url);
        x.send();
    }

    window._gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-52486209-1']);
    _gaq.push(['_setAllowLinker', true]);
    _gaq.push(['_trackPageview']); // we can also track click events: http://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/docs/examples/tutorials/analytics/popup.js
}

TB.register_module(analytics);

}

(function () {
    window.addEventListener("TBStorageLoaded", function () {
        console.log("got storage");
        analytics();
    });
})();