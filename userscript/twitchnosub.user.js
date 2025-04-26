// ==UserScript==
// @name         TwitchNoSub (Chrome-v0.9.1 port)
// @namespace    https://github.com/besuper/TwitchNoSub
// @version      0.9.1
// @description  Watch sub-only VODs on Twitch (matches Chrome extension v0.9.1 behavior)
// @author       besuper
// @match        *://*.twitch.tv/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // URL of the Amazon patch (from src/chrome/app.js)
    const patchUrl = "https://cdn.jsdelivr.net/gh/besuper/TwitchNoSub@master/src/patch_amazonworker.js";

    // Synchronously fetch Twitch’s blob‐based worker script
    function getWasmWorkerJs(twitchBlobUrl) {
        const req = new XMLHttpRequest();
        req.open('GET', twitchBlobUrl, false);
        req.overrideMimeType("text/javascript");
        req.send();
        return req.responseText;
    }

    // Monkey‐patch window.Worker so it first loads our patch, then Twitch’s original worker
    const OriginalWorker = window.Worker;
    window.Worker = class Worker extends OriginalWorker {
        constructor(twitchBlobUrl) {
            // Grab Twitch’s worker code
            const workerString = getWasmWorkerJs(
                `${twitchBlobUrl.replaceAll("'", "%27")}`
            );

            // Build a new Blob that imports our patch before running Twitch’s code
            const blob = new Blob([`
                importScripts('${patchUrl}');
                ${workerString}
            `], { type: 'application/javascript' });

            super(URL.createObjectURL(blob));
        }
    };
})();
