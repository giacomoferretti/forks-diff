import { FORKS_URL_REGEX, LEGACY_FORKS_URL_REGEX } from "./constants";
import { ForkProcessor } from "./lib";
import { ForksPageParser, ForksDiffButton } from "./lib/forks";
import {
  LegacyForksPageParser,
  LegacyForksDiffButton,
} from "./lib/legacy-forks";

const addButton = () => {
  // Early exit if wrong page
  if (
    !FORKS_URL_REGEX.test(location.href) &&
    !LEGACY_FORKS_URL_REGEX.test(location.href)
  ) {
    return;
  }

  // Forks page (/forks)
  if (FORKS_URL_REGEX.test(location.href)) {
    const forks = ForksPageParser.parse();
    const processor = new ForkProcessor(forks);
    const button = new ForksDiffButton(processor);
    button.insertButton();
  }

  // Legacy forks page (/network/members)
  if (LEGACY_FORKS_URL_REGEX.test(location.href)) {
    const forks = LegacyForksPageParser.parse();
    const processor = new ForkProcessor(forks);
    const button = new LegacyForksDiffButton(processor);
    button.insertButton();
  }
};

// On load
addButton();

// Add Turbo listener
document.addEventListener("turbo:render", () => {
  addButton();
});
