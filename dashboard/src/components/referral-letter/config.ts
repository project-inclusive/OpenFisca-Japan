import type {
  ReferralAnswerOption,
  ReferralAreaConfig,
  ReferralAreaId,
  ReferralQuestion,
  Urgency,
} from './types';

type AnswerSource = readonly [
  score: number | null,
  urgency: Urgency,
  label: string,
  destination?: string | null,
];

const makeQuestion = (
  id: string,
  label: string,
  sources: readonly AnswerSource[]
): ReferralQuestion => ({
  id,
  label,
  answers: sources.map<ReferralAnswerOption>(
    ([score, urgency, answerLabel, destination], index) => ({
      id: `${id}-${score === null ? `answer-${index + 1}` : `score-${score}`}`,
      label: answerLabel,
      score,
      urgency,
      destination: destination ?? null,
    })
  ),
});

const moneyAnswers: readonly AnswerSource[] = [
  [5, 'high', '生活が送れない', '役所HPから「生活保護」'],
  [
    4,
    'high',
    '家賃もしくはスマホ料金を滞納',
    '生活困窮者自立支援全国ネットワーク',
  ],
  [3, 'medium', '光熱水費を滞納した', '生活困窮者自立支援全国ネットワーク'],
  [
    2,
    'medium',
    '借金やリボ払いの返済で困っている',
    '生活困窮者自立支援全国ネットワーク',
  ],
  [
    1,
    'low',
    '毎月貯金を取り崩して生活している',
    '参考）日本ＦＰ協会ＦＰ紹介サイト',
  ],
  [0, 'none', '該当しない', '参考）日本ＦＰ協会ＦＰ紹介サイト'],
];

const physicalHealthAnswers: readonly AnswerSource[] = [
  [5, 'high', '通院が大変なため受診できていない', '社協、往診'],
  [4, 'high', 'お金の支払いが難しく受診できていない', '市町村、無料低額診療'],
  [3, 'medium', '通院が大変なため受診しない場合がある', '社協、往診'],
  [
    2,
    'medium',
    'お金の支払いが難しく受診しない場合がある',
    '市町村、無料低額診療',
  ],
  // The source Sheet has no destination for this green/low answer.
  [1, 'low', '必要な受診ができている'],
  [0, 'none', '健康'],
];

const mentalHealthAnswers: readonly AnswerSource[] = [
  [
    5,
    'high',
    '精神的に追い込まれ限界に達しているが医療機関を受診していない',
    '医療機関',
  ],
  [4, 'high', '精神的に追い込まれ、もうすぐ限界に達しそう', '医療機関'],
  [
    3,
    'medium',
    '精神的に追い込まれ、現在不安である',
    '厚生労働省「まもろうよこころ」',
  ],
  [
    2,
    'medium',
    '精神的に追い込まれ、この先が不安である',
    '厚生労働省「まもろうよこころ」',
  ],
  [
    1,
    'low',
    '精神的なケアや治療を受けており、症状は落ち着いている',
    '厚生労働省「まもろうよこころ」',
  ],
  [0, 'none', '精神的に健康である'],
];

const standardConnectionAnswers = (
  destination: string
): readonly AnswerSource[] => [
  [5, 'high', '孤立しており早急にどうにかしたい', destination],
  [4, 'high', '困りごとがあっても相談相手がいない', destination],
  [3, 'medium', 'つながりがなく困っている', destination],
  [2, 'medium', 'つながりがなく寂しい', destination],
  [1, 'low', 'つながりを増やしたい', destination],
  [0, 'none', 'つながりが十分にある'],
];

