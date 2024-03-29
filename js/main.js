"use strict";

window._forksdiffconstants = {
  icons: {
    loading:
      '<svg aria-hidden="true" style="box-sizing: content-box; color: var(--color-icon-primary); vertical-align: middle;" width="16" height="16" viewBox="0 0 16 16" fill="none" class="status-indicator-spinner anim-rotate"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke"></circle><path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"></path></svg>',

    star: '<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-star"><path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path></svg>',
    fork: '<svg aria-hidden="true" style="margin-left: 0;" viewBox="0 0 16 16" version="1.1" height="16" width="16" class="octicon octicon-repo-forked"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path></svg>',
  },
  regex: {
    diff: /<div class="d-flex flex-auto">[\S\s]*?This branch is[\S\s]*?((?<a1>[0-9]*) commits? ahead[\S\s]*?(?<a2>[0-9]*) commits? behind|(?<b>[0-9]*) commits? behind|(?<c>[0-9]*) commits? ahead)/,
    stars: /([0-9]+) users? starred this repository/,
  },
};

const LegacyLoadDiffButton = (() => {
  const queue = [];
  const parallelNum = 3;

  const _addSpan = (parent, text, className) => {
    const span = document.createElement("span");
    span.className = className;
    span.appendChild(document.createTextNode(text));
    parent.appendChild(span);
  };

  const _processRepo = () => {
    const currentRepo = queue.shift();

    // Add spinner
    const spinner = document.createElement("span");
    spinner.innerHTML = window._forksdiffconstants.icons.loading;
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
      const diffRegexResult = window._forksdiffconstants.regex.diff.exec(body);
      if (!diffRegexResult) {
        _addSpan(currentRepo, "is even", "text-gray");
      } else {
        const {
          groups: { a1, a2, b, c },
        } = diffRegexResult;

        if (a1 && a2) {
          _addSpan(currentRepo, "+" + a1, "cadd");
          _addSpan(currentRepo, " ");
          _addSpan(currentRepo, "-" + a2, "cdel");
        } else if (b) {
          _addSpan(currentRepo, "-" + b, "cdel");
        } else if (c) {
          _addSpan(currentRepo, "+" + c, "cadd");
        }
      }

      // Read stars
      _addSpan(currentRepo, " ");
      const stars = body.match(window._forksdiffconstants.regex.stars);
      const starIndicator = document.createElement("span");
      starIndicator.innerHTML =
        window._forksdiffconstants.icons.star + " " + stars[1];
      currentRepo.appendChild(starIndicator);

      // Process next repo
      if (queue.length > 0) {
        _processRepo();
      }
    });

    // Send request
    request.open("GET", currentRepo.getElementsByTagName("a")[2].href);
    request.send();
  };

  const _buttonAction = (e) => {
    // Disable button
    e.target.classList.add("disabled");
    e.target.removeEventListener("click", _buttonAction);

    // Iterate through repos
    const repos = document
      .getElementById("network")
      .querySelector("div").children;
    for (let i = 0; i < repos.length; i++) {
      // Skip root fork
      if (repos[i].getElementsByClassName("network-tree").length === 0) {
        continue;
      }

      queue.push(repos[i]);
    }

    // Start
    for (let i = parallelNum - 1; i >= 0; i--) {
      if (queue.length > 0) {
        _processRepo();
      }
    }
  };

  const addButton = () => {
    const network = document.getElementById("network");

    // Check if we have at least one div.repo, if not we are on Network page and not Forks page
    if (network === null || network.querySelector("div.repo") === null) return;

    const mainButton = document.createElement("button");
    mainButton.className = "btn float-right";
    mainButton.innerHTML = window._forksdiffconstants.icons.fork + " Load diff";
    mainButton.addEventListener("click", _buttonAction);
    network.insertBefore(mainButton, network.childNodes[0]);

    // Add space if Refined Github is enabled
    if (
      mainButton.nextElementSibling.tagName === "A" &&
      mainButton.nextElementSibling.href &&
      mainButton.nextElementSibling.href.includes("useful-forks.github.io")
    ) {
      mainButton.classList.add("ml-2");
    } else {
      mainButton.classList.add("mr-2");
    }
  };

  return {
    addButton: addButton,
  };
})();

