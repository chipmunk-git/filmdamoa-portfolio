// 한 자리 숫자를 두 자리 숫자로 변환
export const numberReader = number => {
  return number < 10 ? '0' + number : number;
}

export const createParsedDates = movieFormDateList => {
  const first = movieFormDateList[0].playDe; // 배열의 첫 번째 항목에서 'yyyymmdd' 형식의 날짜 문자열 확보
  const firstDate = new Date(`${first.substr(0, 4)}-${first.substr(4, 2)}-${first.substr(6, 2)}`); // first에 상응되는 Date 객체 확보
  const last = movieFormDateList[movieFormDateList.length - 1].playDe; // 배열의 마지막 항목에서 'yyyymmdd' 형식의 날짜 문자열 확보
  const lastDate = new Date(`${last.substr(0, 4)}-${last.substr(4, 2)}-${last.substr(6, 2)}`);
  const dateGap = (lastDate - firstDate) / 86400000 + 1; // 첫 번째 날짜와 마지막 날짜 사이의 간격 계산
  const firstDateTime = firstDate.getTime(); // 첫 번째 날짜의 'milliseconds since the ECMAScript epoch' 확보
  const second = movieFormDateList[1].playDe;
  const dayOfTheWeek = ['일', '월', '화', '수', '목', '금', '토', '오늘', '내일'];

  const movieFormDateMap = new Map();
  for (let movieFormDate of movieFormDateList) {
    // 각 항목의 날짜 문자열을 key, 요일 코드 및 공휴일 여부 정보를 value로 하여 movieFormDateMap에 저장
    movieFormDateMap.set(movieFormDate.playDe, {
      dayCode: movieFormDate.dowCd,
      holiday: movieFormDate.hldyDivAt
    });
  }
  const monthSet = new Set();

  // 특정 길이의 배열 생성 후 하루씩 증가하도록 각 항목에 Date 객체 할당
  const dates = Array.from({ length: dateGap > 14 ? dateGap : 14 }, (_, i) => new Date(firstDateTime + i * 86400000));
  // 각 항목의 Date 객체를 분석 및 가공하여 새로운 배열로 반환
  const parsedDates = dates.map((date, i) => {
    const fullYear = date.getFullYear();
    const month = date.getMonth() + 1;
    const onlyDate = date.getDate();
    const formattedDate = `${fullYear}${numberReader(month)}${numberReader(onlyDate)}`;
    const movieFormDate = movieFormDateMap.get(formattedDate); // { dayCode, holiday } 또는 undefined 반환
    let convertedDay = null;
    let extraordinaryDay = null; // 추후 color 스타일 적용에 이용됨
    let fullYearAndMonth = null;

    switch (formattedDate) {
      case first:
        convertedDay = dayOfTheWeek[7]; // '오늘' 할당
        break;
      case second:
        convertedDay = dayOfTheWeek[8]; // '내일' 할당
        break;
      default:
        convertedDay = dayOfTheWeek[date.getDay()]; // 알맞은 요일 할당
        break;
    }

    if (movieFormDate) {
      if (movieFormDate.dayCode === '7') {
        extraordinaryDay = 'SAT'; // 토요일인 경우
      } else if (movieFormDate.dayCode === '1' || movieFormDate.holiday === 'Y') {
        extraordinaryDay = 'SUN_OR_HOL'; // 일요일 또는 공휴일인 경우
      }
    }

    if (!monthSet.has(month)) { // monthSet에 month가 존재하지 않으면 해당 코드 블록 실행
      monthSet.add(month); // 각 월마다 한 번씩만 실행되도록 month를 monthSet에 추가
      fullYearAndMonth = `${fullYear}.${numberReader(month)}`;
    }

    return {
      id: i,
      fullYear: fullYear,
      month: month,
      date: onlyDate,
      formattedDate: formattedDate,
      day: [convertedDay, extraordinaryDay],
      active: movieFormDate ? true : false,
      fullYearAndMonth: fullYearAndMonth
    };
  });

  return parsedDates;
}

// 1차원 배열을 2차원 배열로 변환
export const createParsedTheaters = theaters => {
  const parsedTheaters = []; // 외부 배열
  const parsedTheater = []; // 내부 배열

  for (let i = 0; i < theaters.length; i++) { // theaters의 길이만큼 반복문 실행
    if (i === 0 || theaters[i]['areaCd'] === theaters[i - 1]['areaCd']) { // 첫 번째 인덱스인지 또는 현재 항목과 이전 항목의 areaCd 값이 동일한지 판단
      parsedTheater.push(theaters[i]); // 현재 항목을 내부 배열에 추가

      if (i === theaters.length - 1) parsedTheaters.push(parsedTheater.slice()); // 마지막 인덱스라면 내부 배열의 복사본을 외부 배열에 추가
    } else {
      parsedTheaters.push(parsedTheater.slice()); // 현재 항목과 이전 항목의 areaCd 값이 다르다면 내부 배열의 복사본을 외부 배열에 추가
      parsedTheater.length = 0; // 내부 배열 초기화
      parsedTheater.push(theaters[i]); // 현재 항목을 내부 배열에 추가
    }
  }

  return parsedTheaters;
}

export const parseSeatDatas = seatData => {
  const parsedRows = Array.from({ length: seatData.seatInfoSD01.rowNoMax + 1 }, () => null); // 특정 길이의 1차원 배열 생성 후 각 항목에 null 할당
  // 특정 길이의 2차원 배열 생성 후 각 항목에 null 할당
  const parsedSeats = Array.from(Array(seatData.seatInfoSD01.rowNoMax + 1), () => Array(seatData.seatInfoSD01.colNoMax + 1).fill(null));

  seatData.seatListSD01.forEach(element => {
    if (!parsedRows[element.rowNo]) parsedRows[element.rowNo] = element.rowNm; // '행 번호'로 참조되는 위치에 값이 존재하지 않으면 상응되는 '행 이름'을 해당 항목에 할당
    parsedSeats[element.rowNo][element.colNo] = element; // 좌석 객체를 '행 번호' 및 '열 번호'가 가리키는 항목에 할당
  });
  seatData.seatListSD05.forEach(element => parsedSeats[element.rowNo][element.colNo] = element); // 출입구 객체를 '행 번호' 및 '열 번호'가 가리키는 항목에 할당

  return { parsedRowList: parsedRows, parsedSeatList: parsedSeats };
}

// 정형화된 형태의 날짜 및 시간 문자열을 분석 및 가공하여 반환
export const parsePaymentDateTime = paymentDateTime => {
  const returnedDate = new Date(paymentDateTime);

  const year = returnedDate.getFullYear();
  const month = numberReader(returnedDate.getMonth() + 1);
  const date = numberReader(returnedDate.getDate());
  const hour = numberReader(returnedDate.getHours());
  const minute = numberReader(returnedDate.getMinutes());

  return `${year}.${month}.${date} (${hour}:${minute})`;
}