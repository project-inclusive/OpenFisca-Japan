export const data: { [key: string]: { [key: string]: TokyoCityTypes } } = {
  "東京都": {
    "新宿区": {
      "施設名": "新宿区社会福祉協議会",
      "郵便番号": "169-0075",
      "所在地": "新宿区高田馬場１−１７−２０",
      "経度": 139.70703,
      "緯度": 35.711459999999995,
      "座標系": "JGD2011",
      "電話番号": "03-5273-2941",
      "WebサイトURL": "https://www.shinjuku-shakyo.jp/"
    },
    "港区": {
      "施設名": "港区社会福祉協議会",
      "郵便番号": "106-0032",
      "所在地": "港区六本木５−１６−４５港区麻布地区総合支所２階",
      "経度": 139.73578999999998,
      "緯度": 35.66081,
      "座標系": "JGD2011",
      "電話番号": "03-6230-0280",
      "WebサイトURL": "https://minato-cosw.net/"
    }
  }
};

export type TokyoCityTypes = {
  "施設名": string;
  "郵便番号": string;
  "所在地": string;
  "経度": number;
  "緯度": number;
  "座標系": string;
  "電話番号": string;
  "WebサイトURL": string;
};
