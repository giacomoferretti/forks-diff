(function() {
    "use strict";

    function appendSpace(element) {
        element.appendChild(document.createTextNode(" "));
    }

    function loadDiff(repo) {
        // Add spinner
        let spinner = document.createElement("img");
        spinner.src = "https://github.githubassets.com/images/spinners/octocat-spinner-32.gif";
        spinner.width = 16;
        spinner.height = 16;
        spinner.style.verticalAlign = "middle";
        repo.appendChild(spinner);

        // Extract repo URL
        let repoUrl = repo.getElementsByTagName("a")[2].href;

        let commitsAhead = 0;
        let commitsBehind = 0;

        let request = new XMLHttpRequest();
        request.addEventListener("load", function() {
            let body = this.responseText;

            // Remove spinner
            repo.removeChild(spinner);

            // Check if it's even
            if (body.includes("This branch is even with")) {
                let commitSpan = document.createElement("span");
                commitSpan.className = "text-gray";
                commitSpan.appendChild(document.createTextNode("is even"));
                repo.appendChild(commitSpan);
                return;
            }

            // Extract ahead and behind
            let commitHistory = body.match("This branch is ([0-9]*) commit.+ahead, ([0-9]*) commit");
            if (commitHistory != null) {
                commitsAhead = parseInt(commitHistory[1]);
                commitsBehind = parseInt(commitHistory[2]);
            } else {
                // Extract ahead
                let commitHistory = body.match("This branch is ([0-9]*) commit.+ahead");
                if (commitHistory != null) {
                    commitsAhead = parseInt(commitHistory[1]);
                }

                // Extract behind
                commitHistory = body.match("This branch is ([0-9]*) commit.+behind");
                if (commitHistory != null) {
                    commitsBehind = parseInt(commitHistory[1]);
                }
            }

            // Add ahead commits
            if (commitsAhead != 0) {
                let commit_ahead_counter = document.createElement("span");
                commit_ahead_counter.className = "cadd";
                commit_ahead_counter.appendChild(document.createTextNode("+" + commitsAhead));
                repo.appendChild(commit_ahead_counter);
            }
            
            // Add space
            appendSpace(repo);

            // Add behind commits
            if (commitsBehind != 0) {
                let commit_behind_counter = document.createElement("span");
                commit_behind_counter.className = "cdel";
                commit_behind_counter.appendChild(document.createTextNode("-" + commitsBehind));
                repo.appendChild(commit_behind_counter);
            }
        });

        // Send request
        request.open("GET", repoUrl);
        request.send();
    }
    
    const network = document.getElementById("network");
    if (network === null) {
        return;
    }

    function loadButtonAction(e) {
        e.target.setAttribute("class", "btn btn-sm disabled");
        e.target.removeEventListener("click", loadButtonAction, false);

        // Iterate through all
        const repos = network.children;
        for (let i = 0; i < repos.length; i++) {
            if (repos[i].getElementsByClassName("network-tree").length === 0) continue; // Skip original

            loadDiff(repos[i]);
        }
    }

    const loadButton = document.createElement("button");
    loadButton.className = "btn btn-sm";
    loadButton.style.float = "right";
    loadButton.innerHTML = '<svg style="fill: currentColor;" class="octicon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg> Load diff';
    loadButton.addEventListener("click", loadButtonAction);

    network.insertBefore(loadButton, network.childNodes[0]);
})();