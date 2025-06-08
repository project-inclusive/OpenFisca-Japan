export type HelpDesk = {
  施設名: string;
  所在地: string;
  電話番号: string;
  WebサイトURL: string;
  補足事項?: string;
};

export type HelpDeskData = { [key: string]: { [key: string]: HelpDesk } };
