import { insertItemLabels, removeItemLabels } from './injectLabel.js';
import { createToggleButton } from './uiButton.js';

function init() {
  insertItemLabels();
  createToggleButton(removeItemLabels, insertItemLabels);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
