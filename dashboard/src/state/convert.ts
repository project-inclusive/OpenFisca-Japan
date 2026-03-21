import { HouseholdRelationship } from './household';
import { questionKeys } from './questionDefinition';
import { QuestionStateContext } from './questionState';

type OpenFiscaField<T> = {
  [K in string]: T;
};

type OpenFiscaMember = {
  [key: string]: OpenFiscaField<any>;
};

export type OpenFiscaHousehold = {
  世帯員: {
    [name: string]: OpenFiscaMember;
  };
  世帯一覧: {
    世帯1: {
      親一覧: HouseholdRelationship[];
      居住都道府県: OpenFiscaField<string>;
      居住市区町村: OpenFiscaField<string>;

      // バックエンド側で計算されるVariable
      児童手当: OpenFiscaField<any>;
      児童扶養手当_最大: OpenFiscaField<any>;
      児童扶養手当_最小: OpenFiscaField<any>;
      特別児童扶養手当_最小: OpenFiscaField<any>;
      特別児童扶養手当_最大: OpenFiscaField<any>;
      生活保護: OpenFiscaField<any>;
      障害児福祉手当: OpenFiscaField<any>;
      高等学校奨学給付金_最小: OpenFiscaField<any>;
      高等学校奨学給付金_最大: OpenFiscaField<any>;
      生活支援費: OpenFiscaField<any>;
      一時生活再建費: OpenFiscaField<any>;
      福祉費: OpenFiscaField<any>;
      緊急小口資金: OpenFiscaField<any>;
      教育支援費: OpenFiscaField<any>;
      就学支度費: OpenFiscaField<any>;
      不動産担保型生活資金: OpenFiscaField<any>;
      災害弔慰金: OpenFiscaField<any>;
      災害障害見舞金_最大: OpenFiscaField<any>;
      災害障害見舞金_最小: OpenFiscaField<any>;
      被災者生活再建支援制度: OpenFiscaField<any>;
      災害援護資金: OpenFiscaField<any>;
      高等学校等就学支援金_最大: OpenFiscaField<any>;
      高等学校等就学支援金_最小: OpenFiscaField<any>;
      健康管理費用_最大: OpenFiscaField<any>;
      健康管理費用_最小: OpenFiscaField<any>;
      健康管理支援事業_最大: OpenFiscaField<any>;
      健康管理支援事業_最小: OpenFiscaField<any>;
      先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大: OpenFiscaField<any>;
      先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小: OpenFiscaField<any>;
      障害基礎年金_最大: OpenFiscaField<any>;
      障害基礎年金_最小: OpenFiscaField<any>;
      特別障害者手当_最大: OpenFiscaField<any>;
      特別障害者手当_最小: OpenFiscaField<any>;
      特定疾病療養の対象者がいる: OpenFiscaField<any>;
      先天性血液凝固因子障害等治療研究事業の対象者がいる: OpenFiscaField<any>;
      重度心身障害者医療費助成制度の対象者がいる: OpenFiscaField<any>;
      傷病手当金_最大: OpenFiscaField<any>;
      傷病手当金_最小: OpenFiscaField<any>;
      児童育成手当?: OpenFiscaField<any>;
      障害児童育成手当?: OpenFiscaField<any>;
      重度心身障害者手当_最小?: OpenFiscaField<any>;
      重度心身障害者手当_最大?: OpenFiscaField<any>;
      受験生チャレンジ支援貸付?: OpenFiscaField<any>;
      住宅入居費?: OpenFiscaField<any>;
      配偶者がいるがひとり親に該当?: OpenFiscaField<any>;
    };
  };
};

