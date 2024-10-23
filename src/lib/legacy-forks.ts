import type { Fork, ForkProcessor } from ".";

export class LegacyForksPageParser {
  static parse() {
    const networkTree = document.querySelector("#network > div");
    if (!networkTree) {
      return [];
    }

    const result: Array<Fork> = [];

    // Iterate through repository forks (skip the first one)
    for (let i = 1; i < networkTree.children.length; i++) {
      const fork = networkTree.children[i];

      // Create result container
      const container = document.createElement("span");
      container.style.display = "none"; // Hide by default
      fork.appendChild(container);

      result.push({
        url: fork.querySelectorAll("a")[2].href,
        container: container,
      });
    }

    return result;
  }
}

export class LegacyForksDiffButton {
  private button: HTMLButtonElement;

  constructor(processor: ForkProcessor) {
    this.button = document.createElement("button");
    this.button.textContent = "Load diff";
    this.button.classList.add("btn", "float-right");
    this.button.addEventListener("click", () => {
      if (this.button.classList.contains("disabled")) {
        return;
      }

      this.button.classList.add("disabled");

      processor.process();
    });
  }

  insertButton() {
    const network = document.getElementById("network");
    if (!network) {
      return;
    }

    network.insertBefore(this.button, network.childNodes[0]);
  }
}
