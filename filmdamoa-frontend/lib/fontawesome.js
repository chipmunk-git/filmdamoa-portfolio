import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faHeart as fasHeart,
  faSync
} from '@fortawesome/free-solid-svg-icons'; // 속이 꽉 찬 아이콘
import {
  faHeart as farHeart,
  faClock
} from '@fortawesome/free-regular-svg-icons'; // 속이 빈 아이콘
// import { } from '@fortawesome/free-brands-svg-icons';

// 프로젝트에서 사용할 아이콘만 import 후 추가
library.add(
  faPlus,
  fasHeart,
  farHeart,
  faSync,
  faClock
);