const LoadDiffButton = (() => {
  const queue = [];
  const parallelNum = 3;

  const addSpan = (parent, text, className) => {
    const span = document.createElement("span");
    span.className = className;
    span.appendChild(document.createTextNode(text));
    parent.appendChild(span);
  };

  const createInfoBox = () => {
    const box = document.createElement("div");
    box.className = "mr-4 f6";
    return box;
  };

  const processRepo = () => {
    const currentRepo = queue.shift();

    // Get info box
    const infoBoxContainer = currentRepo
      .querySelector("div")
      .querySelector("div");

    // Create info box
    const infoBox = createInfoBox();
    infoBoxContainer.insertBefore(infoBox, infoBoxContainer.children[4]);

    // Add spinner
    const spinner = document.createElement("span");
    spinner.innerHTML = window._forksdiffconstants.icons.loading;
    infoBox.appendChild(spinner);

    // TODO: Maybe switch to fetch
    const request = new XMLHttpRequest();
    request.addEventListener("load", function () {
      // Remove spinner
      infoBox.removeChild(spinner);

      if (this.status == 429) {
        // Rate limited :(
        console.log(this.getResponseHeader("Retry-After"));
        return;
      }

      const body = this.responseText;

      // Read diff
      const diffRegexResult = window._forksdiffconstants.regex.diff.exec(body);
      if (!diffRegexResult) {
        addSpan(infoBox, "is even", "text-gray");
      } else {
        const {
          groups: { a1, a2, b, c },
        } = diffRegexResult;

        if (a1 && a2) {
          addSpan(infoBox, "+" + a1, "cadd");
          addSpan(infoBox, " ");
          addSpan(infoBox, "-" + a2, "cdel");
        } else if (b) {
          addSpan(infoBox, "-" + b, "cdel");
        } else if (c) {
          addSpan(infoBox, "+" + c, "cadd");
        }
      }

      // Process next repo
      if (queue.length > 0) {
        processRepo();
      }
    });

    // Send request
    request.open("GET", currentRepo.querySelectorAll("a")[1].href);
    request.send();
  };

  const buttonAction = (e) => {
    console.log(e);

    // Disable button
    e.target.setAttribute("disabled", "disabled");
    e.target.removeEventListener("click", buttonAction);

    // Extract forks links
    const forks = document
      .querySelector(".Layout-main")
      .querySelector("ul")
      .querySelectorAll("li");
    console.log(forks);
    queue.push.apply(queue, forks);
    console.log(queue);

    // Start
    for (let i = 0; i < parallelNum; i++) {
      if (queue.length > 0) {
        processRepo();
      }
    }
  };

  const addButton = () => {
    const buttons = document
      .querySelector("search-control-menu")
      .querySelector("div");

    const mainButton = document.createElement("button");
    mainButton.className =
      "Button--secondary Button--small Button text-normal mt-2 ml-lg-2 mt-lg-0";
    mainButton.addEventListener("click", buttonAction);

    // Add text
    // const span1 = document.createElement("span");
    // span1.className = "Button-content";
    // const span2 = document.createElement("span");
    // span2.className = "Button-label";
    // span2.appendChild(document.createTextNode("Load diff"));
    // span1.appendChild(span2);
    // mainButton.appendChild(span1);
    mainButton.appendChild(document.createTextNode("Load diff"));

    buttons.appendChild(mainButton);
  };

  return {
    addButton: addButton,
  };
})();

const ForksDiff = (() => {
  // Regex
  const legacyNetworkRegex =
    /https?:\/\/github.com\/[\w\.\-]+\/[\w\.\-]+\/network\/members/;
  const forksUrlRegex = /https?:\/\/github.com\/[\w\.\-]+\/[\w\.\-]+\/forks/;

  const init = () => {
    // Check page
    if (forksUrlRegex.test(location.href)) {
      LoadDiffButton.addButton();
    } else if (legacyNetworkRegex.test(location.href)) {
      LegacyLoadDiffButton.addButton();
    }
  };

  return {
    init: init,
  };
})();

// On load
ForksDiff.init();

// Add Turbo listener
document.addEventListener("turbo:render", () => {
  ForksDiff.init();
});
