import { useEffect } from 'react';

// 키보드의 키를 누르면 호출될 함수
const handleFirstTab = event => {
  if (event.keyCode === 9) { // keyCode 값이 9일 때(누른 키가 Tab 키일 때) 해당 코드 블록 실행
    document.body.classList.add('user-is-tabbing'); // body element에 'user-is-tabbing' class 추가

    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
}

// 마우스로 클릭하면 호출될 함수
const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing'); // body element에 'user-is-tabbing' class 제거

  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
}

// Tab 키 사용 여부에 따라서 :focus outline 스타일을 변경시키는 Custom Hook
export const useRemoveFocusWhenNotTab = () => {
  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab);

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
    }
  }, []);
}