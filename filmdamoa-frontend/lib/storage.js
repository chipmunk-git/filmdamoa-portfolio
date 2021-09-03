// 코드 출처: https://backend-intro.vlpt.us/6/04.html 기반
// 세션 스토리지에 JSON 형태로 저장 / 불러오기 / 삭제 헬퍼
const storage = {
  set: (key, object) => {
    if (!sessionStorage) return null;
    sessionStorage[key] = (typeof object) === 'string' ? object : JSON.stringify(object);
  },
  get: (key) => {
    if (!sessionStorage) return null;
    if (!sessionStorage[key]) return null;

    try {
      const parsed = JSON.parse(sessionStorage[key]);
      return parsed;
    } catch (e) {
      return sessionStorage[key];
    }
  },
  remove: (key) => {
    if (!sessionStorage) return null;
    if (sessionStorage[key]) sessionStorage.removeItem(key);
  }
};

export default storage;