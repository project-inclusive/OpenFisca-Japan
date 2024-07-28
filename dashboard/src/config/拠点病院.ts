// 以下webサイトの情報を参照
// https://hiv-hospital.jp/map/index_kubun@block.html

// TODO: 公式の訳語があればその名前を使用する

// 中核拠点病院
const centralBaseHospitalData: HIVBaseHospitalData = {};

// ブロック拠点病院
// NOTE: 中核拠点病院を兼ねている場所については省略（重複表示を避けるため）
const blockBaseHospitalData: HIVBaseHospitalData = {
  北海道: {
    札幌医科大学附属病院: {
      施設名: '札幌医科大学附属病院',
      郵便番号: '060-8543',
      所在地: '北海道札幌市中央区南一条西１６－２９１',
      電話番号: '011-611-2111',
      WebサイトURL: 'https://web.sapmed.ac.jp/hospital/',
      ブロック: '北海道',
    },
    北海道大学病院: {
      施設名: '北海道大学病院',
      郵便番号: '060-8648',
      所在地: '北海道札幌市北区北十四条西５',
      電話番号: '011-716-1161',
      WebサイトURL: 'https://www.huhp.hokudai.ac.jp/',
      ブロック: '北海道',
    },
    旭川医科大学病院: {
      施設名: '旭川医科大学病院',
      郵便番号: '078-8510',
      所在地: '北海道旭川市緑が丘東２条１－１－１',
      電話番号: '0166-65-2111',
      WebサイトURL: 'https://www.asahikawa-med.ac.jp/',
      ブロック: '北海道',
    },
  },
  東北: {
    // 仙台医療センターは中核拠点病院でもあるため省略
  },
  関東甲信越: {
    新潟市民病院: {
      施設名: '新潟市民病院',
      郵便番号: '950-1197',
      所在地: '新潟県新潟市中央区鐘木４６３－７',
      電話番号: '025-281-5151',
      WebサイトURL: 'https://www.hosp.niigata.niigata.jp/',
      ブロック: '関東甲信越',
    },
    // 新潟大学医歯学総合病院は中核拠点病院でもあるため省略
    新潟県立新発田病院: {
      施設名: '新潟県立新発田病院',
      郵便番号: '957-8588',
      所在地: '新潟県新発田市本町１丁目２番８号',
      電話番号: '0254-22-3121',
      WebサイトURL: 'http://www.sbthp.jp/',
      ブロック: '関東甲信越',
    },
  },
  北陸: {
    // 石川県立中央病院は中核拠点病院でもあるため省略
  },
  東海: {
    // 名古屋医療センターは中核拠点病院でもあるため省略
  },
  近畿: {
    大阪医療センター: {
      施設名: '大阪医療センター',
      郵便番号: '540-0006',
      所在地: '大阪府大阪市中央区法円坂２－１－１４',
      電話番号: '06-6942-1331',
      WebサイトURL: 'https://osaka.hosp.go.jp/department/khac/',
      ブロック: '近畿',
    },
  },
  中国四国: {
    // 広島市立広島市民病院は中核拠点病院でもあるため省略
    // 県立広島病院は中核拠点病院でもあるため省略
    広島大学病院: {
      施設名: '広島大学病院',
      郵便番号: '734-8551',
      所在地: '広島県広島市南区霞１－２－３',
      電話番号: '082-257-5555',
      WebサイトURL: 'https://www.hiroshima-u.ac.jp/hosp/',
      ブロック: '中国四国',
    },
  },
  九州沖縄: {
    九州医療センター: {
      施設名: '九州医療センター',
      郵便番号: '810-8563',
      所在地: '福岡県福岡市中央区地行浜１－８－１',
      電話番号: '092-852-0700',
      WebサイトURL: 'https://kyushu-mc.hosp.go.jp/',
      ブロック: '九州沖縄',
    },
  },
};

export const data: { [key: string]: HIVBaseHospitalData } = {
  中核拠点病院: centralBaseHospitalData,
  ブロック拠点病院: blockBaseHospitalData,
};

export type HIVBaseHospitalData = {
  [key: string]: { [key: string]: HIVBaseHospital };
};

export type HIVBaseHospital = {
  施設名: string;
  郵便番号: string;
  所在地: string;
  電話番号: string;
  WebサイトURL: string;
  ブロック: string;
};
