import { ICON_DIFF, ICON_LOADING } from "../constants";

export const MAX_CONCURRENT_REQUESTS = 5; // N threads

export type Fork = {
  url: string;
  container: HTMLElement;
};

export class ForkProcessor {
  constructor(private forks: Array<Fork>) {}

  process() {
    // Function to process a single repo from the queue
    const processRepo = async (fork: Fork) => {
      console.log(`Processing: ${fork}`);

      fork.container.removeAttribute("style");
      fork.container.classList.add("color-fg-muted");

      const spinner = document.createElement("span");
      spinner.innerHTML = ICON_LOADING;
      fork.container.appendChild(spinner);

      // Perform network request using fetch or XMLHttpRequest
      try {
        const data = await (await fetch(fork.url)).text();
        const match = data.match(/"defaultBranch":"(.+?)"/);
        if (!match) {
          throw new Error("No defaultBranch found");
        }

        const defaultBranch = match[1];
        const url = fork.url + "/branch-infobar/" + defaultBranch;

        const branchInfobar = await (
          await fetch(url, {
            headers: {
              Accept: "application/json",
            },
          })
        ).json();

        const ahead = branchInfobar.refComparison.ahead;
        const behind = branchInfobar.refComparison.behind;

        const diffIcon = document.createElement("span");
        diffIcon.innerHTML = ICON_DIFF;
        fork.container.appendChild(diffIcon);

        if (ahead === 0 && behind === 0) {
          const noDiff = document.createElement("span");
          noDiff.textContent = " is even ";
          fork.container.appendChild(noDiff);
        }

        if (ahead > 0) {
          const aheadSpan = document.createElement("span");
          aheadSpan.textContent = ` +${ahead} `;
          aheadSpan.classList.add("cadd");
          fork.container.appendChild(aheadSpan);
        }

        if (ahead > 0 && behind > 0) {
          const separator = document.createElement("span");
          separator.textContent = "/";
          separator.classList.add("color-fg-muted");
          fork.container.appendChild(separator);
        }

        if (behind > 0) {
          const behindSpan = document.createElement("span");
          behindSpan.textContent = ` -${behind} `;
          behindSpan.classList.add("cdel");
          fork.container.appendChild(behindSpan);
        }

        spinner.remove();
      } catch (error: unknown) {
        fork.container.innerHTML = "";

        const errorSpan = document.createElement("span");
        if (error instanceof Error) {
          errorSpan.textContent = error.message;
        } else {
          errorSpan.textContent = "Unknown error";
        }
        fork.container.appendChild(errorSpan);
      }
    };

    // Function to run parallel requests with a max concurrency limit
    const runQueue = async () => {
      const queueCopy = [...this.forks]; // Copy the queue to avoid mutation

      // Helper function to process items with a concurrency limit
      const processNext = async () => {
        if (queueCopy.length === 0) return;
        // Get the next URL from the queue
        const nextUrl = queueCopy.shift();
        if (!nextUrl) {
          return;
        }

        // Process the current repo
        await processRepo(nextUrl);

        // Start processing the next URL once this one finishes
        await processNext();
      };

      // Spawn initial threads (N)
      const threads = [];
      for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
        threads.push(processNext());
      }

      // Wait for all "threads" to finish
      await Promise.all(threads);
    };

    // Start processing the queue
    runQueue();
  }
}
