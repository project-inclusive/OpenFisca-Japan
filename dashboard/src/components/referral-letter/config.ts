import type {
  ReferralAreaConfig,
  ReferralAreaId,
  ReferralDestination,
  ReferralQuestion,
  Urgency,
} from './types';

// Snapshot: 修正版9.10 tabs, read on 2026-09-26. 緊急度合 新 is authoritative.
export const REFERRAL_SOURCE_URL =
  'https://docs.google.com/spreadsheets/d/18vz-WBjzISSqsO2WCSZH50GQa5X0usehd7eRmV78GJE/edit';
type AnswerSource = readonly [Urgency, string, ...ReferralDestination[]];
const destination = (
  name: string,
  url: string | null = null
): ReferralDestination => ({ name, url });
const welfare = destination('福祉事務所（市役所・役場の担当部署）');
const independence = destination(
  '自立相談支援窓口',
  'https://minna-tunagaru.jp/ichiran/'
);
const fp = destination(
  'ファイナンシャルプランナー相談サイト（日本FP協会）',
  'https://www.jafp.or.jp/confer/fpsoudan/flow/'
);
const care = destination('介護保険窓口（市役所・役場）');
const communityCare = destination('地域包括支援センター');
const socialWelfare = destination(
  '社会福祉協議会',
  'https://www.zcwvc.net/about/list.html'
);
const mentalClinic = destination('心療内科・精神科（医療機関）');
const mentalInfo = destination(
  'まもろうよこころ（厚生労働省）',
  'https://www.mhlw.go.jp/mamorouyokokoro/'
);
const childInfo = destination(
  '相談窓口（こども家庭庁）',
  'https://www.cfa.go.jp/children-inquiries'
);
const childCenter = destination(
  '児童相談所',
  'https://www.cfa.go.jp/policies/jidougyakutai/jisou-ichiran'
);
const familyCenter = destination('こども家庭センター');
const careerUrl =
  'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/shokugyounouryoku/career_formation/index.html?utm_source=chatgpt.com';
const career = destination('キャリア形成支援（厚生労働省）', careerUrl);
const workCareer = destination('キャリア形成支援', careerUrl);
const helloWork = destination(
  'ハローワーク',
  'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/hellowork.html?utm_source=chatgpt.com'
);
const housing = destination(
  'すまこま（厚生労働省）',
  'https://sumakoma.mhlw.go.jp/?utm_source=chatgpt.com'
);
const youthCenter = destination(
  '子ども・若者総合相談センター',
  'https://www.cfa.go.jp/assets/contents/node/basic_page/field_ref_resources/235d0217-bb92-4d07-838f-74897643b3a0/15f6ddea/20251015_policies_youth_kyougikai-soudancenter_16.pdf'
);

