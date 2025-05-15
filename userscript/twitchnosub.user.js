// ==UserScript==
// @name         TwitchNoSub (Safari Compatible)
// @namespace    https://github.com/besuper/TwitchNoSub
// @version      1.1.1
// @description  Watch sub only VODs on Twitch (Safari Compatible)
// @author       besuper
// @updateURL    https://raw.githubusercontent.com/besuper/TwitchNoSub/master/userscript/twitchnosub.user.js
// @downloadURL  https://raw.githubusercontent.com/besuper/TwitchNoSub/master/userscript/twitchnosub.user.js
// @icon         https://raw.githubusercontent.com/besuper/TwitchNoSub/master/assets/icons/icon.png
// @match        *://*.twitch.tv/*
// @run-at       document-end
// @inject-into  page
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    async function getWasmWorkerJs(twitchBlobUrl) {
        try {
            const response = await fetch(twitchBlobUrl);
            if (!response.ok) {
                console.error('Failed to fetch worker script:', response.statusText);
                return '';
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching worker script:', error);
            return '';
        }
    }

    const oldWorker = window.Worker;

    window.Worker = class Worker extends oldWorker {
        constructor(twitchBlobUrl) {
            (async () => {
                const workerString = await getWasmWorkerJs(twitchBlobUrl.replaceAll("'", "%27"));
                const blobUrl = URL.createObjectURL(new Blob([`
                    importScripts(
                        'https://cdn.jsdelivr.net/gh/besuper/TwitchNoSub@master/src/patch_amazonworker.js'
                    );
                    ${workerString}
                `], { type: 'application/javascript' }));
                super(blobUrl);
            })();
        }
    }
})();
