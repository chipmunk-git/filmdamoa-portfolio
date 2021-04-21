import { useEffect } from 'react';

const handleFirstTab = event => {
  if (event.keyCode === 9) {
    document.body.classList.add('user-is-tabbing');
    
    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
}

function handleMouseDownOnce() {
  document.body.classList.remove('user-is-tabbing');
  
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
}

const RemoveFocusWhenNotTab = () => {
  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab);
    return () => {
      window.removeEventListener('keydown', handleFirstTab);
    };
  });

  return null;
}

export default RemoveFocusWhenNotTab;