const elderlyConfig: ReferralAreaConfig = {
  id: 'elderly',
  label: '高齢分野',
  sourceTab: '高齢分野（決定版）',
  questions: [
    makeQuestion('elderly-money', 'お金', moneyAnswers),
    makeQuestion('elderly-care', '介護', [
      [
        5,
        'high',
        '家の中での行動が困難なのに制度利用をしていない（寝たきりなど）',
        '介護保険窓口（市町村）',
      ],
      [
        4,
        'high',
        '外出が困難なのに制度利用をしていない',
        '介護保険窓口（市町村）',
      ],
      [
        3,
        'medium',
        '家や外出時に介護が必要なのに制度利用をしていない',
        '介護保険窓口（市町村）',
      ],
      [
        2,
        'medium',
        '家や外出時に付き添いが必要なのに制度利用をしていない',
        '地域包括支援センター（市町村）',
      ],
      [
        1,
        'low',
        'どのような場合に制度を利用できるかわからない',
        '地域包括支援センター（市町村）',
      ],
      [0, 'none', '介護保険を利用している、介護が必要ない'],
    ]),
    makeQuestion('elderly-mobility', '移動', [
      [
        5,
        'high',
        '通院、日常的な買い物（食材等）の手段がない',
        '社協、地域包括支援センター',
      ],
      [
        4,
        'high',
        '通院、日常的な買い物（食材等）の支援者の負担が大きく継続が不安',
        '社協、地域包括支援センター',
      ],
      [
        3,
        'medium',
        '杖（歩行器）がないと外出できない',
        '社協、地域包括支援センター',
      ],
      [2, 'medium', '重いものの購入を避ける', '地域の宅配紹介'],
      [1, 'low', '今は車や自転車に乗れているが今後が不安', '地域の宅配紹介'],
      [0, 'none', '移動に不安はない'],
    ]),
    makeQuestion(
      'elderly-physical-health',
      '身体的健康',
      physicalHealthAnswers
    ),
    makeQuestion(
      'elderly-community-connection',
      '地域とのつながり',
      standardConnectionAnswers('社協')
    ),
    makeQuestion('elderly-home-cleanliness', '家の片付け', [
      [5, 'high', 'ゴミが多く歩く場所もない', '市町村、業者'],
      [4, 'high', 'ゴミで床が見えなくなっている', '市町村、業者'],
      [3, 'medium', 'ゴミがたまり始めている', '業者'],
      [2, 'medium', 'ゴミ捨てができていない', '業者'],
      [1, 'low', 'ゴミ捨てがきつい', '業者'],
      [0, 'none', '比較的きれいに片付いている'],
    ]),
    makeQuestion(
      'elderly-mental-health',
      '精神的健康（共通）',
      mentalHealthAnswers
    ),
  ],
};

const childcareConfig: ReferralAreaConfig = {
  id: 'childcare',
  label: '子育て（乳幼児）分野',
  sourceTab: '子育て（乳幼児）分野（決定版）',
  questions: [
    makeQuestion('childcare-money', 'お金', moneyAnswers),
    makeQuestion('childcare-parenting-support', '子育ての相談ができているか', [
      [
        5,
        'high',
        '子育ての悩みが大きく、すでに限界に達している',
        '児童相談所、子ども家庭庁「相談窓口」',
      ],
      [
        4,
        'high',
        '子育ての悩みが大きく、もうすぐ限界がきそう',
        '児童相談所、子ども家庭庁「相談窓口」',
      ],
      [
        3,
        'medium',
        '子育てで悩むことがあるが、頼れる人がいないことも悩みである',
        '子ども家庭庁「相談窓口」',
      ],
      [
        2,
        'medium',
        '子育てで悩むことがあるが、知り合いや専門家に相談できている',
        '子ども家庭庁「相談窓口」',
      ],
      [
        1,
        'low',
        '子育てで悩むことがあるが自分や家族で対応できている',
        '市町村サイト',
      ],
      [0, 'none', '該当なし'],
    ]),
    makeQuestion(
      'childcare-physical-health',
      '身体的健康',
      physicalHealthAnswers
    ),
    makeQuestion(
      'childcare-community-connection',
      '地域とのつながり',
      standardConnectionAnswers('社協、子育て支援センター、市町村サイト')
    ),
    makeQuestion(
      'childcare-mental-health',
      '精神的健康（共通）',
      mentalHealthAnswers
    ),
    makeQuestion('childcare-child-future', '子供の将来', [
      [5, 'medium', '将来的な教育費等の準備を考えたことがない', 'FP協会FP検索'],
      [
        4,
        'medium',
        '将来的な教育費等の準備の必要性を感じているが検討できていない',
        'FP協会FP検索',
      ],
      [3, 'low', '将来的な教育費等を検討を始めている', 'FP協会FP検索'],
      [2, 'low', '将来的な教育費等を検討が進んでいる', 'FP協会FP検索'],
      [1, 'none', '将来的な教育費等を検討ができている', 'FP協会FP検索'],
    ]),
    makeQuestion('childcare-career-plan', '自分の仕事のキャリアプラン', [
      [
        5,
        'medium',
        '将来的な働き方（キャリア形成）を考えたことがない',
        '厚労省HP、ハローワークなど',
      ],
      [
        4,
        'medium',
        '将来的な働き方（キャリア形成）を考える必要性を感じているが検討できていない',
        '厚労省HP、ハローワークなど',
      ],
      [
        3,
        'low',
        '将来的な働き方（キャリア形成）の検討を始めている',
        '厚労省HP、ハローワークなど',
      ],
      [
        2,
        'low',
        '将来的な働き方（キャリア形成）の検討が進んでいる',
        '厚労省HP、ハローワークなど',
      ],
      [1, 'none', '将来的な働き方（キャリア形成）の検討ができている'],
    ]),
  ],
};

