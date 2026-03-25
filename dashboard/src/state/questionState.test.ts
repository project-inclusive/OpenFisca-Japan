import { test, expect } from 'vitest';
import { Actor, createActor } from 'xstate';
import { questionStateMachine } from './questionState';
import { QuestionKey } from './questionDefinition';

// stateの準備をするためのヘルパー関数
// 特定のstateまでの遷移を毎回定義すると冗長なので、この関数で共通化
const skipUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: 'くわしく見積もり',
          },
        });
      },
    },
    {
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '東京都',
            municipality: '渋谷区',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '仕事',
      f: () => {
        actor.send({
          type: '仕事',
          value: { type: 'Selection', selection: '会社員' },
        });
      },
    },
    {
      key: '6か月以内に新しい仕事を始めましたか？',
      f: () => {
        actor.send({
          type: '6か月以内に新しい仕事を始めましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中ですか？',
      f: () => {
        actor.send({
          type: '休職中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中に給与の支払いがない状態ですか？',
      f: () => {
        actor.send({
          type: '休職中に給与の支払いがない状態ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: ['病気がある', '障害がある'],
          },
        });
      },
    },
    {
      key: '業務によって病気やけがをしましたか？',
      f: () => {
        actor.send({
          type: '業務によって病気やけがをしましたか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '病気やけがによって連続3日以上休業していますか？',
      f: () => {
        actor.send({
          type: '病気やけがによって連続3日以上休業していますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '入院中ですか？',
      f: () => {
        actor.send({
          type: '入院中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
      f: () => {
        actor.send({
          type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '感染症にかかっていますか？',
      f: () => {
        actor.send({
          type: '感染症にかかっていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'HIVに感染していますか？',
      f: () => {
        actor.send({
          type: 'HIVに感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'エイズを発症していますか？',
      f: () => {
        actor.send({
          type: 'エイズを発症していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家族に血液製剤によってHIVに感染した方はいますか？',
      f: () => {
        actor.send({
          type: '家族に血液製剤によってHIVに感染した方はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '血液製剤の投与によってHIVに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってHIVに感染しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: 'C型肝炎に感染していますか？',
      f: () => {
        actor.send({
          type: 'C型肝炎に感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
      f: () => {
        actor.send({
          type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '腎不全ですか？',
      f: () => {
        actor.send({
          type: '腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '慢性腎不全ですか？',
      f: () => {
        actor.send({
          type: '慢性腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '人工透析を行っていますか？',
      f: () => {
        actor.send({
          type: '人工透析を行っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '先天性の血液凝固因子異常症（血友病等）ですか？',
      f: () => {
        actor.send({
          type: '先天性の血液凝固因子異常症（血友病等）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
      f: () => {
        actor.send({
          type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '身体障害者手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '身体障害者手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '精神障害者保健福祉手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '精神障害者保健福祉手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '療育手帳、または愛の手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '療育手帳、または愛の手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '放射線障害がありますか？',
      f: () => {
        actor.send({
          type: '放射線障害がありますか？',
          value: { type: 'Selection', selection: 'いいえ' },
        });
      },
    },
    {
      key: '内部障害（内臓などのからだの内部の障害）がありますか？',
      f: () => {
        actor.send({
          type: '内部障害（内臓などのからだの内部の障害）がありますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '脳性まひ、または進行性筋萎縮症ですか？',
      f: () => {
        actor.send({
          type: '脳性まひ、または進行性筋萎縮症ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家を借りたいですか？',
      f: () => {
        actor.send({
          type: '家を借りたいですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '困りごとはありますか？',
      f: () => {
        actor.send({
          type: '困りごとはありますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '親の人数',
      f: () => {
        actor.send({
          type: '親の人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
  ];

  for (const sendFunc of sendFuncs) {
    if (sendFunc.key === until) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
  }
};

const skipSpouseUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: 'くわしく見積もり',
          },
        });
      },
    },
    {
      // あなたについて
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '東京都',
            municipality: '渋谷区',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: [],
          },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家を借りたいですか？',
      f: () => {
        actor.send({
          type: '家を借りたいですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '困りごとはありますか？',
      f: () => {
        actor.send({
          type: '困りごとはありますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },

    // 配偶者について
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '仕事',
      f: () => {
        actor.send({
          type: '仕事',
          value: { type: 'Selection', selection: '会社員' },
        });
      },
    },
    {
      key: '6か月以内に新しい仕事を始めましたか？',
      f: () => {
        actor.send({
          type: '6か月以内に新しい仕事を始めましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中ですか？',
      f: () => {
        actor.send({
          type: '休職中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中に給与の支払いがない状態ですか？',
      f: () => {
        actor.send({
          type: '休職中に給与の支払いがない状態ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: ['病気がある', '障害がある'],
          },
        });
      },
    },
    {
      key: '業務によって病気やけがをしましたか？',
      f: () => {
        actor.send({
          type: '業務によって病気やけがをしましたか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '病気やけがによって連続3日以上休業していますか？',
      f: () => {
        actor.send({
          type: '病気やけがによって連続3日以上休業していますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '入院中ですか？',
      f: () => {
        actor.send({
          type: '入院中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
      f: () => {
        actor.send({
          type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '感染症にかかっていますか？',
      f: () => {
        actor.send({
          type: '感染症にかかっていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'HIVに感染していますか？',
      f: () => {
        actor.send({
          type: 'HIVに感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'エイズを発症していますか？',
      f: () => {
        actor.send({
          type: 'エイズを発症していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家族に血液製剤によってHIVに感染した方はいますか？',
      f: () => {
        actor.send({
          type: '家族に血液製剤によってHIVに感染した方はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '血液製剤の投与によってHIVに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってHIVに感染しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: 'C型肝炎に感染していますか？',
      f: () => {
        actor.send({
          type: 'C型肝炎に感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
      f: () => {
        actor.send({
          type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '腎不全ですか？',
      f: () => {
        actor.send({
          type: '腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '慢性腎不全ですか？',
      f: () => {
        actor.send({
          type: '慢性腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '人工透析を行っていますか？',
      f: () => {
        actor.send({
          type: '人工透析を行っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '先天性の血液凝固因子異常症（血友病等）ですか？',
      f: () => {
        actor.send({
          type: '先天性の血液凝固因子異常症（血友病等）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
      f: () => {
        actor.send({
          type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '身体障害者手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '身体障害者手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '精神障害者保健福祉手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '精神障害者保健福祉手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '療育手帳、または愛の手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '療育手帳、または愛の手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '放射線障害がありますか？',
      f: () => {
        actor.send({
          type: '放射線障害がありますか？',
          value: { type: 'Selection', selection: 'いいえ' },
        });
      },
    },
    {
      key: '内部障害（内臓などのからだの内部の障害）がありますか？',
      f: () => {
        actor.send({
          type: '内部障害（内臓などのからだの内部の障害）がありますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '脳性まひ、または進行性筋萎縮症ですか？',
      f: () => {
        actor.send({
          type: '脳性まひ、または進行性筋萎縮症ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '以下のいずれかに当てはまりますか？',
      f: () => {
        actor.send({
          type: '以下のいずれかに当てはまりますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
  ];

  // あなたと配偶者で同じキーが存在するため、配偶者セクションに入った後のみ停止する
  const duplicateKeys: QuestionKey[] = [
    '年齢',
    '年収',
    '預貯金',
    '現在仕事をしていますか？',
    '病気やけが、障害はありますか？',
    '介護施設に入所していますか？',
    '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    '妊娠中、または産後6ヵ月以内ですか？',
  ];
  let inSpouseSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inSpouseSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '配偶者はいますか？') {
      inSpouseSection = true;
    }
  }
};

const skipChildUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey,
  numOfChildren: number = 1
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: 'くわしく見積もり',
          },
        });
      },
    },
    {
      // あなたについて
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '東京都',
            municipality: '渋谷区',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: [],
          },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家を借りたいですか？',
      f: () => {
        actor.send({
          type: '家を借りたいですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '困りごとはありますか？',
      f: () => {
        actor.send({
          type: '困りごとはありますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: numOfChildren },
        });
      },
    },

    // 子どもについて
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '高校に通っていますか？',
      f: () => {
        actor.send({
          type: '高校に通っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '通っている高校の種類を選んでください（1）',
      f: () => {
        actor.send({
          type: '通っている高校の種類を選んでください（1）',
          value: { type: 'Selection', selection: '全日制課程' },
        });
      },
    },
    {
      key: '通っている高校の種類を選んでください（2）',
      f: () => {
        actor.send({
          type: '通っている高校の種類を選んでください（2）',
          value: { type: 'Selection', selection: '公立' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 10, unit: '万円' },
        });
      },
    },
    {
      key: '仕事',
      f: () => {
        actor.send({
          type: '仕事',
          value: { type: 'Selection', selection: '会社員' },
        });
      },
    },
    {
      key: '6か月以内に新しい仕事を始めましたか？',
      f: () => {
        actor.send({
          type: '6か月以内に新しい仕事を始めましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中ですか？',
      f: () => {
        actor.send({
          type: '休職中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中に給与の支払いがない状態ですか？',
      f: () => {
        actor.send({
          type: '休職中に給与の支払いがない状態ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: ['病気がある', '障害がある'],
          },
        });
      },
    },
    {
      key: '業務によって病気やけがをしましたか？',
      f: () => {
        actor.send({
          type: '業務によって病気やけがをしましたか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '病気やけがによって連続3日以上休業していますか？',
      f: () => {
        actor.send({
          type: '病気やけがによって連続3日以上休業していますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '入院中ですか？',
      f: () => {
        actor.send({
          type: '入院中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
      f: () => {
        actor.send({
          type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '感染症にかかっていますか？',
      f: () => {
        actor.send({
          type: '感染症にかかっていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'HIVに感染していますか？',
      f: () => {
        actor.send({
          type: 'HIVに感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'エイズを発症していますか？',
      f: () => {
        actor.send({
          type: 'エイズを発症していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家族に血液製剤によってHIVに感染した方はいますか？',
      f: () => {
        actor.send({
          type: '家族に血液製剤によってHIVに感染した方はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '血液製剤の投与によってHIVに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってHIVに感染しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: 'C型肝炎に感染していますか？',
      f: () => {
        actor.send({
          type: 'C型肝炎に感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
      f: () => {
        actor.send({
          type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '腎不全ですか？',
      f: () => {
        actor.send({
          type: '腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '慢性腎不全ですか？',
      f: () => {
        actor.send({
          type: '慢性腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '人工透析を行っていますか？',
      f: () => {
        actor.send({
          type: '人工透析を行っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '先天性の血液凝固因子異常症（血友病等）ですか？',
      f: () => {
        actor.send({
          type: '先天性の血液凝固因子異常症（血友病等）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
      f: () => {
        actor.send({
          type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '身体障害者手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '身体障害者手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '精神障害者保健福祉手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '精神障害者保健福祉手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '療育手帳、または愛の手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '療育手帳、または愛の手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '放射線障害がありますか？',
      f: () => {
        actor.send({
          type: '放射線障害がありますか？',
          value: { type: 'Selection', selection: 'いいえ' },
        });
      },
    },
    {
      key: '内部障害（内臓などのからだの内部の障害）がありますか？',
      f: () => {
        actor.send({
          type: '内部障害（内臓などのからだの内部の障害）がありますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '脳性まひ、または進行性筋萎縮症ですか？',
      f: () => {
        actor.send({
          type: '脳性まひ、または進行性筋萎縮症ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
  ];

  // あなたと子どもで同じキーが存在するため、配偶者セクションを抜けた後のみ停止する
  const duplicateKeys: QuestionKey[] = [
    '年齢',
    '現在仕事をしていますか？',
    '病気やけが、障害はありますか？',
    '介護施設に入所していますか？',
  ];
  let inSpouseSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inSpouseSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '配偶者はいますか？') {
      inSpouseSection = true;
    }
  }
};

const skipParentUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey,
  numOfParents: number = 1
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: 'くわしく見積もり',
          },
        });
      },
    },
    {
      // あなたについて
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '東京都',
            municipality: '渋谷区',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: [],
          },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家を借りたいですか？',
      f: () => {
        actor.send({
          type: '家を借りたいですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '困りごとはありますか？',
      f: () => {
        actor.send({
          type: '困りごとはありますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '親の人数',
      f: () => {
        actor.send({
          type: '親の人数',
          value: { type: 'PersonNum', selection: numOfParents },
        });
      },
    },

    // 親について
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 60 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '仕事',
      f: () => {
        actor.send({
          type: '仕事',
          value: { type: 'Selection', selection: '会社員' },
        });
      },
    },
    {
      key: '6か月以内に新しい仕事を始めましたか？',
      f: () => {
        actor.send({
          type: '6か月以内に新しい仕事を始めましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中ですか？',
      f: () => {
        actor.send({
          type: '休職中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中に給与の支払いがない状態ですか？',
      f: () => {
        actor.send({
          type: '休職中に給与の支払いがない状態ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: ['病気がある', '障害がある'],
          },
        });
      },
    },
    {
      key: '業務によって病気やけがをしましたか？',
      f: () => {
        actor.send({
          type: '業務によって病気やけがをしましたか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '病気やけがによって連続3日以上休業していますか？',
      f: () => {
        actor.send({
          type: '病気やけがによって連続3日以上休業していますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '入院中ですか？',
      f: () => {
        actor.send({
          type: '入院中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
      f: () => {
        actor.send({
          type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '感染症にかかっていますか？',
      f: () => {
        actor.send({
          type: '感染症にかかっていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'HIVに感染していますか？',
      f: () => {
        actor.send({
          type: 'HIVに感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'エイズを発症していますか？',
      f: () => {
        actor.send({
          type: 'エイズを発症していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家族に血液製剤によってHIVに感染した方はいますか？',
      f: () => {
        actor.send({
          type: '家族に血液製剤によってHIVに感染した方はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '血液製剤の投与によってHIVに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってHIVに感染しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: 'C型肝炎に感染していますか？',
      f: () => {
        actor.send({
          type: 'C型肝炎に感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
      f: () => {
        actor.send({
          type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '腎不全ですか？',
      f: () => {
        actor.send({
          type: '腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '慢性腎不全ですか？',
      f: () => {
        actor.send({
          type: '慢性腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '人工透析を行っていますか？',
      f: () => {
        actor.send({
          type: '人工透析を行っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '先天性の血液凝固因子異常症（血友病等）ですか？',
      f: () => {
        actor.send({
          type: '先天性の血液凝固因子異常症（血友病等）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
      f: () => {
        actor.send({
          type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '身体障害者手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '身体障害者手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '精神障害者保健福祉手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '精神障害者保健福祉手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '療育手帳、または愛の手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '療育手帳、または愛の手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '放射線障害がありますか？',
      f: () => {
        actor.send({
          type: '放射線障害がありますか？',
          value: { type: 'Selection', selection: 'いいえ' },
        });
      },
    },
    {
      key: '内部障害（内臓などのからだの内部の障害）がありますか？',
      f: () => {
        actor.send({
          type: '内部障害（内臓などのからだの内部の障害）がありますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '脳性まひ、または進行性筋萎縮症ですか？',
      f: () => {
        actor.send({
          type: '脳性まひ、または進行性筋萎縮症ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
  ];

  // あなたと親で同じキーが存在するため、親の人数セクションを抜けた後のみ停止する
  const duplicateKeys: QuestionKey[] = [
    '年齢',
    '年収',
    '預貯金',
    '現在仕事をしていますか？',
    '仕事',
    '6か月以内に新しい仕事を始めましたか？',
    '休職中ですか？',
    '休職中に給与の支払いがない状態ですか？',
    '病気やけが、障害はありますか？',
    '業務によって病気やけがをしましたか？',
    '病気やけがによって連続3日以上休業していますか？',
    '入院中ですか？',
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    '感染症にかかっていますか？',
    'HIVに感染していますか？',
    'エイズを発症していますか？',
    '家族に血液製剤によってHIVに感染した方はいますか？',
    '血液製剤の投与によってHIVに感染しましたか？',
    'C型肝炎に感染していますか？',
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    '腎不全ですか？',
    '慢性腎不全ですか？',
    '人工透析を行っていますか？',
    '先天性の血液凝固因子異常症（血友病等）ですか？',
    '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    '身体障害者手帳を持っていますか？',
    '精神障害者保健福祉手帳を持っていますか？',
    '療育手帳、または愛の手帳を持っていますか？',
    '放射線障害がありますか？',
    '内部障害（内臓などのからだの内部の障害）がありますか？',
    '脳性まひ、または進行性筋萎縮症ですか？',
    '介護施設に入所していますか？',
    '高校、大学、専門学校、職業訓練学校等の学生ですか？',
  ];
  let inParentSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inParentSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '親の人数') {
      inParentSection = true;
    }
  }
};

// 能登半島地震被災者支援制度見積もりモード用のskipヘルパー（あなた）
const skipDisasterUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: '能登半島地震被災者支援制度見積もり',
          },
        });
      },
    },
    {
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '石川県',
            municipality: '輪島市',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 40 },
        });
      },
    },
    {
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
        });
      },
    },
    {
      key: '住宅が被害を受けていますか？',
      f: () => {
        actor.send({
          type: '住宅が被害を受けていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
      f: () => {
        actor.send({
          type: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
          value: { type: 'Selection', selection: '全壊（損害割合50%以上）' },
        });
      },
    },
    {
      key: '住宅再建方法',
      f: () => {
        actor.send({
          type: '住宅再建方法',
          value: { type: 'Selection', selection: '建設または購入' },
        });
      },
    },
    {
      key: '家財の３分の１以上の損害が発生しましたか？',
      f: () => {
        actor.send({
          type: '家財の３分の１以上の損害が発生しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家族に災害で亡くなった方はいますか？',
      f: () => {
        actor.send({
          type: '家族に災害で亡くなった方はいますか？',
          value: { type: 'PersonNum', selection: 1 },
        });
      },
    },
    {
      key: '災害で生計維持者が亡くなりましたか？',
      f: () => {
        actor.send({
          type: '災害で生計維持者が亡くなりましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '親の人数',
      f: () => {
        actor.send({
          type: '親の人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
  ];

  for (const sendFunc of sendFuncs) {
    if (sendFunc.key === until) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
  }
};

// 能登半島地震被災者支援制度見積もりモード用のskipヘルパー（配偶者）
const skipDisasterSpouseUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: '能登半島地震被災者支援制度見積もり',
          },
        });
      },
    },
    {
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '石川県',
            municipality: '輪島市',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 40 },
        });
      },
    },
    {
      // あなたの年収
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
        });
      },
    },
    {
      key: '住宅が被害を受けていますか？',
      f: () => {
        actor.send({
          type: '住宅が被害を受けていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
      f: () => {
        actor.send({
          type: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
          value: { type: 'Selection', selection: '全壊（損害割合50%以上）' },
        });
      },
    },
    {
      key: '住宅再建方法',
      f: () => {
        actor.send({
          type: '住宅再建方法',
          value: { type: 'Selection', selection: '建設または購入' },
        });
      },
    },
    {
      key: '家財の３分の１以上の損害が発生しましたか？',
      f: () => {
        actor.send({
          type: '家財の３分の１以上の損害が発生しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      // あなたの災害負傷
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      // あなたの災害障害
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家族に災害で亡くなった方はいますか？',
      f: () => {
        actor.send({
          type: '家族に災害で亡くなった方はいますか？',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    // 配偶者セクション（changeToSpouse → 年収）
    {
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 200, unit: '万円' },
        });
      },
    },
    {
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
  ];

  // あなたと配偶者で重複するキー
  const duplicateKeys: QuestionKey[] = [
    '被災前の年収',
    '災害により負傷し、1ヶ月以上療養を続けていますか？',
    '災害によって、精神または身体に重い障害がありますか？',
  ];
  let inSpouseSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inSpouseSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '配偶者はいますか？') {
      inSpouseSection = true;
    }
  }
};

// 能登半島地震被災者支援制度見積もりモード用のskipヘルパー（子ども）
const skipDisasterChildUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey,
  numOfChildren: number = 1
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: '能登半島地震被災者支援制度見積もり',
          },
        });
      },
    },
    {
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '石川県',
            municipality: '輪島市',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 40 },
        });
      },
    },
    {
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
        });
      },
    },
    {
      key: '住宅が被害を受けていますか？',
      f: () => {
        actor.send({
          type: '住宅が被害を受けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家財の３分の１以上の損害が発生しましたか？',
      f: () => {
        actor.send({
          type: '家財の３分の１以上の損害が発生しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家族に災害で亡くなった方はいますか？',
      f: () => {
        actor.send({
          type: '家族に災害で亡くなった方はいますか？',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: numOfChildren },
        });
      },
    },
    // 子どもセクション（changeToChild → 年齢）
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
  ];

  // あなたと子どもで重複するキー
  const duplicateKeys: QuestionKey[] = [
    '年齢',
    '災害により負傷し、1ヶ月以上療養を続けていますか？',
    '災害によって、精神または身体に重い障害がありますか？',
  ];
  let inChildSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inChildSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '子どもの人数') {
      inChildSection = true;
    }
  }
};

// 能登半島地震被災者支援制度見積もりモード用のskipヘルパー（親）
const skipDisasterParentUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey,
  numOfParents: number = 1
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '見積もりモード',
      f: () => {
        actor.send({
          type: '見積もりモード',
          value: {
            type: 'Selection',
            selection: '能登半島地震被災者支援制度見積もり',
          },
        });
      },
    },
    {
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
          value: {
            type: 'Address',
            prefecure: '石川県',
            municipality: '輪島市',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 40 },
        });
      },
    },
    {
      // あなたの年収
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
        });
      },
    },
    {
      key: '住宅が被害を受けていますか？',
      f: () => {
        actor.send({
          type: '住宅が被害を受けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家財の３分の１以上の損害が発生しましたか？',
      f: () => {
        actor.send({
          type: '家財の３分の１以上の損害が発生しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      // あなたの災害負傷
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      // あなたの災害障害
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '家族に災害で亡くなった方はいますか？',
      f: () => {
        actor.send({
          type: '家族に災害で亡くなった方はいますか？',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '親の人数',
      f: () => {
        actor.send({
          type: '親の人数',
          value: { type: 'PersonNum', selection: numOfParents },
        });
      },
    },
    // 親セクション（changeToParent → 年収）
    {
      key: '被災前の年収',
      f: () => {
        actor.send({
          type: '被災前の年収',
          value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
        });
      },
    },
    {
      key: '災害により負傷し、1ヶ月以上療養を続けていますか？',
      f: () => {
        actor.send({
          type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '災害によって、精神または身体に重い障害がありますか？',
      f: () => {
        actor.send({
          type: '災害によって、精神または身体に重い障害がありますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
  ];

  // あなたと親で重複するキー
  const duplicateKeys: QuestionKey[] = [
    '被災前の年収',
    '災害により負傷し、1ヶ月以上療養を続けていますか？',
    '災害によって、精神または身体に重い障害がありますか？',
  ];
  let inParentSection = false;
  for (const sendFunc of sendFuncs) {
    const isDuplicate = duplicateKeys.includes(sendFunc.key);
    if (sendFunc.key === until && (!isDuplicate || inParentSection)) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
    if (sendFunc.key === '親の人数') {
      inParentSection = true;
    }
  }
};

// ============================================================
// 能登半島地震被災者支援制度見積もりモードのテスト
// ============================================================

// ---- あなた: 被災前の年収（災害モード） ----

test('あなた(災害モード): 被災前の年収: 次の質問が「住宅が被害を受けていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '被災前の年収');

  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('住宅が被害を受けていますか？');
});

// ---- あなた: 住宅が被害を受けていますか？ ----

test('あなた(災害モード): 住宅が被害を受けていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅が被害を受けていますか？');

  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['住宅が被害を受けていますか？']['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('あなた(災害モード): 住宅が被害を受けていますか？: yes → 次の質問が「住宅被害の状況...」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅が被害を受けていますか？');

  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  );
});

test('あなた(災害モード): 住宅が被害を受けていますか？: no → 次の質問が「家財の３分の１以上の損害が発生しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅が被害を受けていますか？');

  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家財の３分の１以上の損害が発生しましたか？'
  );
});

test('あなた(災害モード): 住宅が被害を受けていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅が被害を受けていますか？');

  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('住宅が被害を受けていますか？');
  expect(
    actor.getSnapshot().context['住宅が被害を受けていますか？']['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

// ---- あなた: 住宅被害の状況 ----

test('あなた(災害モード): 住宅被害の状況: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  );

  actor.send({
    type: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
    value: { type: 'Selection', selection: '全壊（損害割合50%以上）' },
  });
  expect(
    actor.getSnapshot().context[
      '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
    ]['あなた'][0]
  ).toEqual({ type: 'Selection', selection: '全壊（損害割合50%以上）' });
});

test('あなた(災害モード): 住宅被害の状況: 次の質問が「住宅再建方法」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  );

  actor.send({
    type: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
    value: { type: 'Selection', selection: '全壊（損害割合50%以上）' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('住宅再建方法');
});

test('あなた(災害モード): 住宅被害の状況: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  );

  actor.send({
    type: '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）',
    value: { type: 'Selection', selection: '大規模半壊（損害割合40%台）' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  );
  expect(
    actor.getSnapshot().context[
      '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
    ]['あなた'][0]
  ).toEqual({ type: 'Selection', selection: '大規模半壊（損害割合40%台）' });
});

// ---- あなた: 住宅再建方法 ----

test('あなた(災害モード): 住宅再建方法: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅再建方法');

  actor.send({
    type: '住宅再建方法',
    value: { type: 'Selection', selection: '建設または購入' },
  });
  expect(actor.getSnapshot().context['住宅再建方法']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '建設または購入',
  });
});

test('あなた(災害モード): 住宅再建方法: 次の質問が「家財の３分の１以上の損害が発生しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅再建方法');

  actor.send({
    type: '住宅再建方法',
    value: { type: 'Selection', selection: '補修' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家財の３分の１以上の損害が発生しましたか？'
  );
});

test('あなた(災害モード): 住宅再建方法: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '住宅再建方法');

  actor.send({
    type: '住宅再建方法',
    value: { type: 'Selection', selection: '賃借' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('住宅再建方法');
  expect(actor.getSnapshot().context['住宅再建方法']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '賃借',
  });
});

// ---- あなた: 家財の３分の１以上の損害が発生しましたか？ ----

test('あなた(災害モード): 家財の３分の１以上の損害が発生しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家財の３分の１以上の損害が発生しましたか？');

  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['家財の３分の１以上の損害が発生しましたか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('あなた(災害モード): 家財の３分の１以上の損害が発生しましたか？: 次の質問が「災害により負傷し、1ヶ月以上療養を続けていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家財の３分の１以上の損害が発生しましたか？');

  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );
});

test('あなた(災害モード): 家財の３分の１以上の損害が発生しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家財の３分の１以上の損害が発生しましたか？');

  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家財の３分の１以上の損害が発生しましたか？'
  );
  expect(
    actor.getSnapshot().context['家財の３分の１以上の損害が発生しましたか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

// ---- あなた: 災害により負傷し、1ヶ月以上療養を続けていますか？ ----

test('あなた(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害により負傷し、1ヶ月以上療養を続けていますか？');

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害により負傷し、1ヶ月以上療養を続けていますか？'
    ]['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('あなた(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 次の質問が「災害によって、精神または身体に重い障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害により負傷し、1ヶ月以上療養を続けていますか？');

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害によって、精神または身体に重い障害がありますか？'
  );
});

test('あなた(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害により負傷し、1ヶ月以上療養を続けていますか？');

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );
  expect(
    actor.getSnapshot().context[
      '災害により負傷し、1ヶ月以上療養を続けていますか？'
    ]['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

// ---- あなた: 災害によって、精神または身体に重い障害がありますか？ ----

test('あなた(災害モード): 災害によって、精神または身体に重い障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？'
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害によって、精神または身体に重い障害がありますか？'
    ]['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('あなた(災害モード): 災害によって、精神または身体に重い障害がありますか？: 次の質問が「家族に災害で亡くなった方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？'
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に災害で亡くなった方はいますか？'
  );
});

test('あなた(災害モード): 災害によって、精神または身体に重い障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？'
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '災害によって、精神または身体に重い障害がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '災害によって、精神または身体に重い障害がありますか？'
    ]['あなた'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

// ---- あなた: 家族に災害で亡くなった方はいますか？ ----

test('あなた(災害モード): 家族に災害で亡くなった方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家族に災害で亡くなった方はいますか？');

  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 2 },
  });
  expect(
    actor.getSnapshot().context['家族に災害で亡くなった方はいますか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'PersonNum', selection: 2 });
});

test('あなた(災害モード): 家族に災害で亡くなった方はいますか？: 0人 → 次の質問が「配偶者はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家族に災害で亡くなった方はいますか？');

  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
});

test('あなた(災害モード): 家族に災害で亡くなった方はいますか？: 1人以上 → 次の質問が「災害で生計維持者が亡くなりましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家族に災害で亡くなった方はいますか？');

  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害で生計維持者が亡くなりましたか？'
  );
});

test('あなた(災害モード): 家族に災害で亡くなった方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '家族に災害で亡くなった方はいますか？');

  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に災害で亡くなった方はいますか？'
  );
  expect(
    actor.getSnapshot().context['家族に災害で亡くなった方はいますか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'PersonNum', selection: 1 });
});

// ---- あなた: 災害で生計維持者が亡くなりましたか？ ----

test('あなた(災害モード): 災害で生計維持者が亡くなりましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害で生計維持者が亡くなりましたか？');

  actor.send({
    type: '災害で生計維持者が亡くなりましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['災害で生計維持者が亡くなりましたか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('あなた(災害モード): 災害で生計維持者が亡くなりましたか？: 次の質問が「配偶者はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害で生計維持者が亡くなりましたか？');

  actor.send({
    type: '災害で生計維持者が亡くなりましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
});

test('あなた(災害モード): 災害で生計維持者が亡くなりましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '災害で生計維持者が亡くなりましたか？');

  actor.send({
    type: '災害で生計維持者が亡くなりましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '災害で生計維持者が亡くなりましたか？'
  );
  expect(
    actor.getSnapshot().context['災害で生計維持者が亡くなりましたか？'][
      'あなた'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

// ============================================================
// 配偶者（災害モード）
// ============================================================

test('配偶者(災害モード): 配偶者はいますか？: yes → 次の質問が「年齢」ではなく「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  expect(actor.getSnapshot().value).toBe('被災前の年収');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '配偶者',
    index: 0,
  });
});

test('配偶者(災害モード): 被災前の年収: 次の質問が「災害により負傷し、1ヶ月以上療養を続けていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterSpouseUntil(actor, '被災前の年収');

  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 200, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '配偶者',
    index: 0,
  });
});

test('配偶者(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterSpouseUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害により負傷し、1ヶ月以上療養を続けていますか？'
    ]['配偶者'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('配偶者(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 次の質問が「災害によって、精神または身体に重い障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterSpouseUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害によって、精神または身体に重い障害がありますか？'
  );
});

test('配偶者(災害モード): 災害によって、精神または身体に重い障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterSpouseUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？'
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害によって、精神または身体に重い障害がありますか？'
    ]['配偶者'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('配偶者(災害モード): 災害によって、精神または身体に重い障害がありますか？: 次の質問が「子どもの人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterSpouseUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？'
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });
});

// ============================================================
// 子ども（災害モード）
// ============================================================

test('子ども(災害モード): 年齢: 次の質問が「高校に通っていますか？」ではなく「災害により負傷し、1ヶ月以上療養を続けていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterChildUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '子ども',
    index: 0,
  });
});

test('子ども(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterChildUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害により負傷し、1ヶ月以上療養を続けていますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 次の質問が「災害によって、精神または身体に重い障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterChildUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害によって、精神または身体に重い障害がありますか？'
  );
});

test('子ども(災害モード): 災害によって、精神または身体に重い障害がありますか？: 1人のみ → 次の質問が「親の人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterChildUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？',
    1
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('親の人数');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });
});

test('子ども(災害モード): 災害によって、精神または身体に重い障害がありますか？: 複数いる場合 → 次の子どもの年齢へ', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterChildUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？',
    2
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '子ども',
    index: 1,
  });
});

// ============================================================
// 親（災害モード）
// ============================================================

test('親(災害モード): 親の人数: 1人以上 → 次の質問が「年齢」ではなく「被災前の年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('被災前の年収');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 0,
  });
});

test('親(災害モード): 被災前の年収: 次の質問が「災害により負傷し、1ヶ月以上療養を続けていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(actor, '被災前の年収');

  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 0,
  });
});

test('親(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '災害により負傷し、1ヶ月以上療養を続けていますか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親(災害モード): 災害により負傷し、1ヶ月以上療養を続けていますか？: 次の質問が「災害によって、精神または身体に重い障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(
    actor,
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  );

  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '災害によって、精神または身体に重い障害がありますか？'
  );
});

test('親(災害モード): 災害によって、精神または身体に重い障害がありますか？: 1人のみ → 結果へ', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？',
    1
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('result');
});

test('親(災害モード): 災害によって、精神または身体に重い障害がありますか？: 複数いる場合 → 次の親の年収へ', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipDisasterParentUntil(
    actor,
    '災害によって、精神または身体に重い障害がありますか？',
    2
  );

  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('被災前の年収');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 1,
  });
});

// ============================================================
// くわしく見積もりモードのテスト
// ============================================================

test('あなた: 寝泊まりしている地域: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '寝泊まりしている地域');

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  expect(
    actor.getSnapshot().context['寝泊まりしている地域']['あなた'][0]
  ).toEqual({
    type: 'Address',
    prefecure: '東京都',
    municipality: '渋谷区',
  });
});

test('あなた: 寝泊まりしている地域: 次の質問が「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '寝泊まりしている地域');

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 寝泊まりしている地域: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '寝泊まりしている地域');

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('寝泊まりしている地域');
  expect(
    actor.getSnapshot().context['寝泊まりしている地域']['あなた'][0]
  ).toEqual({
    type: 'Address',
    prefecure: '東京都',
    municipality: '渋谷区',
  });
});

test('あなた: 年齢: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  expect(actor.getSnapshot().context['年齢']['あなた'][0]).toEqual({
    type: 'Age',
    selection: 20,
  });
});

test('あなた: 年齢: 次の質問が「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年収');
});

test('あなた: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context['年齢']['あなた'][0]).toEqual({
    type: 'Age',
    selection: 20,
  });
});

test('あなた: 年収: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  expect(actor.getSnapshot().context['年収']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 年収: 次の質問が「預貯金」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('預貯金');
});

test('あなた: 年収: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年収');
  expect(actor.getSnapshot().context['年収']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 預貯金: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  expect(actor.getSnapshot().context['預貯金']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 預貯金: 次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
});

test('あなた: 預貯金: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('預貯金');
  expect(actor.getSnapshot().context['預貯金']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 現在仕事をしていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 現在仕事をしていますか？: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('あなた: 現在仕事をしていますか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 現在仕事をしていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 仕事: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  expect(actor.getSnapshot().context['仕事']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('あなた: 仕事: 次の質問が「6か月以内に新しい仕事を始めましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
});

test('あなた: 仕事: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('仕事');
  expect(actor.getSnapshot().context['仕事']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: 次の質問が「休職中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['休職中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中ですか？: 次の質問が「休職中に給与の支払いがない状態ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
});

test('あなた: 休職中ですか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 休職中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
  expect(actor.getSnapshot().context['休職中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中に給与の支払いがない状態ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中に給与の支払いがない状態ですか？: 次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 休職中に給与の支払いがない状態ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 病気やけが、障害はありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('あなた: 病気やけが、障害はありますか？: 次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', 'けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: 1つも選ばれていない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 病気やけが、障害はありますか？: 「障害がある」のみ選ばれている場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 病気やけが、障害はありますか？: 「病気がある」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: 「けがをしている」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('あなた: 業務によって病気やけがをしましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 業務によって病気やけがをしましたか？: 次の質問が「病気やけがによって連続3日以上休業していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
});

test('あなた: 業務によって病気やけがをしましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: 次の質問が「入院中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 入院中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['入院中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 入院中ですか？: 次の質問が「在宅療養中（結核、または治療に3か月以上かかるもの）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
});

test('あなた: 入院中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
  expect(actor.getSnapshot().context['入院中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 次の質問が「感染症にかかっていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」を選択せず「障害がある」を選択した場合次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」も「障害がある」も選択しなかったた場合次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 感染症にかかっていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 感染症にかかっていますか？: 次の質問が「HIVに感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
});

test('あなた: 感染症にかかっていますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: 感染症にかかっていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: HIVに感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: HIVに感染していますか？: 次の質問が「エイズを発症していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
});

test('あなた: HIVに感染していますか？: falseの場合次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('あなた: HIVに感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: エイズを発症していますか？: 次の質問が「家族に血液製剤によってHIVに感染した方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
});

test('あなた: エイズを発症していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: エイズを発症していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: 次の質問が「血液製剤の投与によってHIVに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: 次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: C型肝炎に感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: C型肝炎に感染していますか？: 次の質問が「血液製剤の投与によってC型肝炎ウイルスに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
});

test('あなた: C型肝炎に感染していますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: C型肝炎に感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 次の質問が「肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['腎不全ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 腎不全ですか？: 次の質問が「慢性腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
});

test('あなた: 腎不全ですか？: falseの場合次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('あなた: 腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
  expect(actor.getSnapshot().context['腎不全ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 慢性腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 慢性腎不全ですか？: 次の質問が「人工透析を行っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
});

test('あなた: 慢性腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 人工透析を行っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 人工透析を行っていますか？: 次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('あなた: 人工透析を行っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: 次の質問が「血液凝固因子異常症のうち、当てはまるものはどれですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択している場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択していない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: {
      type: 'MultipleSelection',
      selection: [
        '第VIII因子欠乏症（血友病A）',
        'Von Willebrand（フォン・ヴィルブランド）病',
      ],
    },
  });
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [
      '第VIII因子欠乏症（血友病A）',
      'Von Willebrand（フォン・ヴィルブランド）病',
    ],
  });
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 身体障害者手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 身体障害者手帳を持っていますか？: 次の質問が「精神障害者保健福祉手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
});

test('あなた: 身体障害者手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: 次の質問が「療育手帳、または愛の手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: 次の質問が「放射線障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 放射線障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('あなた: 放射線障害がありますか？: 次の質問が「内部障害（内臓などのからだの内部の障害）がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
});

test('あなた: 放射線障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: 次の質問が「脳性まひ、または進行性筋萎縮症ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: 次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 介護施設に入所していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 介護施設に入所していますか？: 次の質問が「高校、大学、専門学校、職業訓練学校等の学生ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
});

test('あなた: 介護施設に入所していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 次の質問が「家を借りたいですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('家を借りたいですか？');
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家を借りたいですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['家を借りたいですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家を借りたいですか？: 次の質問が「妊娠中、または産後6ヵ月以内ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
});

test('あなた: 家を借りたいですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('家を借りたいですか？');
  expect(
    actor.getSnapshot().context['家を借りたいですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: 次の質問が「困りごとはありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('困りごとはありますか？');
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('あなた: 困りごとはありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  expect(
    actor.getSnapshot().context['困りごとはありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['仕事について'],
  });
});

test('あなた: 困りごとはありますか？: 次の質問が「配偶者はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
});

test('あなた: 困りごとはありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('困りごとはありますか？');
  expect(
    actor.getSnapshot().context['困りごとはありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['仕事について'],
  });
});

test('あなた: 配偶者はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['配偶者はいますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 配偶者はいますか？: 次の質問が「子どもの人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
});

test('あなた: 配偶者はいますか？: 「はい」の場合次の質問が配偶者の「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });

  // 移動前のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });

  actor.send({ type: 'next' });

  // 移動後のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '配偶者',
    index: 0,
  });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 配偶者はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
  expect(
    actor.getSnapshot().context['配偶者はいますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 配偶者はいますか？: next->backで元の世帯員に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
  expect(
    actor.getSnapshot().context['配偶者はいますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });
});

test('あなた: 子どもの人数: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  expect(actor.getSnapshot().context['子どもの人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

test('あなた: 子どもの人数: 次の質問が「親の人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('親の人数');
});

test('あなた: 子どもの人数: 子どもがいる場合、次の質問が子供の「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });

  // 移動前のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });

  actor.send({ type: 'next' });

  // 移動後のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '子ども',
    index: 0,
  });

  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 子どもの人数: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
  expect(actor.getSnapshot().context['子どもの人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

test('あなた: 子どもの人数: next->backで元の世帯員に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
  expect(actor.getSnapshot().context['子どもの人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 1,
  });
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });
});

test('あなた: 親の人数: この質問で終了', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('result');
});

test('あなた: 親の人数: 親がいる場合、次の質問が親の「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 1 },
  });

  // 移動前のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });

  actor.send({ type: 'next' });

  // 移動後のcurrentMember
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 0,
  });

  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 親の人数: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('親の人数');
  expect(actor.getSnapshot().context['親の人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

// 配偶者について

test('配偶者: 年齢: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 30 },
  });
  expect(actor.getSnapshot().context['年齢']['配偶者'][0]).toEqual({
    type: 'Age',
    selection: 30,
  });
});

test('配偶者: 年齢: 次の質問が「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 30 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年収');
});

test('配偶者: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 30 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context['年齢']['配偶者'][0]).toEqual({
    type: 'Age',
    selection: 30,
  });
});

test('配偶者: 年収: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  expect(actor.getSnapshot().context['年収']['配偶者'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('配偶者: 年収: 次の質問が「預貯金」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('預貯金');
});

test('配偶者: 年収: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年収');
  expect(actor.getSnapshot().context['年収']['配偶者'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('配偶者: 預貯金: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  expect(actor.getSnapshot().context['預貯金']['配偶者'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('配偶者: 預貯金: 次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
});

test('配偶者: 預貯金: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('預貯金');
  expect(actor.getSnapshot().context['預貯金']['配偶者'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('配偶者: 現在仕事をしていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 現在仕事をしていますか？: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('配偶者: 現在仕事をしていますか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('配偶者: 現在仕事をしていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 仕事: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  expect(actor.getSnapshot().context['仕事']['配偶者'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('配偶者: 仕事: 次の質問が「6か月以内に新しい仕事を始めましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
});

test('配偶者: 仕事: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('仕事');
  expect(actor.getSnapshot().context['仕事']['配偶者'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('配偶者: 6か月以内に新しい仕事を始めましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 6か月以内に新しい仕事を始めましたか？: 次の質問が「休職中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
});

test('配偶者: 6か月以内に新しい仕事を始めましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 休職中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['休職中ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 休職中ですか？: 次の質問が「休職中に給与の支払いがない状態ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
});

test('配偶者: 休職中ですか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('配偶者: 休職中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
  expect(actor.getSnapshot().context['休職中ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 休職中に給与の支払いがない状態ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 休職中に給与の支払いがない状態ですか？: 次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('配偶者: 休職中に給与の支払いがない状態ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 病気やけが、障害はありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('配偶者: 病気やけが、障害はありますか？: 次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', 'けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('配偶者: 病気やけが、障害はありますか？: 1つも選ばれていない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('配偶者: 病気やけが、障害はありますか？: 「障害がある」のみ選ばれている場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('配偶者: 病気やけが、障害はありますか？: 「病気がある」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('配偶者: 病気やけが、障害はありますか？: 「けがをしている」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('配偶者: 病気やけが、障害はありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('配偶者: 業務によって病気やけがをしましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('配偶者: 業務によって病気やけがをしましたか？: 次の質問が「病気やけがによって連続3日以上休業していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
});

test('配偶者: 業務によって病気やけがをしましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('配偶者: 病気やけがによって連続3日以上休業していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('配偶者: 病気やけがによって連続3日以上休業していますか？: 次の質問が「入院中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
});

test('配偶者: 病気やけがによって連続3日以上休業していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('配偶者: 入院中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['入院中ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 入院中ですか？: 次の質問が「在宅療養中（結核、または治療に3か月以上かかるもの）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
});

test('配偶者: 入院中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
  expect(actor.getSnapshot().context['入院中ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 次の質問が「感染症にかかっていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
});

test('配偶者: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」を選択せず「障害がある」を選択した場合次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('配偶者: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」も「障害がある」も選択しなかった場合次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('配偶者: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 感染症にかかっていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 感染症にかかっていますか？: 次の質問が「HIVに感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
});

test('配偶者: 感染症にかかっていますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('配偶者: 感染症にかかっていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: HIVに感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: HIVに感染していますか？: 次の質問が「エイズを発症していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
});

test('配偶者: HIVに感染していますか？: falseの場合次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('配偶者: HIVに感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: エイズを発症していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: エイズを発症していますか？: 次の質問が「家族に血液製剤によってHIVに感染した方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
});

test('配偶者: エイズを発症していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 家族に血液製剤によってHIVに感染した方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 家族に血液製剤によってHIVに感染した方はいますか？: 次の質問が「血液製剤の投与によってHIVに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
});

test('配偶者: 家族に血液製剤によってHIVに感染した方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 血液製剤の投与によってHIVに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 血液製剤の投与によってHIVに感染しましたか？: 次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('配偶者: 血液製剤の投与によってHIVに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: C型肝炎に感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: C型肝炎に感染していますか？: 次の質問が「血液製剤の投与によってC型肝炎ウイルスに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
});

test('配偶者: C型肝炎に感染していますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('配偶者: C型肝炎に感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 次の質問が「肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
});

test('配偶者: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('配偶者: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['腎不全ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 腎不全ですか？: 次の質問が「慢性腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
});

test('配偶者: 腎不全ですか？: falseの場合次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('配偶者: 腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
  expect(actor.getSnapshot().context['腎不全ですか？']['配偶者'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 慢性腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 慢性腎不全ですか？: 次の質問が「人工透析を行っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
});

test('配偶者: 慢性腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 人工透析を行っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 人工透析を行っていますか？: 次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('配偶者: 人工透析を行っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 先天性の血液凝固因子異常症（血友病等）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 先天性の血液凝固因子異常症（血友病等）ですか？: 次の質問が「血液凝固因子異常症のうち、当てはまるものはどれですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
});

test('配偶者: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択している場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('配偶者: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択していない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('配偶者: 先天性の血液凝固因子異常症（血友病等）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: {
      type: 'MultipleSelection',
      selection: [
        '第VIII因子欠乏症（血友病A）',
        'Von Willebrand（フォン・ヴィルブランド）病',
      ],
    },
  });
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [
      '第VIII因子欠乏症（血友病A）',
      'Von Willebrand（フォン・ヴィルブランド）病',
    ],
  });
});

test('配偶者: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('配偶者: 血液凝固因子異常症のうち、当てはまるものはどれですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('配偶者: 身体障害者手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 身体障害者手帳を持っていますか？: 次の質問が「精神障害者保健福祉手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
});

test('配偶者: 身体障害者手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['配偶者'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 精神障害者保健福祉手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 精神障害者保健福祉手帳を持っていますか？: 次の質問が「療育手帳、または愛の手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
});

test('配偶者: 精神障害者保健福祉手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 療育手帳、または愛の手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 療育手帳、または愛の手帳を持っていますか？: 次の質問が「放射線障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
});

test('配偶者: 療育手帳、または愛の手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('配偶者: 放射線障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['配偶者'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('配偶者: 放射線障害がありますか？: 次の質問が「内部障害（内臓などのからだの内部の障害）がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
});

test('配偶者: 放射線障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['配偶者'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('配偶者: 内部障害（内臓などのからだの内部の障害）がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 内部障害（内臓などのからだの内部の障害）がありますか？: 次の質問が「脳性まひ、または進行性筋萎縮症ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
});

test('配偶者: 内部障害（内臓などのからだの内部の障害）がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 脳性まひ、または進行性筋萎縮症ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 脳性まひ、または進行性筋萎縮症ですか？: 次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('配偶者: 脳性まひ、または進行性筋萎縮症ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 介護施設に入所していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 介護施設に入所していますか？: 次の質問が「高校、大学、専門学校、職業訓練学校等の学生ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
});

test('配偶者: 介護施設に入所していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('配偶者: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 次の質問が「妊娠中、または産後6ヵ月以内ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
});

test('配偶者: 高校、大学、専門学校、職業訓練学校等の学生ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['配偶者'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 妊娠中、または産後6ヵ月以内ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('配偶者: 妊娠中、または産後6ヵ月以内ですか？: 次の質問が「以下のいずれかに当てはまりますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('以下のいずれかに当てはまりますか？');
});

test('配偶者: 妊娠中、または産後6ヵ月以内ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('配偶者: 以下のいずれかに当てはまりますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '以下のいずれかに当てはまりますか？');

  actor.send({
    type: '以下のいずれかに当てはまりますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['以下のいずれかに当てはまりますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('配偶者: 以下のいずれかに当てはまりますか？: 次の質問が「子どもの人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '以下のいずれかに当てはまりますか？');

  actor.send({
    type: '以下のいずれかに当てはまりますか？',
    value: { type: 'Boolean', selection: true },
  });

  // 移動前
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '配偶者',
    index: 0,
  });

  actor.send({ type: 'next' });

  // 移動後
  expect(actor.getSnapshot().value).toBe('子どもの人数');
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: 'あなた',
    index: 0,
  });
});

test('配偶者: 以下のいずれかに当てはまりますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipSpouseUntil(actor, '以下のいずれかに当てはまりますか？');

  actor.send({
    type: '以下のいずれかに当てはまりますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('以下のいずれかに当てはまりますか？');
  expect(
    actor.getSnapshot().context['以下のいずれかに当てはまりますか？'][
      '配偶者'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '配偶者',
    index: 0,
  });
});

// 子どもの質問

test('子ども: 年齢: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 16 },
  });
  expect(actor.getSnapshot().context['年齢']['子ども'][0]).toEqual({
    type: 'Age',
    selection: 16,
  });
});

test('子ども: 年齢: 次の質問が「高校に通っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 16 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('高校に通っていますか？');
});

test('子ども: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 16 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context['年齢']['子ども'][0]).toEqual({
    type: 'Age',
    selection: 16,
  });
});

test('子ども: 高校に通っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '高校に通っていますか？');

  actor.send({
    type: '高校に通っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['高校に通っていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 高校に通っていますか？: YESなら次の質問が「通っている高校の種類を選んでください（1）」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '高校に通っていますか？');

  actor.send({
    type: '高校に通っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '通っている高校の種類を選んでください（1）'
  );
});

test('子ども: 高校に通っていますか？: NOなら次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '高校に通っていますか？');

  actor.send({
    type: '高校に通っていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
});

test('子ども: 高校に通っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '高校に通っていますか？');

  actor.send({
    type: '高校に通っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('高校に通っていますか？');
  expect(
    actor.getSnapshot().context['高校に通っていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 通っている高校の種類を選んでください（1）: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（1）');

  actor.send({
    type: '通っている高校の種類を選んでください（1）',
    value: { type: 'Selection', selection: '定時制課程' },
  });
  expect(
    actor.getSnapshot().context['通っている高校の種類を選んでください（1）'][
      '子ども'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '定時制課程',
  });
});

test('子ども: 通っている高校の種類を選んでください（1）: 次の質問が「通っている高校の種類を選んでください（2）」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（1）');

  actor.send({
    type: '通っている高校の種類を選んでください（1）',
    value: { type: 'Selection', selection: '全日制課程' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '通っている高校の種類を選んでください（2）'
  );
});

test('子ども: 通っている高校の種類を選んでください（1）: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（1）');

  actor.send({
    type: '通っている高校の種類を選んでください（1）',
    value: { type: 'Selection', selection: '全日制課程' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '通っている高校の種類を選んでください（1）'
  );
  expect(
    actor.getSnapshot().context['通っている高校の種類を選んでください（1）'][
      '子ども'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '全日制課程',
  });
});

test('子ども: 通っている高校の種類を選んでください（2）: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（2）');

  actor.send({
    type: '通っている高校の種類を選んでください（2）',
    value: { type: 'Selection', selection: '私立' },
  });
  expect(
    actor.getSnapshot().context['通っている高校の種類を選んでください（2）'][
      '子ども'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '私立',
  });
});

test('子ども: 通っている高校の種類を選んでください（2）: 次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（2）');

  actor.send({
    type: '通っている高校の種類を選んでください（2）',
    value: { type: 'Selection', selection: '公立' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
});

test('子ども: 通っている高校の種類を選んでください（2）: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '通っている高校の種類を選んでください（2）');

  actor.send({
    type: '通っている高校の種類を選んでください（2）',
    value: { type: 'Selection', selection: '公立' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '通っている高校の種類を選んでください（2）'
  );
  expect(
    actor.getSnapshot().context['通っている高校の種類を選んでください（2）'][
      '子ども'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '公立',
  });
});

test('子ども: 介護施設に入所していますか？: 次の質問が「親の人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('親の人数');
});

test('子ども: 介護施設に入所していますか？: 子どもが他にもいる場合次の質問が次の子どもの「親の人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '介護施設に入所していますか？', /*numOfChildren*/ 2);

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });

  // 遷移前
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '子ども',
    index: 0,
  });

  actor.send({ type: 'next' });

  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '子ども',
    index: 1,
  });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('子ども: 現在仕事をしていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 現在仕事をしていますか？: trueの場合次の質問が「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年収');
});

test('子ども: 現在仕事をしていますか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('子ども: 現在仕事をしていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 年収: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  expect(actor.getSnapshot().context['年収']['子ども'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });
});

test('子ども: 年収: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('子ども: 年収: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '現在仕事をしていますか？');
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年収');
  expect(actor.getSnapshot().context['年収']['子ども'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });
});

test('子ども: 仕事: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  expect(actor.getSnapshot().context['仕事']['子ども'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('子ども: 仕事: 次の質問が「6か月以内に新しい仕事を始めましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
});

test('子ども: 仕事: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('仕事');
  expect(actor.getSnapshot().context['仕事']['子ども'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('子ども: 6か月以内に新しい仕事を始めましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 6か月以内に新しい仕事を始めましたか？: 次の質問が「休職中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
});

test('子ども: 6か月以内に新しい仕事を始めましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 休職中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['休職中ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 休職中ですか？: 次の質問が「休職中に給与の支払いがない状態ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
});

test('子ども: 休職中ですか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('子ども: 休職中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
  expect(actor.getSnapshot().context['休職中ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 休職中に給与の支払いがない状態ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 休職中に給与の支払いがない状態ですか？: 次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('子ども: 休職中に給与の支払いがない状態ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 病気やけが、障害はありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['子ども'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('子ども: 病気やけが、障害はありますか？: 次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', 'けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('子ども: 病気やけが、障害はありますか？: 1つも選ばれていない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('子ども: 病気やけが、障害はありますか？: 「障害がある」のみ選ばれている場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('子ども: 病気やけが、障害はありますか？: 「病気がある」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('子ども: 病気やけが、障害はありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['子ども'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('子ども: 業務によって病気やけがをしましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('子ども: 業務によって病気やけがをしましたか？: 次の質問が「病気やけがによって連続3日以上休業していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
});

test('子ども: 業務によって病気やけがをしましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('子ども: 病気やけがによって連続3日以上休業していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('子ども: 病気やけがによって連続3日以上休業していますか？: 次の質問が「入院中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
});

test('子ども: 病気やけがによって連続3日以上休業していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('子ども: 入院中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['入院中ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 入院中ですか？: 次の質問が「在宅療養中（結核、または治療に3か月以上かかるもの）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
});

test('子ども: 入院中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
  expect(actor.getSnapshot().context['入院中ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 次の質問が「感染症にかかっていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
});

test('子ども: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」を選択せず「障害がある」を選択した場合次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('子ども: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」も「障害がある」も選択しなかった場合次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('子ども: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 感染症にかかっていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 感染症にかかっていますか？: 次の質問が「HIVに感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
});

test('子ども: 感染症にかかっていますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('子ども: 感染症にかかっていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: HIVに感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: HIVに感染していますか？: 次の質問が「エイズを発症していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
});

test('子ども: HIVに感染していますか？: falseの場合次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('子ども: HIVに感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: エイズを発症していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: エイズを発症していますか？: 次の質問が「家族に血液製剤によってHIVに感染した方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
});

test('子ども: エイズを発症していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 家族に血液製剤によってHIVに感染した方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('子ども: 家族に血液製剤によってHIVに感染した方はいますか？: 次の質問が「血液製剤の投与によってHIVに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
});

test('子ども: 家族に血液製剤によってHIVに感染した方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('子ども: 血液製剤の投与によってHIVに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('子ども: 血液製剤の投与によってHIVに感染しましたか？: 次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('子ども: 血液製剤の投与によってHIVに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('子ども: C型肝炎に感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: C型肝炎に感染していますか？: 次の質問が「血液製剤の投与によってC型肝炎ウイルスに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
});

test('子ども: C型肝炎に感染していますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('子ども: C型肝炎に感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 次の質問が「肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
});

test('子ども: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('子ども: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['腎不全ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 腎不全ですか？: 次の質問が「慢性腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
});

test('子ども: 腎不全ですか？: falseの場合次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('子ども: 腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
  expect(actor.getSnapshot().context['腎不全ですか？']['子ども'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 慢性腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['子ども'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 慢性腎不全ですか？: 次の質問が「人工透析を行っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
});

test('子ども: 慢性腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['子ども'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('子ども: 人工透析を行っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 人工透析を行っていますか？: 次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('子ども: 人工透析を行っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 先天性の血液凝固因子異常症（血友病等）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 先天性の血液凝固因子異常症（血友病等）ですか？: 次の質問が「血液凝固因子異常症のうち、当てはまるものはどれですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
});

test('子ども: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択している場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('子ども: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択していない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('子ども: 先天性の血液凝固因子異常症（血友病等）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: {
      type: 'MultipleSelection',
      selection: ['第VIII因子欠乏症（血友病A）'],
    },
  });
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['子ども'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['第VIII因子欠乏症（血友病A）'],
  });
});

test('子ども: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('子ども: 血液凝固因子異常症のうち、当てはまるものはどれですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['子ども'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('子ども: 身体障害者手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['子ども'][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 身体障害者手帳を持っていますか？: 次の質問が「精神障害者保健福祉手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
});

test('子ども: 身体障害者手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['子ども'][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 精神障害者保健福祉手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 精神障害者保健福祉手帳を持っていますか？: 次の質問が「療育手帳、または愛の手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
});

test('子ども: 精神障害者保健福祉手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 療育手帳、または愛の手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 療育手帳、または愛の手帳を持っていますか？: 次の質問が「放射線障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
});

test('子ども: 療育手帳、または愛の手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('子ども: 放射線障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['子ども'][0]
  ).toEqual({ type: 'Selection', selection: 'いいえ' });
});

test('子ども: 放射線障害がありますか？: 次の質問が「内部障害（内臓などのからだの内部の障害）がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
});

test('子ども: 放射線障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['子ども'][0]
  ).toEqual({ type: 'Selection', selection: 'いいえ' });
});

test('子ども: 内部障害（内臓などのからだの内部の障害）がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 内部障害（内臓などのからだの内部の障害）がありますか？: 次の質問が「脳性まひ、または進行性筋萎縮症ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
});

test('子ども: 内部障害（内臓などのからだの内部の障害）がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 脳性まひ、または進行性筋萎縮症ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 脳性まひ、または進行性筋萎縮症ですか？: 次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('子ども: 脳性まひ、または進行性筋萎縮症ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '子ども'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('子ども: 介護施設に入所していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('子ども: 介護施設に入所していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipChildUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['子ども'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

// 親の質問

test('親: 年齢: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 60 },
  });
  expect(actor.getSnapshot().context['年齢']['親'][0]).toEqual({
    type: 'Age',
    selection: 60,
  });
});

test('親: 年齢: 次の質問が「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 60 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年収');
});

test('親: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 60 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context['年齢']['親'][0]).toEqual({
    type: 'Age',
    selection: 60,
  });
});

test('親: 年収: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  expect(actor.getSnapshot().context['年収']['親'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('親: 年収: 次の質問が「預貯金」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('預貯金');
});

test('親: 年収: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年収');
  expect(actor.getSnapshot().context['年収']['親'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('親: 預貯金: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  expect(actor.getSnapshot().context['預貯金']['親'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });
});

test('親: 預貯金: 次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
});

test('親: 預貯金: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 100, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('預貯金');
  expect(actor.getSnapshot().context['預貯金']['親'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });
});

test('親: 現在仕事をしていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 現在仕事をしていますか？: trueの場合次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('親: 現在仕事をしていますか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('親: 現在仕事をしていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 仕事: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  expect(actor.getSnapshot().context['仕事']['親'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('親: 仕事: 次の質問が「6か月以内に新しい仕事を始めましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
});

test('親: 仕事: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('仕事');
  expect(actor.getSnapshot().context['仕事']['親'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('親: 6か月以内に新しい仕事を始めましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 6か月以内に新しい仕事を始めましたか？: 次の質問が「休職中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
});

test('親: 6か月以内に新しい仕事を始めましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 休職中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['休職中ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 休職中ですか？: 次の質問が「休職中に給与の支払いがない状態ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
});

test('親: 休職中ですか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('親: 休職中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
  expect(actor.getSnapshot().context['休職中ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 休職中に給与の支払いがない状態ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 休職中に給与の支払いがない状態ですか？: 次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('親: 休職中に給与の支払いがない状態ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 病気やけが、障害はありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['親'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('親: 病気やけが、障害はありますか？: 次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('親: 病気やけが、障害はありますか？: 1つも選ばれていない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('親: 病気やけが、障害はありますか？: 「障害がある」のみ選ばれている場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('親: 病気やけが、障害はありますか？: 「病気がある」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('親: 病気やけが、障害はありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['親'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('親: 業務によって病気やけがをしましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？']['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 業務によって病気やけがをしましたか？: 次の質問が「病気やけがによって連続3日以上休業していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
});

test('親: 業務によって病気やけがをしましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？']['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 病気やけがによって連続3日以上休業していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 病気やけがによって連続3日以上休業していますか？: 次の質問が「入院中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
});

test('親: 病気やけがによって連続3日以上休業していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 入院中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['入院中ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 入院中ですか？: 次の質問が「在宅療養中（結核、または治療に3か月以上かかるもの）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
});

test('親: 入院中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
  expect(actor.getSnapshot().context['入院中ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 次の質問が「感染症にかかっていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
});

test('親: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」を選択せず「障害がある」を選択した場合次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  // 障害のみ選択
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: { type: 'MultipleSelection', selection: ['障害がある'] },
  });
  actor.send({ type: 'next' });

  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('親: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」も「障害がある」も選択しなかった場合次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('親: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 感染症にかかっていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 感染症にかかっていますか？: 次の質問が「HIVに感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
});

test('親: 感染症にかかっていますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('親: 感染症にかかっていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: HIVに感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: HIVに感染していますか？: 次の質問が「エイズを発症していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
});

test('親: HIVに感染していますか？: falseの場合次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('親: HIVに感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: エイズを発症していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: エイズを発症していますか？: 次の質問が「家族に血液製剤によってHIVに感染した方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
});

test('親: エイズを発症していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 家族に血液製剤によってHIVに感染した方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: 家族に血液製剤によってHIVに感染した方はいますか？: 次の質問が「血液製剤の投与によってHIVに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
});

test('親: 家族に血液製剤によってHIVに感染した方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: 血液製剤の投与によってHIVに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: 血液製剤の投与によってHIVに感染しましたか？: 次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('親: 血液製剤の投与によってHIVに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: C型肝炎に感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: C型肝炎に感染していますか？: 次の質問が「血液製剤の投与によってC型肝炎ウイルスに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
});

test('親: C型肝炎に感染していますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('親: C型肝炎に感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 次の質問が「肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
});

test('親: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('親: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['腎不全ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 腎不全ですか？: 次の質問が「慢性腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
});

test('親: 腎不全ですか？: falseの場合次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('親: 腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
  expect(actor.getSnapshot().context['腎不全ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 慢性腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['慢性腎不全ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 慢性腎不全ですか？: 次の質問が「人工透析を行っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
});

test('親: 慢性腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
  expect(actor.getSnapshot().context['慢性腎不全ですか？']['親'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('親: 人工透析を行っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 人工透析を行っていますか？: 次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('親: 人工透析を行っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 先天性の血液凝固因子異常症（血友病等）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 先天性の血液凝固因子異常症（血友病等）ですか？: 次の質問が「血液凝固因子異常症のうち、当てはまるものはどれですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
});

test('親: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択している場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: { type: 'MultipleSelection', selection: ['障害がある'] },
  });
  actor.send({ type: 'next' });
  // 障害のみの場合は直接身体障害者手帳へ。先天性血液凝固因子異常症はスキップ
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('親: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択していない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('親: 先天性の血液凝固因子異常症（血友病等）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('親: 血液凝固因子異常症のうち、当てはまるものはどれですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['親'][0]
  ).toEqual({ type: 'MultipleSelection', selection: [] });
});

test('親: 身体障害者手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['親'][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 身体障害者手帳を持っていますか？: 次の質問が「精神障害者保健福祉手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
});

test('親: 身体障害者手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['親'][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 精神障害者保健福祉手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 精神障害者保健福祉手帳を持っていますか？: 次の質問が「療育手帳、または愛の手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
});

test('親: 精神障害者保健福祉手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 療育手帳、または愛の手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 療育手帳、または愛の手帳を持っていますか？: 次の質問が「放射線障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
});

test('親: 療育手帳、または愛の手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Selection', selection: '上記以外／持っていない' });
});

test('親: 放射線障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['親'][0]
  ).toEqual({ type: 'Selection', selection: 'いいえ' });
});

test('親: 放射線障害がありますか？: 次の質問が「内部障害（内臓などのからだの内部の障害）がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
});

test('親: 放射線障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['親'][0]
  ).toEqual({ type: 'Selection', selection: 'いいえ' });
});

test('親: 内部障害（内臓などのからだの内部の障害）がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 内部障害（内臓などのからだの内部の障害）がありますか？: 次の質問が「脳性まひ、または進行性筋萎縮症ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
});

test('親: 内部障害（内臓などのからだの内部の障害）がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 脳性まひ、または進行性筋萎縮症ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 脳性まひ、または進行性筋萎縮症ですか？: 次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('親: 脳性まひ、または進行性筋萎縮症ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      '親'
    ][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 介護施設に入所していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: 介護施設に入所していますか？: 次の質問が「高校、大学、専門学校、職業訓練学校等の学生ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
});

test('親: 介護施設に入所していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['親'][0]
  ).toEqual({ type: 'Boolean', selection: false });
});

test('親: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});

test('親: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 次の質問が「result」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('result');
});

test('親: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 親が他にもいる場合次の質問が次の親の「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(
    actor,
    '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    /*numOfParents*/ 2
  );

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });

  // 遷移前
  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 0,
  });

  actor.send({ type: 'next' });

  expect(actor.getSnapshot().context.currentMember).toEqual({
    relationship: '親',
    index: 1,
  });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('親: 高校、大学、専門学校、職業訓練学校等の学生ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipParentUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['親'][0]
  ).toEqual({ type: 'Boolean', selection: true });
});
