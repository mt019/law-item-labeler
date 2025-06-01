export function createToggleButton(removeFn, insertFn) {
  const btn = document.createElement('button');
  btn.textContent = '隱藏項次';
  btn.style.position = 'fixed';
  btn.style.top = '12px';
  btn.style.right = '12px';
  btn.style.zIndex = '9999';
  btn.style.padding = '6px 12px';
  btn.style.fontSize = '14px';
  btn.style.background = '#006699';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  btn.setAttribute('data-state', 'shown');

  btn.addEventListener('click', () => {
    if (btn.getAttribute('data-state') === 'shown') {
      removeFn();
      btn.textContent = '顯示項次';
      btn.setAttribute('data-state', 'hidden');
    } else {
      insertFn();
      btn.textContent = '隱藏項次';
      btn.setAttribute('data-state', 'shown');
    }
  });

  document.body.appendChild(btn);
}