const makeQuestion = (
  id: string,
  label: string,
  sources: readonly AnswerSource[]
): ReferralQuestion => ({
  id,
  label,
  answers: sources.map(([urgency, answerLabel, ...destinations], index) => ({
    id: `${id}-answer-${index + 1}`,
    label: answerLabel,
    urgency,
    destinations,
  })),
});
const money: readonly AnswerSource[] = [
  ['high', '生活が送れない', welfare],
  ['high', '家賃もしくはスマホ料金を滞納', independence],
  ['medium', '光熱水費を滞納した', independence],
  ['medium', '借金やリボ払いの返済で困っている', independence],
  ['low', '毎月貯金を取り崩して生活している', fp],
  ['none', '該当しない'],
];
const physical: readonly AnswerSource[] = [
  ['high', '通院が大変なため受診できていない', socialWelfare],
  ['high', 'お金の支払いが難しく受診できていない', independence, welfare],
  ['medium', '通院が大変なため受診しない場合がある', socialWelfare],
  ['medium', 'お金の支払いが難しく受診しない場合がある', independence],
  ['none', '必要な受診ができている'],
  ['none', '健康'],
];
const mental: readonly AnswerSource[] = [
  [
    'high',
    '精神的に追い込まれ限界に達しているが医療機関を受診していない',
    mentalClinic,
  ],
  ['high', '精神的に追い込まれ、もうすぐ限界に達しそう', mentalClinic],
  ['medium', '精神的に追い込まれ、現在不安である', mentalInfo],
  ['medium', '精神的に追い込まれ、この先が不安である', mentalInfo],
  ['none', '精神的なケアや治療を受けており、症状は落ち着いている'],
  ['none', '精神的に健康である'],
];
const connections = (
  ...destinations: ReferralDestination[]
): readonly AnswerSource[] => [
  ['high', '孤立しており早急にどうにかしたい', ...destinations],
  ['high', '困りごとがあっても相談相手がいない', ...destinations],
  ['medium', 'つながりがなく困っている', ...destinations],
  ['medium', 'つながりがなく寂しい', ...destinations],
  ['none', 'つながりがある'],
  ['none', 'つながりが十分にある'],
];
const careerPlan: readonly AnswerSource[] = [
  ['medium', '将来的な働き方（キャリア形成）を考えたことがない', career],
  [
    'medium',
    '将来的な働き方（キャリア形成）を考える必要性を感じているが検討できていない',
    career,
  ],
  ['low', '将来的な働き方（キャリア形成）の検討を始めている', career],
  ['none', '将来的な働き方（キャリア形成）の検討が進んでいる'],
  ['none', '将来的な働き方（キャリア形成）の検討ができている'],
  ['none', '将来的な働き方（キャリア形成）を考える必要がない'],
];
export const REFERRAL_AREA_CONFIGS: readonly ReferralAreaConfig[] = [
  {
    id: 'elderly',
    label: '高齢分野',
    sourceTab: '高齢分野（修正版9.10） ',
    questions: [
      makeQuestion('elderly-money', 'お金', money),
      makeQuestion('elderly-care', '介護', [
        [
          'high',
          '家の中での行動が困難なのに制度利用をしていない（寝たきりなど）',
          care,
        ],
        ['high', '外出が困難なのに制度利用をしていない', care],
        ['medium', '家や外出時に介護が必要なのに制度利用をしていない', care],
        [
          'medium',
          '家や外出時に付き添いが必要なのに制度利用をしていない',
          communityCare,
        ],
        ['low', 'どのような場合に制度を利用できるかわからない', communityCare],
        ['none', '介護保険を利用している、介護が必要ない'],
      ]),
      makeQuestion('elderly-mobility', '移動', [
        [
          'high',
          '通院、日常的な買い物（食材等）の手段がない',
          communityCare,
          socialWelfare,
        ],
        [
          'high',
          '通院、日常的な買い物（食材等）の支援者の負担が大きく継続が不安',
          communityCare,
          socialWelfare,
        ],
        [
          'medium',
          '杖（歩行器）がないと外出できない',
          communityCare,
          socialWelfare,
        ],
        ['medium', '重いものの購入を避ける', communityCare],
        ['low', '今は車や自転車に乗れているが今後が不安', communityCare],
        ['none', '移動に不安はない'],
      ]),
      makeQuestion('elderly-physical-health', '身体的健康', physical),
      makeQuestion(
        'elderly-community',
        '地域とのつながり',
        connections(socialWelfare)
      ),
      makeQuestion('elderly-home-cleanliness', '家の片付け', [
        ['high', 'ゴミが多く歩く場所もない', communityCare],
        ['high', 'ゴミで床が見えなくなっている', communityCare],
        ['medium', 'ゴミがたまり始めている', communityCare],
        ['medium', 'ゴミ捨てができていない', communityCare],
        ['low', 'ゴミ捨てがきつい', communityCare],
        ['none', '比較的きれいに片付いている'],
      ]),
      makeQuestion('elderly-mental-health', '精神的健康（共通）', mental),
    ],
  },
  {
    id: 'childcare',
    label: '子育て（乳幼児）分野',
    sourceTab: '子育て（乳幼児）分野（修正版9.10）',
    questions: [
      makeQuestion('childcare-money', 'お金', money),
      makeQuestion('childcare-parenting-support', '子育ての悩み', [
        [
          'high',
          '子育ての悩みが大きく、すでに限界に達している',
          childInfo,
          childCenter,
        ],
        [
          'high',
          '子育ての悩みが大きく、もうすぐ限界がきそう',
          childInfo,
          childCenter,
        ],
        [
          'medium',
          '子育てで悩むことがあるが、頼れる人がいないことも悩みである',
          childInfo,
        ],
        [
          'low',
          '子育てで悩むことがあるが、知り合いや専門家に相談できている',
          childInfo,
        ],
        [
          'low',
          '子育てで悩むことがあるが自分や家族で対応できている',
          childInfo,
        ],
        ['none', '該当なし'],
      ]),
      makeQuestion('childcare-physical-health', '身体的健康', physical),
      makeQuestion(
        'childcare-community',
        '地域とのつながり',
        connections(familyCenter, socialWelfare)
      ),
      makeQuestion('childcare-mental-health', '精神的健康（共通）', mental),
      makeQuestion('childcare-child-future', '子供の将来', [
        ['medium', '将来的な教育費等の準備を考えたことがない', fp],
        [
          'medium',
          '将来的な教育費等の準備の必要性を感じているが検討できていない',
          fp,
        ],
        ['low', '将来的な教育費等の検討を始めている', fp],
        ['none', '将来的な教育費等の検討が進んでいる'],
        ['none', '将来的な教育費等の検討ができている'],
        ['none', '将来的な教育費等の準備が済んでいる'],
      ]),
      makeQuestion(
        'childcare-career-plan',
        '自分の仕事のキャリアプラン',
        careerPlan
      ),
    ],
  },
  {
    id: 'young-adult',
    label: '若者（社会人）分野',
    sourceTab: '若者（社会人）分野 （修正版9.10）',
    questions: [
      makeQuestion('young-adult-money', 'お金', money),
      makeQuestion('young-adult-work', '仕事', [
        ['high', '現在働いておらず働こうとも思えない', helloWork, workCareer],
        ['high', '働きたいが就労先がない', helloWork, workCareer],
        [
          'medium',
          '正規職に就きたいがパートやアルバイトである',
          helloWork,
          workCareer,
        ],
        [
          'medium',
          '正規職に就きたいが契約社員や派遣社員である',
          helloWork,
          workCareer,
        ],
        [
          'low',
          '低賃金や休暇の少なさなど働き方に問題がある',
          helloWork,
          workCareer,
        ],
        ['none', '該当なし'],
      ]),
      makeQuestion('young-adult-physical-health', '身体的健康', physical),
      makeQuestion(
        'young-adult-community',
        '人とのつながり',
        connections(socialWelfare)
      ),
      makeQuestion('young-adult-housing', '家', [
        ['high', '自宅がなく決まった居所がない', independence, housing],
        [
          'high',
          '自宅はないが決まった居所（友人宅やネットカフェ）がある',
          independence,
          housing,
        ],
        ['medium', '自宅はあるが帰りたくなく帰らないことが多い', youthCenter],
        ['medium', '自宅はあるが帰りたくなくたまに帰っていない', youthCenter],
        ['low', '気が進まないが自宅に帰っている', youthCenter],
        ['none', '該当なし'],
      ]),
      makeQuestion('young-adult-mental-health', '精神的健康（共通）', mental),
      makeQuestion(
        'young-adult-career-plan',
        '自分のキャリアプラン',
        careerPlan
      ),
    ],
  },
];
export const REFERRAL_AREA_IDS = REFERRAL_AREA_CONFIGS.map((area) => area.id);

export const getReferralAreaConfig = (
  id: ReferralAreaId
): ReferralAreaConfig => {
  const area = REFERRAL_AREA_CONFIGS.find((config) => config.id === id);
  if (!area) throw new Error(`Unknown referral area: ${id}`);
  return area;
};