const youngAdultConfig: ReferralAreaConfig = {
  id: 'young-adult',
  label: '若者（社会人）分野',
  sourceTab: '若者（社会人）分野 （決定版）',
  questions: [
    makeQuestion('young-adult-money', 'お金', moneyAnswers),
    makeQuestion('young-adult-work', '仕事', [
      [
        5,
        'high',
        '現在働いておらず働こうとも思えない',
        'ハローワーク、転職サイト',
      ],
      [4, 'high', '働きたいが就労先がない', 'ハローワーク、転職サイト'],
      [
        3,
        'medium',
        '正規職に就きたいがパートやアルバイトである',
        'ハローワーク、転職サイト',
      ],
      [
        2,
        'medium',
        '正規職に就きたいが契約社員や派遣社員である',
        'ハローワーク、転職サイト',
      ],
      [
        1,
        'low',
        '低賃金や休暇の少なさなど働き方に問題がある',
        'ハローワーク、転職サイト',
      ],
      [0, 'none', '該当なし'],
    ]),
    makeQuestion(
      'young-adult-physical-health',
      '身体的健康',
      physicalHealthAnswers
    ),
    makeQuestion(
      'young-adult-social-connection',
      '人とのつながり',
      standardConnectionAnswers('社協')
    ),
    makeQuestion('young-adult-housing', '家', [
      [5, 'high', '自宅がなく決まった居所がない', '居住支援、住居確保給付'],
      [
        4,
        'high',
        '自宅はないが決まった居所（友人宅やネットカフェ）がある',
        '居住支援、住居確保給付',
      ],
      [
        3,
        'medium',
        '自宅はあるが帰りたくなく帰らないことが多い',
        'MEX、厚生労働省「まもろうよこころ」',
      ],
      [
        2,
        'medium',
        '自宅はあるが帰りたくなくたまに帰っていない',
        'MEX、厚生労働省「まもろうよこころ」',
      ],
      // The source Sheet has no destination for this green/low answer.
      [1, 'low', '気が進まないが自宅に帰っている'],
      [0, 'none', '該当なし'],
    ]),
    makeQuestion(
      'young-adult-mental-health',
      '精神的健康（共通）',
      mentalHealthAnswers
    ),
    makeQuestion('young-adult-career-plan', '自分のキャリアプラン', [
      [
        5,
        'medium',
        '将来的な働き方（キャリア形成）を考えたことがない',
        '地域若者サポートステーション',
      ],
      [
        4,
        'medium',
        '将来的な働き方（キャリア形成）を考える必要性を感じているが検討できていない',
        '地域若者サポートステーション',
      ],
      [
        3,
        'low',
        '将来的な働き方（キャリア形成）の検討を始めている',
        '地域若者サポートステーション',
      ],
      [
        2,
        'low',
        '将来的な働き方（キャリア形成）の検討が進んでいる',
        '地域若者サポートステーション',
      ],
      [
        1,
        'none',
        '将来的な働き方（キャリア形成）の検討ができている',
        '地域若者サポートステーション',
      ],
      [null, 'none', '―'],
    ]),
  ],
};

/** Static snapshot of the three decision tabs read on 2026-08-11. */
export const REFERRAL_AREA_CONFIGS: readonly ReferralAreaConfig[] = [
  elderlyConfig,
  childcareConfig,
  youngAdultConfig,
];

export const REFERRAL_AREA_IDS: readonly ReferralAreaId[] = [
  'elderly',
  'childcare',
  'young-adult',
];

export const REFERRAL_AREA_CONFIG_BY_ID: Readonly<
  Record<ReferralAreaId, ReferralAreaConfig>
> = {
  elderly: elderlyConfig,
  childcare: childcareConfig,
  'young-adult': youngAdultConfig,
};

export const getReferralAreaConfig = (
  areaId: ReferralAreaId
): ReferralAreaConfig => REFERRAL_AREA_CONFIG_BY_ID[areaId];
