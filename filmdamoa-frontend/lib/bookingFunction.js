export const numberReader = number => {
  return number < 10 ? '0' + number : number;
}

export const createParsedDates = movieFormDateList => {
  const first = movieFormDateList[0].playDe;
  const firstDate = new Date(`${first.substr(0, 4)}-${first.substr(4, 2)}-${first.substr(6, 2)}`);
  const last = movieFormDateList[movieFormDateList.length - 1].playDe;
  const lastDate = new Date(`${last.substr(0, 4)}-${last.substr(4, 2)}-${last.substr(6, 2)}`);
  const dateGap = (lastDate - firstDate) / 86400000 + 1;
  const firstDateTime = firstDate.getTime();
  const second = movieFormDateList[1].playDe;
  const dayOfTheWeek = ['일', '월', '화', '수', '목', '금', '토', '오늘', '내일'];

  const movieFormDateMap = new Map();
  for (let movieFormDate of movieFormDateList) {
    movieFormDateMap.set(movieFormDate.playDe, {
      dayCode: movieFormDate.dowCd,
      holiday: movieFormDate.hldyDivAt
    });
  }
  const monthSet = new Set();

  const dates = Array.from({ length: dateGap > 14 ? dateGap : 14 }, (_, i) => new Date(firstDateTime + i * 86400000));
  const parsedDates = dates.map((date, i) => {
    const fullYear = date.getFullYear();
    const month = date.getMonth() + 1;
    const onlyDate = date.getDate();
    const formattedDate = `${fullYear}${numberReader(month)}${numberReader(onlyDate)}`;
    const movieFormDate = movieFormDateMap.get(formattedDate);
    let convertedDay = null;
    let extraordinaryDay = null;
    let fullYearAndMonth = null;

    switch (formattedDate) {
      case first:
        convertedDay = dayOfTheWeek[7];
        break;
      case second:
        convertedDay = dayOfTheWeek[8];
        break;
      default:
        convertedDay = dayOfTheWeek[date.getDay()];
        break;
    }

    if (movieFormDate) {
      if (movieFormDate.dayCode === '7') {
        extraordinaryDay = 'SAT';
      } else if (movieFormDate.dayCode === '1' || movieFormDate.holiday === 'Y') {
        extraordinaryDay = 'SUN_OR_HOL';
      }
    }

    if (!monthSet.has(month)) {
      monthSet.add(month);
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

export const createParsedTheaters = theaters => {
  const parsedTheaters = [];
  const parsedTheater = [];

  for (let i = 0; i < theaters.length; i++) {
    if (i === 0 || theaters[i]['areaCd'] === theaters[i - 1]['areaCd']) {
      parsedTheater.push(theaters[i]);

      if (i === theaters.length - 1) parsedTheaters.push(parsedTheater.slice());
    } else {
      parsedTheaters.push(parsedTheater.slice());
      parsedTheater.length = 0;
      parsedTheater.push(theaters[i]);
    }
  }

  return parsedTheaters;
}

export const parseSeatDatas = seatData => {
  const parsedRows = Array.from({ length: seatData.seatInfoSD01.rowNoMax + 1 }, () => null);
  const parsedSeats = Array.from(Array(seatData.seatInfoSD01.rowNoMax + 1), () => Array(seatData.seatInfoSD01.colNoMax + 1).fill(null));

  seatData.seatListSD01.forEach(element => {
    if (!parsedRows[element.rowNo]) parsedRows[element.rowNo] = element.rowNm;
    parsedSeats[element.rowNo][element.colNo] = element;
  });
  seatData.seatListSD05.forEach(element => parsedSeats[element.rowNo][element.colNo] = element);

  return { parsedRowList: parsedRows, parsedSeatList: parsedSeats };
}

export const parsePaymentDateTime = paymentDateTime => {
  const returnedDate = new Date(paymentDateTime);

  const year = returnedDate.getFullYear();
  const month = numberReader(returnedDate.getMonth() + 1);
  const date = numberReader(returnedDate.getDate());
  const hour = numberReader(returnedDate.getHours());
  const minute = numberReader(returnedDate.getMinutes());

  return `${year}.${month}.${date} (${hour}:${minute})`;
}