export const toOpenFiscaHousehold = ({
  context,
  currentDate,
}: {
  context: QuestionStateContext;
  currentDate: string;
}): OpenFiscaHousehold => {
  // あなた の世帯員情報を構築
  const selfMember: OpenFiscaMember = {};

  // 年齢 → 誕生年月日（生まれ年は currentDate の年から年齢を引いた値で近似）
  const selfAge = context.年齢.あなた[0].selection;
  if (selfAge != null) {
    const birthYear = parseInt(currentDate.substring(0, 4)) - selfAge;
    selfMember.誕生年月日 = { ETERNITY: `${birthYear}-01-01` };
  }

  // 年収・預貯金（万円 → 円）
  const unit = 10000;
  // HACK: 将来unitの種類が増えた際コンパイルエラーで気づけるようチェック
  const _: '万円' = context.年収.あなた[0].unit;

  const selfIncome = context.年収.あなた[0].selection;
  if (selfIncome != null) {
    selfMember.収入 = { [currentDate]: selfIncome * unit };
  }
  const selfDeposit = context['預貯金'].あなた[0].selection;
  if (selfDeposit != null) {
    selfMember.預貯金 = { [currentDate]: selfDeposit * unit };
  }

  // 仕事の種類
  const selfOccupation = context['仕事'].あなた[0].selection;
  if (selfOccupation != null) {
    selfMember.就労形態 = { [currentDate]: selfOccupation };
  }

  // 新しい仕事
  const selfNewJob =
    context['6か月以内に新しい仕事を始めましたか？'].あなた[0].selection;
  if (selfNewJob != null) {
    selfMember.六か月以内に新規就労 = { [currentDate]: selfNewJob };
  }

  // 休業中の給与の支払い
  const selfLeaveWithoutPay =
    context['休職中に給与の支払いがない状態ですか？'].あなた[0].selection;
  if (selfLeaveWithoutPay != null) {
    selfMember.休業中に給与の支払いがない = {
      [currentDate]: selfLeaveWithoutPay,
    };
  }

  // 業務による病気・けが（MultipleSelection → 各フィールドを true/false で設定）
  const selfIndustrialAccident =
    context['業務によって病気やけがをしましたか？'].あなた[0].selection;
  selfMember.業務によって病気になった = {
    [currentDate]: selfIndustrialAccident.includes('業務によって病気になった'),
  };
  selfMember.業務によってけがをした = {
    [currentDate]: selfIndustrialAccident.includes('業務によってけがをした'),
  };

  // 病気・けがによる3日以上休業
  const selfLeaveByAccident =
    context['病気やけがによって連続3日以上休業していますか？'].あなた[0]
      .selection;
  selfMember.病気によって連続三日以上休業している = {
    [currentDate]:
      selfLeaveByAccident.includes('病気によって連続三日以上休業している'),
  };
  selfMember.けがによって連続三日以上休業している = {
    [currentDate]:
      selfLeaveByAccident.includes('けがによって連続三日以上休業している'),
  };

  // 入院中・在宅療養中
  const selfHospitalized = context['入院中ですか？'].あなた[0].selection;
  if (selfHospitalized != null) {
    selfMember.入院中 = { [currentDate]: selfHospitalized };
  }
  const selfHomeRecuperation =
    context['在宅療養中（結核、または治療に3か月以上かかるもの）ですか？']
      .あなた[0].selection;
  if (selfHomeRecuperation != null) {
    selfMember.在宅療養中 = { [currentDate]: selfHomeRecuperation };
  }

  // HIV・エイズ関連（スキップされた場合もデフォルトfalseで設定）
  const selfHIV = context['HIVに感染していますか？'].あなた[0].selection;
  selfMember.HIV感染者である = { [currentDate]: selfHIV ?? false };
  const selfAIDS = context['エイズを発症していますか？'].あなた[0].selection;
  if (selfAIDS != null) {
    selfMember.エイズを発症している = { [currentDate]: selfAIDS };
  }
  const selfFamilyHIV =
    context['家族に血液製剤によってHIVに感染した方はいますか？'].あなた[0]
      .selection;
  if (selfFamilyHIV != null) {
    selfMember.家族に血液製剤によるHIV感染者がいる = {
      [currentDate]: selfFamilyHIV,
    };
  }
  const selfHIVByBlood =
    context['血液製剤の投与によってHIVに感染しましたか？'].あなた[0].selection;
  if (selfHIVByBlood != null) {
    selfMember.血液製剤の投与によってHIVに感染した = {
      [currentDate]: selfHIVByBlood,
    };
  }

  // C型肝炎関連
  const selfHepCByBlood =
    context['血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'].あなた[0]
      .selection;
  if (selfHepCByBlood != null) {
    selfMember.血液製剤の投与によってC型肝炎ウイルスに感染した = {
      [currentDate]: selfHepCByBlood,
    };
  }
  const selfCirrhosis =
    context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ].あなた[0].selection;
  if (selfCirrhosis != null) {
    selfMember.肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
      [currentDate]: selfCirrhosis,
    };
  }

  // 腎不全関連
  const selfChronicRenalFailure =
    context['慢性腎不全ですか？'].あなた[0].selection;
  if (selfChronicRenalFailure != null) {
    selfMember.慢性腎不全である = { [currentDate]: selfChronicRenalFailure };
  }
  const selfDialysis =
    context['人工透析を行っていますか？'].あなた[0].selection;
  if (selfDialysis != null) {
    selfMember.人工透析を行っている = { [currentDate]: selfDialysis };
  }

  // 血液凝固因子異常症（MultipleSelection → 各因子フィールド）
  const hemophiliaFieldMap: Record<string, string> = {
    '第I因子（フィブリノゲン）欠乏症': '血液凝固因子異常症_第I因子欠乏症',
    '第II因子（プロトロンビン）欠乏症': '血液凝固因子異常症_第II因子欠乏症',
    '第V因子（不安定因子）欠乏症': '血液凝固因子異常症_第V因子欠乏症',
    '第VII因子（安定因子）欠乏症': '血液凝固因子異常症_第VII因子欠乏症',
    '第VIII因子欠乏症（血友病A）': '血液凝固因子異常症_第VIII因子欠乏症',
    '第IX因子欠乏症（血友病B）': '血液凝固因子異常症_第IX因子欠乏症',
    '第X因子（スチュアートプラウア）欠乏症': '血液凝固因子異常症_第X因子欠乏症',
    '第XI因子（PTA）欠乏症': '血液凝固因子異常症_第XI因子欠乏症',
    '第XII因子（ヘイグマン因子）欠乏症': '血液凝固因子異常症_第XII因子欠乏症',
    '第XIII因子（フィブリン安定化因子）欠乏症':
      '血液凝固因子異常症_第XIII因子欠乏症',
    'Von Willebrand（フォン・ヴィルブランド）病':
      '血液凝固因子異常症_フォンヴィルブランド病',
    'わからない・その他': '血液凝固因子異常症_その他',
  };
  const selfHemophilia = context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection as string[];
  Object.entries(hemophiliaFieldMap).forEach(([display, field]) => {
    selfMember[field] = { [currentDate]: selfHemophilia.includes(display) };
  });

  // 身体障害者手帳等級（display → API値）
  const physicalDisabilityGradeMap: Record<string, string> = {
    '1級': '一級',
    '2級': '二級',
    '3級': '三級',
    '上記以外／持っていない': '無',
  };
  const selfPhysicalDisability =
    context['身体障害者手帳を持っていますか？'].あなた[0].selection;
  if (selfPhysicalDisability != null) {
    selfMember.身体障害者手帳等級 = {
      [currentDate]: physicalDisabilityGradeMap[selfPhysicalDisability] ?? '無',
    };
  }

  // 精神障害者手帳等級
  const selfMentalDisability =
    context['精神障害者保健福祉手帳を持っていますか？'].あなた[0].selection;
  if (selfMentalDisability != null) {
    selfMember.精神障害者保健福祉手帳等級 = {
      [currentDate]: physicalDisabilityGradeMap[selfMentalDisability] ?? '無',
    };
  }

  // 療育手帳・愛の手帳
  const selfIntellectualDisability =
    context['療育手帳、または愛の手帳を持っていますか？'].あなた[0].selection;
  if (selfIntellectualDisability != null) {
    const intellectualMap: Record<string, { field: string; value: string }> = {
      '療育手帳 A': { field: '療育手帳等級', value: 'A' },
      '療育手帳 B': { field: '療育手帳等級', value: 'B' },
      '愛の手帳 1度': { field: '愛の手帳等級', value: '一度' },
      '愛の手帳 2度': { field: '愛の手帳等級', value: '二度' },
      '愛の手帳 3度': { field: '愛の手帳等級', value: '三度' },
      '愛の手帳 4度': { field: '愛の手帳等級', value: '四度' },
    };
    const mapped = intellectualMap[selfIntellectualDisability];
    if (mapped) {
      selfMember[mapped.field] = { [currentDate]: mapped.value };
    }
  }

  // 放射線障害（'いいえ' → '無'）
  const selfRadiation = context['放射線障害がありますか？'].あなた[0].selection;
  if (selfRadiation != null) {
    selfMember.放射線障害 = {
      [currentDate]: selfRadiation === 'いいえ' ? '無' : selfRadiation,
    };
  }

  // 内部障害・脳性まひ（bool → '有'/'無'）
  const selfInternalDisability =
    context['内部障害（内臓などのからだの内部の障害）がありますか？'].あなた[0]
      .selection;
  if (selfInternalDisability != null) {
    selfMember.内部障害 = {
      [currentDate]: selfInternalDisability ? '有' : '無',
    };
  }
  const selfCerebralParalysis =
    context['脳性まひ、または進行性筋萎縮症ですか？'].あなた[0].selection;
  if (selfCerebralParalysis != null) {
    selfMember.脳性まひ_進行性筋萎縮症 = {
      [currentDate]: selfCerebralParalysis ? '有' : '無',
    };
  }

  // 介護施設・学生
  const selfNursingHome =
    context['介護施設に入所していますか？'].あなた[0].selection;
  if (selfNursingHome != null) {
    selfMember.介護施設入所中 = { [currentDate]: selfNursingHome };
  }
  const selfStudent =
    context['高校、大学、専門学校、職業訓練学校等の学生ですか？'].あなた[0]
      .selection;
  if (selfStudent != null) {
    selfMember.学生 = { [currentDate]: selfStudent };
  }

  // 妊娠（'いいえ' → '無'）
  const selfPregnancy =
    context['妊娠中、または産後6ヵ月以内ですか？'].あなた[0].selection;
  if (selfPregnancy != null) {
    selfMember.妊産婦 = {
      [currentDate]: selfPregnancy === 'いいえ' ? '無' : selfPregnancy,
    };
  }

  // 配偶者の世帯員情報を構築
  const hasSpouse = context['配偶者はいますか？'].あなた[0].selection === true;
  const spouseMember: OpenFiscaMember = {};

  if (hasSpouse) {
    // 年齢（配偶者は誕生年月日ではなく年齢をそのまま設定）
    const spouseAge = context['年齢'].配偶者[0]?.selection;
    if (spouseAge != null) {
      spouseMember.年齢 = { [currentDate]: spouseAge };
    }

    // 年収・預貯金
    const spouseIncome = context['年収'].配偶者[0]?.selection;
    if (spouseIncome != null) {
      spouseMember.収入 = { [currentDate]: spouseIncome * unit };
    }
    const spouseDeposit = context['預貯金'].配偶者[0]?.selection;
    if (spouseDeposit != null) {
      spouseMember.預貯金 = { [currentDate]: spouseDeposit * unit };
    }

    // 仕事の種類
    const spouseOccupation = context['仕事'].配偶者[0]?.selection;
    if (spouseOccupation != null) {
      spouseMember.就労形態 = { [currentDate]: spouseOccupation };
    }

    // 新しい仕事
    const spouseNewJob =
      context['6か月以内に新しい仕事を始めましたか？'].配偶者[0]?.selection;
    if (spouseNewJob != null) {
      spouseMember.六か月以内に新規就労 = { [currentDate]: spouseNewJob };
    }

    // 休業中の給与の支払い
    const spouseLeaveWithoutPay =
      context['休職中に給与の支払いがない状態ですか？'].配偶者[0]?.selection;
    if (spouseLeaveWithoutPay != null) {
      spouseMember.休業中に給与の支払いがない = {
        [currentDate]: spouseLeaveWithoutPay,
      };
    }

    // 業務による病気・けが
    const spouseIndustrialAccident = (context[
      '業務によって病気やけがをしましたか？'
    ].配偶者[0]?.selection ?? []) as string[];
    spouseMember.業務によって病気になった = {
      [currentDate]:
        spouseIndustrialAccident.includes('業務によって病気になった'),
    };
    spouseMember.業務によってけがをした = {
      [currentDate]:
        spouseIndustrialAccident.includes('業務によってけがをした'),
    };

    // 病気・けがによる3日以上休業
    const spouseLeaveByAccident = (context[
      '病気やけがによって連続3日以上休業していますか？'
    ].配偶者[0]?.selection ?? []) as string[];
    spouseMember.病気によって連続三日以上休業している = {
      [currentDate]:
        spouseLeaveByAccident.includes('病気によって連続三日以上休業している'),
    };
    spouseMember.けがによって連続三日以上休業している = {
      [currentDate]:
        spouseLeaveByAccident.includes('けがによって連続三日以上休業している'),
    };

    // 入院中・在宅療養中
    const spouseHospitalized = context['入院中ですか？'].配偶者[0]?.selection;
    if (spouseHospitalized != null) {
      spouseMember.入院中 = { [currentDate]: spouseHospitalized };
    }
    const spouseHomeRecuperation =
      context['在宅療養中（結核、または治療に3か月以上かかるもの）ですか？']
        .配偶者[0]?.selection;
    if (spouseHomeRecuperation != null) {
      spouseMember.在宅療養中 = { [currentDate]: spouseHomeRecuperation };
    }

    // HIV・エイズ関連
    const spouseHIV = context['HIVに感染していますか？'].配偶者[0]?.selection;
    spouseMember.HIV感染者である = { [currentDate]: spouseHIV ?? false };
    const spouseAIDS =
      context['エイズを発症していますか？'].配偶者[0]?.selection;
    if (spouseAIDS != null) {
      spouseMember.エイズを発症している = { [currentDate]: spouseAIDS };
    }
    const spouseFamilyHIV =
      context['家族に血液製剤によってHIVに感染した方はいますか？'].配偶者[0]
        ?.selection;
    if (spouseFamilyHIV != null) {
      spouseMember.家族に血液製剤によるHIV感染者がいる = {
        [currentDate]: spouseFamilyHIV,
      };
    }
    const spouseHIVByBlood =
      context['血液製剤の投与によってHIVに感染しましたか？'].配偶者[0]
        ?.selection;
    if (spouseHIVByBlood != null) {
      spouseMember.血液製剤の投与によってHIVに感染した = {
        [currentDate]: spouseHIVByBlood,
      };
    }

    // C型肝炎関連
    const spouseHepCByBlood =
      context['血液製剤の投与によってC型肝炎ウイルスに感染しましたか？']
        .配偶者[0]?.selection;
    if (spouseHepCByBlood != null) {
      spouseMember.血液製剤の投与によってC型肝炎ウイルスに感染した = {
        [currentDate]: spouseHepCByBlood,
      };
    }
    const spouseCirrhosis =
      context[
        '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
      ].配偶者[0]?.selection;
    if (spouseCirrhosis != null) {
      spouseMember.肝硬変や肝がんに罹患しているまたは肝移植をおこなった = {
        [currentDate]: spouseCirrhosis,
      };
    }

    // 腎不全関連
    const spouseChronicRenalFailure =
      context['慢性腎不全ですか？'].配偶者[0]?.selection;
    if (spouseChronicRenalFailure != null) {
      spouseMember.慢性腎不全である = {
        [currentDate]: spouseChronicRenalFailure,
      };
    }
    const spouseDialysis =
      context['人工透析を行っていますか？'].配偶者[0]?.selection;
    if (spouseDialysis != null) {
      spouseMember.人工透析を行っている = { [currentDate]: spouseDialysis };
    }

    // 血液凝固因子異常症
    const spouseHemophilia = (context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ].配偶者[0]?.selection ?? []) as string[];
    Object.entries(hemophiliaFieldMap).forEach(([display, field]) => {
      spouseMember[field] = {
        [currentDate]: spouseHemophilia.includes(display),
      };
    });

    // 身体障害者手帳等級
    const spousePhysicalDisability =
      context['身体障害者手帳を持っていますか？'].配偶者[0]?.selection;
    if (spousePhysicalDisability != null) {
      spouseMember.身体障害者手帳等級 = {
        [currentDate]:
          physicalDisabilityGradeMap[spousePhysicalDisability] ?? '無',
      };
    }

    // 精神障害者手帳等級
    const spouseMentalDisability =
      context['精神障害者保健福祉手帳を持っていますか？'].配偶者[0]?.selection;
    if (spouseMentalDisability != null) {
      spouseMember.精神障害者保健福祉手帳等級 = {
        [currentDate]:
          physicalDisabilityGradeMap[spouseMentalDisability] ?? '無',
      };
    }

    // 療育手帳・愛の手帳
    const spouseIntellectualDisability =
      context['療育手帳、または愛の手帳を持っていますか？'].配偶者[0]
        ?.selection;
    if (spouseIntellectualDisability != null) {
      const spouseIntellectualMap: Record<
        string,
        { field: string; value: string }
      > = {
        '療育手帳 A': { field: '療育手帳等級', value: 'A' },
        '療育手帳 B': { field: '療育手帳等級', value: 'B' },
        '愛の手帳 1度': { field: '愛の手帳等級', value: '一度' },
        '愛の手帳 2度': { field: '愛の手帳等級', value: '二度' },
        '愛の手帳 3度': { field: '愛の手帳等級', value: '三度' },
        '愛の手帳 4度': { field: '愛の手帳等級', value: '四度' },
      };
      const mapped = spouseIntellectualMap[spouseIntellectualDisability];
      if (mapped) {
        spouseMember[mapped.field] = { [currentDate]: mapped.value };
      }
    }

    // 放射線障害
    const spouseRadiation =
      context['放射線障害がありますか？'].配偶者[0]?.selection;
    if (spouseRadiation != null) {
      spouseMember.放射線障害 = {
        [currentDate]: spouseRadiation === 'いいえ' ? '無' : spouseRadiation,
      };
    }

    // 内部障害・脳性まひ
    const spouseInternalDisability =
      context['内部障害（内臓などのからだの内部の障害）がありますか？']
        .配偶者[0]?.selection;
    if (spouseInternalDisability != null) {
      spouseMember.内部障害 = {
        [currentDate]: spouseInternalDisability ? '有' : '無',
      };
    }
    const spouseCerebralParalysis =
      context['脳性まひ、または進行性筋萎縮症ですか？'].配偶者[0]?.selection;
    if (spouseCerebralParalysis != null) {
      spouseMember.脳性まひ_進行性筋萎縮症 = {
        [currentDate]: spouseCerebralParalysis ? '有' : '無',
      };
    }

    // 介護施設・学生
    const spouseNursingHome =
      context['介護施設に入所していますか？'].配偶者[0]?.selection;
    if (spouseNursingHome != null) {
      spouseMember.介護施設入所中 = { [currentDate]: spouseNursingHome };
    }
    const spouseStudent =
      context['高校、大学、専門学校、職業訓練学校等の学生ですか？'].配偶者[0]
        ?.selection;
    if (spouseStudent != null) {
      spouseMember.学生 = { [currentDate]: spouseStudent };
    }

    // 妊娠
    const spousePregnancy =
      context['妊娠中、または産後6ヵ月以内ですか？'].配偶者[0]?.selection;
    if (spousePregnancy != null) {
      spouseMember.妊産婦 = {
        [currentDate]: spousePregnancy === 'いいえ' ? '無' : spousePregnancy,
      };
    }
  }

  // 親一覧の構築（配偶者の有無に応じて追加）
  const 親一覧: HouseholdRelationship[] = ['あなた'];
  if (hasSpouse) {
    親一覧.push('配偶者');
  }

  const 世帯員: OpenFiscaHousehold['世帯員'] = {
    あなた: selfMember,
  };
  if (hasSpouse) {
    世帯員.配偶者 = spouseMember;
  }

  const household: OpenFiscaHousehold = {
    // Household members
    世帯員: 世帯員,
    // Household
    世帯一覧: {
      // Household 1
      世帯1: {
        親一覧: 親一覧,
        居住都道府県: {
          [currentDate]: context['寝泊まりしている地域'].あなた[0].prefecure,
        },
        居住市区町村: {
          [currentDate]: context['寝泊まりしている地域'].あなた[0].municipality,
        },
        配偶者がいるがひとり親に該当: {
          [currentDate]:
            context['以下のいずれかに当てはまりますか？'].配偶者[0]?.selection,
        },

        // 以下はOpenFisca側から受け取りたいVariableを指定
        // 値は計算前のためすべてnullで指定
        // Child Allowance
        児童手当: {
          [currentDate]: null,
        },
        // Maximum Child Support Allowance
        児童扶養手当_最大: {
          [currentDate]: null,
        },
        // Minimum Child Support Allowance
        児童扶養手当_最小: {
          [currentDate]: null,
        },
        // Minimum Special Child Support Allowance
        特別児童扶養手当_最小: {
          [currentDate]: null,
        },
        // Maximum Special Child Support Allowance
        特別児童扶養手当_最大: {
          [currentDate]: null,
        },
        // Livelihood Protection
        生活保護: {
          [currentDate]: null,
        },
        // Handicapped Children Welfare Allowance
        障害児福祉手当: {
          [currentDate]: null,
        },
        // Minimum High School Scholarship
        高等学校奨学給付金_最小: {
          [currentDate]: null,
        },
        // Maximum High School Scholarship
        高等学校奨学給付金_最大: {
          [currentDate]: null,
        },
        // Livelihood Support Payment
        生活支援費: {
          [currentDate]: null,
        },
        // Temporary Life Reconstruction Payment
        一時生活再建費: {
          [currentDate]: null,
        },
        // Welfare Expenses
        福祉費: {
          [currentDate]: null,
        },
        // Emergency Small Amount Fund
        緊急小口資金: {
          [currentDate]: null,
        },
        // Education Support Payment
        教育支援費: {
          [currentDate]: null,
        },
        // School Enrollment Expenses
        就学支度費: {
          [currentDate]: null,
        },
        // Real Estate Secured Living Expenses
        不動産担保型生活資金: {
          [currentDate]: null,
        },
        // Disaster condolence money
        災害弔慰金: {
          [currentDate]: null,
        },
        // Disaster disability compensation money MAX
        災害障害見舞金_最大: {
          [currentDate]: null,
        },
        // Disaster disability compensation money MIN
        災害障害見舞金_最小: {
          [currentDate]: null,
        },
        // Disaster victim life reconstruction support system
        被災者生活再建支援制度: {
          [currentDate]: null,
        },
        // Disaster relief funds
        災害援護資金: {
          [currentDate]: null,
        },
        高等学校等就学支援金_最大: {
          [currentDate]: null,
        },
        高等学校等就学支援金_最小: {
          [currentDate]: null,
        },
        健康管理費用_最大: {
          [currentDate]: null,
        },
        健康管理費用_最小: {
          [currentDate]: null,
        },
        健康管理支援事業_最大: {
          [currentDate]: null,
        },
        健康管理支援事業_最小: {
          [currentDate]: null,
        },
        先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大:
          {
            [currentDate]: null,
          },
        先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小:
          {
            [currentDate]: null,
          },
        障害基礎年金_最大: {
          [currentDate]: null,
        },
        障害基礎年金_最小: {
          [currentDate]: null,
        },
        特別障害者手当_最大: {
          [currentDate]: null,
        },
        特別障害者手当_最小: {
          [currentDate]: null,
        },
        特定疾病療養の対象者がいる: {
          [currentDate]: null,
        },
        先天性血液凝固因子障害等治療研究事業の対象者がいる: {
          [currentDate]: null,
        },
        重度心身障害者医療費助成制度の対象者がいる: {
          [currentDate]: null,
        },
        傷病手当金_最大: {
          [currentDate]: null,
        },
        傷病手当金_最小: {
          [currentDate]: null,
        },
      },
    },
  };

  // 東京都独自の支援制度
  if (context['寝泊まりしている地域'].あなた[0].prefecure === '東京都') {
    household.世帯一覧.世帯1.児童育成手当 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.障害児童育成手当 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.重度心身障害者手当_最小 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.重度心身障害者手当_最大 = {
      [currentDate]: null,
    };
    household.世帯一覧.世帯1.受験生チャレンジ支援貸付 = {
      [currentDate]: null,
    };
  }

  // 「家を借りたいですか？」の回答
  if (context['家を借りたいですか？'].あなた[0].selection != null) {
    household.世帯一覧.世帯1.住宅入居費 = {
      [currentDate]: context['家を借りたいですか？'].あなた[0].selection,
    };
  }

  return household;
};
