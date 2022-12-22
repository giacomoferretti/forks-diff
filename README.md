# Forks Diff Counter for GitHub

## Installation

### Chrome Web Store

Get the extension on the [Chrome Web Store](https://chrome.google.com/webstore/detail/eencojgimolmahmdfpnfbcldppmlokfg).

### Firefox Browser Add-ons

Get the extension on the [Firefox Browser Add-ons](https://addons.mozilla.org/en-US/firefox/addon/forks-diff-counter-for-github/).

## Contributing

Clone the repo with `git clone https://github.com/giacomoferretti/forks-diff`

### Google Chrome

1. Visit `chrome://extensions/`
2. Enable "Developer mode"
3. Click on "Load unpacked"
4. Select the cloned folder

When updating the plugin, remember to reload it.

### Mozilla Firefox

1. Change `manifest_version` inside `manifest.json` from `3` to `2`
2. Visit `about:debugging#/runtime/this-firefox`
3. Under "Temporary Extensions" click on "Load Temporary Add-on..."
4. Select `manifest.json`

When updating the plugin, remember to reload it.

### How to pack

Use the `pack.sh` script to generate the zip file.
