"use strict";

const forksDiff = (function () {
  // Icons
  const starIcon =
    '<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-star"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>';
  const forkIcon =
    '<svg aria-hidden="true" style="margin-left: 0;" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-repo-forked"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg>';
  const loadingIcon =
    '<svg aria-hidden="true" style="box-sizing: content-box; color: var(--color-icon-primary); vertical-align: middle;" width="16" height="16" viewBox="0 0 16 16" fill="none" class="status-indicator-spinner anim-rotate"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke"></circle><path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path></svg>';

  // Regex
  const diffRegex =
    /<div class="d-flex flex-auto">[\S\s]*?This branch is[\S\s]*?((?<a1>[0-9]*) commits? ahead[\S\s]*?(?<a2>[0-9]*) commits? behind|(?<b>[0-9]*) commits? behind|(?<c>[0-9]*) commits? ahead)/;
  const starsRegex = /([0-9]+) users? starred this repository/;
  const githubUrlRegex = /https?:\/\/github\.com\/.*\/network\/members/;

  const queue = [];
  const parallelNum = 3;

  const addSpan = (parent, text, className) => {
    const span = document.createElement("span");
    span.className = className;
    span.appendChild(document.createTextNode(text));
    parent.appendChild(span);
  };

  const processRepo = () => {
    const currentRepo = queue.shift();

    // Add spinner
    const spinner = document.createElement("span");
    spinner.innerHTML = loadingIcon;
    currentRepo.appendChild(spinner);

    const request = new XMLHttpRequest();
    request.addEventListener("load", function () {
      if (this.status == 429) {
        // Rate limited :(
        console.log(this.getResponseHeader("Retry-After"));
        return;
      }

      const body = this.responseText;
      currentRepo.removeChild(spinner);

      // Read diff
      const diffRegexResult = diffRegex.exec(body);
      if (!diffRegexResult) {
        addSpan(currentRepo, "is even", "text-gray");
      } else {
        const {
          groups: { a1, a2, b, c },
        } = diffRegexResult;

        if (a1 && a2) {
          addSpan(currentRepo, "+" + a1, "cadd");
          addSpan(currentRepo, " ");
          addSpan(currentRepo, "-" + a2, "cdel");
        } else if (b) {
          addSpan(currentRepo, "-" + b, "cdel");
        } else if (c) {
          addSpan(currentRepo, "+" + c, "cadd");
        }
      }

      // Read stars
      addSpan(currentRepo, " ");
      const stars = body.match(starsRegex);
      const starIndicator = document.createElement("span");
      starIndicator.innerHTML = starIcon + " " + stars[1];
      currentRepo.appendChild(starIndicator);

      // Process next repo
      if (queue.length > 0) {
        processRepo();
      }
    });

    // Send request
    request.open("GET", currentRepo.getElementsByTagName("a")[2].href);
    request.send();
  };

  const mainButtonAction = (e) => {
    // Disable button
    e.target.className = "btn ml-2 float-right disabled";
    e.target.removeEventListener("click", mainButtonAction);

    // Iterate through repos
    const repos = network.children;
    for (let i = 0; i < repos.length; i++) {
      if (repos[i].getElementsByClassName("network-tree").length === 0)
        continue; // Skip original

      queue.push(repos[i]);
    }

    // Start
    for (let i = parallelNum - 1; i >= 0; i--) {
      processRepo();
    }
  };

  const addButton = () => {
    const network = document.getElementById("network");

    // Check if we have at least one div.repo, if not we are on Network page and not Forks page
    if (network === null) return;
    if (network.querySelector("div.repo") === null) return;

    const mainButton = document.createElement("button");
    mainButton.className = "btn ml-2 float-right";
    mainButton.innerHTML = forkIcon + " Load diff";
    mainButton.addEventListener("click", mainButtonAction);
    network.insertBefore(mainButton, network.childNodes[0]);
  };

  const addReplaceStateEventListener = () => {
    // https://gist.github.com/rudiedirkx/fd568b08d7bffd6bd372
    const _wr = (type) => {
      const orig = history[type];
      return () => {
        const rv = orig.apply(this, arguments);
        const e = new Event(type);
        e.arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _wr("pushState");
    history.replaceState = _wr("replaceState");
  };

  const replaceStateListener = () => {
    if (githubUrlRegex.test(location.href)) {
      addButton();
    }
  };

  return {
    addButton: addButton,
    addReplaceStateEventListener: addReplaceStateEventListener,
    replaceStateListener: replaceStateListener,
  };
})();

(function () {
  // Add 'replaceState' listener
  forksDiff.addReplaceStateEventListener();
  window.addEventListener("replaceState", forksDiff.replaceStateListener);
})();
