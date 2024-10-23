import type { Fork, ForkProcessor } from ".";

export class ForksPageParser {
  static parse() {
    const forks = document.querySelectorAll(".Layout-main ul > li");
    if (!forks) {
      return [];
    }

    const result: Array<Fork> = [];

    forks.forEach((fork) => {
      // Extract fork URL
      const forkUrl = fork.querySelectorAll("a")[1].href;
      if (!forkUrl) {
        return;
      }

      // Create result container
      const container = document.createElement("div");
      container.classList.add("mr-4", "f6");
      container.style.display = "none"; // Hide by default

      // Append container to fork
      const infoBoxContainer = fork.querySelector("div")?.querySelector("div");
      if (!infoBoxContainer || !infoBoxContainer.children[4]) {
        return;
      }
      infoBoxContainer.insertBefore(container, infoBoxContainer.children[4]);

      result.push({
        url: forkUrl,
        container: container,
      });
    });

    return result;
  }
}

export class ForksDiffButton {
  private button: HTMLButtonElement;

  constructor(processor: ForkProcessor) {
    this.button = document.createElement("button");
    this.button.textContent = "Load diff";
    this.button.classList.add(
      "Button",
      "Button--secondary",
      "Button--small",
      "text-normal",
      "mt-2",
      "ml-lg-2",
      "mt-lg-0"
    );
    this.button.addEventListener("click", () => {
      if (this.button.getAttribute("disabled")) {
        return;
      }

      this.button.setAttribute("disabled", "disabled");

      processor.process();
    });
  }

  insertButton() {
    const searchControlMenu = document.querySelector("search-control-menu");
    if (!searchControlMenu) {
      return;
    }

    const buttons = searchControlMenu.querySelector("div");
    if (!buttons) {
      return;
    }

    buttons.appendChild(this.button);
  }
}
