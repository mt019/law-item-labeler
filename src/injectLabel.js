let styleNode = null;

export function insertItemLabels() {
  document.querySelectorAll('.law-article').forEach(container => {
    let counter = 1;
    container.querySelectorAll('.show-number').forEach(div => {
      if (!div.classList.contains('number-inserted')) {
        div.style.position = 'relative';

        const label = document.createElement('span');
        label.textContent = `第${counter}項：`;
        label.className = 'inserted-label';
        label.style.position = 'absolute';
        label.style.left = '-3.5em';
        label.style.top = '0';
        label.style.color = '#666';
        label.style.fontFamily = 'Consolas, monospace';
        label.style.fontSize = '0.85em';
        label.style.whiteSpace = 'nowrap';
        label.style.lineHeight = '1.6';

        div.prepend(label);
        div.classList.add('number-inserted');
      }
      counter++;
    });
  });

  if (!styleNode) {
    styleNode = document.createElement('style');
    styleNode.textContent = `.show-number::before { content: none !important; }`;
    document.head.appendChild(styleNode);
  }
}

export function removeItemLabels() {
  document.querySelectorAll('.law-article .show-number').forEach(div => {
    if (div.classList.contains('number-inserted')) {
      const label = div.querySelector('.inserted-label');
      if (label) label.remove();
      div.classList.remove('number-inserted');
      div.style.position = '';
    }
  });

  if (styleNode) {
    styleNode.remove();
    styleNode = null;
  }
}