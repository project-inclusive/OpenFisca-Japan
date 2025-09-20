import { HelpDeskData } from './窓口情報形式';

export const helloWorkData: HelpDeskData = {
  埼玉県: {
    // TODO: 他の埼玉県の市区町村でも同じ窓口表示をした方が良い？
    富士見市: {
      施設名: 'ハローワーク川越',
      所在地: '川越市豊田本1-19-8',
      電話番号: '049-242-0197',
      WebサイトURL:
        'https://jsite.mhlw.go.jp/saitama-hellowork/list/kawagoe.html',
    },
  },
};

export const injuryAndIllnessAllowanceData: HelpDeskData = {
  埼玉県: {
    富士見市: {
      施設名: '富士見市役所 保険年金課 健康保険係',
      所在地: '埼玉県富士見市大字鶴馬1800-1',
      電話番号: '049-252-7112',
      WebサイトURL:
        'https://www.city.fujimi.saitama.jp/kurashi_tetsuzuki/03hoken/kokuken/shikaku_kyufu/syobyoteate.html',
    },
  },
};
