// 코드 출처: https://backend-intro.vlpt.us/6/04.html 기반
// 세션 스토리지에 JSON 형태로 저장 / 불러오기 / 삭제 헬퍼
const storage = {
  set: (key, object) => {
    if (!sessionStorage) return null;
    sessionStorage[key] = (typeof object) === 'string' ? object : JSON.stringify(object); // object의 자료형이 'string'이 아니라면 JSON.stringify() 메소드로 처리하여 저장
  },
  get: key => {
    if (!sessionStorage || !sessionStorage[key]) return null;

    try {
      return JSON.parse(sessionStorage[key]);
    } catch (e) {
      return sessionStorage[key]; // key에 해당되는 값을 JSON.parse() 메소드로 처리할 수 없다면 있는 그대로 반환
    }
  },
  remove: key => {
    if (!sessionStorage) return null;
    if (sessionStorage[key]) sessionStorage.removeItem(key);
  }
};

export default storage;