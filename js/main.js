'use strict';

const forksDiff = (function() {
    // Icons
    const starIcon = '<svg style="" aria-hidden="true" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-star"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>';
    const forkIcon = '<svg style="margin-left: 0;" aria-hidden="true" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-repo-forked"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg>';
    const loadingIcon = '<svg style="box-sizing: content-box; color: var(--color-icon-primary); margin-bottom: 0 !important; vertical-align: middle;" viewBox="0 0 16 16" fill="none" data-view-component="true" width="16" height="16" class="graph-loading dots mb-2 anim-rotate"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke"></circle><path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path></svg>';

    // Regex
    const isEvenRegex = /<div class="d-flex flex-auto">[\s]+This branch is even/;
    const commitsAheadRegex = /<div class="d-flex flex-auto">[\s]+This branch is ([0-9]*) commits? ahead/;
    const commitsBehindRegex = /<div class="d-flex flex-auto">[\s]+This branch is ([0-9]*) commits? behind/;
    const commitsFullRegex = /<div class="d-flex flex-auto">[\s]+This branch is ([0-9]*) commits? ahead, ([0-9]*) commit/;
    const starsRegex = /([0-9]+) users? starred this repository/;
    const githubUrlRegex = /https?:\/\/github\.com\/.*\/network\/members/;

    function appendSpace(e) {
        e.appendChild(document.createTextNode(' '));
    }

    function processRepo(repoElement) {
        // Add spinner
        const spinner = document.createElement('span');
        spinner.innerHTML = loadingIcon;
        repoElement.appendChild(spinner);

        // Extract repo URL
        const repoUrl = repoElement.getElementsByTagName('a')[2].href;

        // Prepare request
        const request = new XMLHttpRequest();
        request.addEventListener('load', function() {
            repoElement.removeChild(spinner);

            const body = this.responseText;

            let commitsAhead = 0;
            let commitsBehind = 0;

            // Check if repo is even
            if (isEvenRegex.test(body)) {
                const evenSpan = document.createElement('span');
                evenSpan.className = 'text-gray';
                evenSpan.appendChild(document.createTextNode('is even'));
                repoElement.appendChild(evenSpan);
            } else {
                // Extract ahead and behind
                let commitHistoryData = body.match(commitsFullRegex);
                if (commitHistoryData != null) {
                    commitsAhead = parseInt(commitHistoryData[1]);
                    commitsBehind = parseInt(commitHistoryData[2]);
                } else {
                    // Extract ahead
                    commitHistoryData = body.match(commitsAheadRegex);
                    if (commitHistoryData != null) {
                        commitsAhead = parseInt(commitHistoryData[1]);
                    }

                    // Extract behind
                    commitHistoryData = body.match(commitsBehindRegex);
                    if (commitHistoryData != null) {
                        commitsBehind = parseInt(commitHistoryData[1]);
                    }
                }

                // Add ahead commits
                if (commitsAhead != 0) {
                    appendSpace(repoElement);
                    const commitsAheadText = document.createElement('span');
                    commitsAheadText.className = 'cadd';
                    commitsAheadText.appendChild(document.createTextNode('+' + commitsAhead));
                    repoElement.appendChild(commitsAheadText);
                }

                // Add behind commits
                if (commitsBehind != 0) {
                    appendSpace(repoElement);
                    const commitsBehindCounter = document.createElement('span');
                    commitsBehindCounter.className = 'cdel';
                    commitsBehindCounter.appendChild(document.createTextNode('-' + commitsBehind));
                    repoElement.appendChild(commitsBehindCounter);
                }
            }

            // Read stars
            appendSpace(repoElement);
            const stars = body.match(starsRegex);
            const starIndicator = document.createElement('span');
            starIndicator.innerHTML = starIcon + ' ' + stars[1];
            repoElement.appendChild(starIndicator);
        });

        // Send request
        request.open('GET', repoUrl);
        request.send();
    }

    function mainButtonAction(e) {
        // Disable button
        e.target.setAttribute('class', 'btn btn-sm disabled');
        e.target.removeEventListener('click', mainButtonAction);

        // Iterate through repos
        const repos = network.children;
        for (let i = 0; i < repos.length; i++) {
            if (repos[i].getElementsByClassName('network-tree').length === 0) continue; // Skip original

            processRepo(repos[i]);
        }
    }

    function addButton() {
        const network = document.getElementById('network');
        if (network === null) {
            return;
        }

        const mainButton = document.createElement('button');
        mainButton.className = 'btn btn-sm';
        mainButton.style.float = 'right';
        mainButton.innerHTML = forkIcon + ' Load diff';
        mainButton.addEventListener('click', mainButtonAction);
        network.insertBefore(mainButton, network.childNodes[0]);
    }

    function addReplaceStateEventListener() {
        // https://gist.github.com/rudiedirkx/fd568b08d7bffd6bd372
        const _wr = function(type) {
            const orig = history[type];
            return function() {
                const rv = orig.apply(this, arguments);
                const e = new Event(type);
                e.arguments = arguments;
                window.dispatchEvent(e);
                return rv;
            };
        };
        history.pushState = _wr('pushState');
        history.replaceState = _wr('replaceState');
    }

    function replaceStateListener() {
        function action() {
            addButton();
            document.removeEventListener('pjax:end', action);
        }

        if (githubUrlRegex.test(location.href)) {
            document.addEventListener('pjax:end', action);
        }
    }

    return {
        addButton: addButton,
        addReplaceStateEventListener: addReplaceStateEventListener,
        replaceStateListener: replaceStateListener,
    };
})();

(function() {
    // Add 'replaceState' listener
    forksDiff.addReplaceStateEventListener();
    window.addEventListener('replaceState', forksDiff.replaceStateListener);

    forksDiff.addButton();
})();
