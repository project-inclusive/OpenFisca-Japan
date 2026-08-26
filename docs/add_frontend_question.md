# フロントエンドへの質問追加手順

フロントエンド（`/dashboard`）の一問一答フォームに新しい質問を追加する手順を説明します。

---

## 概要

質問フローは [XState](https://stately.ai/docs/xstate) のステートマシンで管理されており、1つの質問を追加するには以下のファイルを修正します。

| ファイル | 役割 |
|---|---|
| `dashboard/src/state/questionDefinition.ts` | 質問の型定義・定数登録 |
| `dashboard/src/state/questionState.ts` | XState context 初期化 + state 定義 |
| `dashboard/src/components/forms/questions/` | 質問コンポーネント（新規作成） |

---

## 質問タイプ一覧

| type | 説明 | 回答の型 | 選択肢の指定 |
|---|---|---|---|
| `Boolean` | はい／いいえ | `boolean \| undefined` | 不要 |
| `Selection` | 単一選択（ラジオ相当） | `string \| undefined` | 必要 |
| `MultipleSelection` | 複数選択（チェックボックス相当） | `string[]` | 必要 |
| `Age` | 年齢（数値入力） | `number \| undefined` | 不要 |
| `AmountOfMoney` | 金額（万円単位） | `number \| undefined` | 不要 |
| `PersonNum` | 人数（数値入力） | `number \| undefined` | 不要 |
| `Address` | 都道府県・市区町村 | `{ prefecure, municipality }` | 不要（JSONから自動取得） |

---

## 手順

### Step 1: 質問定義を `questionDefinition.ts` に追加

タイプに対応する定数オブジェクトに、質問タイトルをキーとして追加します。

#### Boolean の場合

```typescript
// dashboard/src/state/questionDefinition.ts
export const booleanQuestionDefinitions = {
  // ... 既存の定義 ...
  '新しい質問タイトルですか？': { type: 'Boolean' },  // ← 追加
} as const;
```

#### Selection の場合

```typescript
export const selectionQuestionDefinitions = {
  // ... 既存の定義 ...
  新しい選択質問: {                            // ← 追加
    type: 'Selection',
    selections: ['選択肢A', '選択肢B', '選択肢C'],
  },
} as const;
```

#### MultipleSelection の場合

```typescript
export const multipleSelectionQuestionDefinitions = {
  // ... 既存の定義 ...
  '新しい複数選択質問ですか？': {              // ← 追加
    type: 'MultipleSelection',
    selections: ['項目1', '項目2', '項目3'],
  },
} as const;
```

#### Age / AmountOfMoney / PersonNum の場合

```typescript
export const ageQuestionDefinitions = {
  // ... 既存の定義 ...
  新しい年齢質問: { type: 'Age' },             // ← 追加
} as const;
```

---

### Step 2: XState の context を初期化する

`questionState.ts` の `context` オブジェクトに初期値を追加します。
タイプによって初期値の形が異なります。

```typescript
// dashboard/src/state/questionState.ts
context: {
  // ... 既存のcontext ...

  // Boolean
  '新しい質問タイトルですか？': {
    あなた: [{ type: 'Boolean', selection: undefined }],
    配偶者: [],
    子ども: [],
    親: [],
  },

  // Selection
  新しい選択質問: {
    あなた: [{ type: 'Selection', selection: undefined }],
    配偶者: [],
    子ども: [],
    親: [],
  },

  // MultipleSelection
  '新しい複数選択質問ですか？': {
    あなた: [{ type: 'MultipleSelection', selection: [] }],
    配偶者: [],
    子ども: [],
    親: [],
  },

  // Age
  新しい年齢質問: {
    あなた: [{ type: 'Age', selection: undefined }],
    配偶者: [],
    子ども: [],
    親: [],
  },

  // AmountOfMoney
  新しい金額質問: {
    あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
    配偶者: [],
    子ども: [],
    親: [],
  },

  // PersonNum
  新しい人数質問: {
    あなた: [{ type: 'PersonNum', selection: undefined }],
    配偶者: [],
    子ども: [],
    親: [],
  },
},
```

> **Note:** `あなた` 以外の世帯員（配偶者・子ども・親）に質問する場合は、対象世帯員の配列に初期値を追加してください。

---

### Step 3: XState の state を追加する

`questionState.ts` の `states` オブジェクトに、遷移先とともに定義を追加します。

```typescript
// dashboard/src/state/questionState.ts
states: {
  // ... 既存のstate ...

  '新しい質問タイトルですか？': {
    on: actionObj<'新しい質問タイトルですか？'>({
      questionKey: '新しい質問タイトルですか？',
      // デフォルトの遷移先（条件に当てはまらない場合）
      nextQuestionKey: '次の質問タイトル',
      // 条件付き遷移先（上から順に評価され、最初に一致したものへ進む）
      nextConditions: [
        {
          target: '別の質問タイトル',
          guard: ({ context }) => {
            // 例: はいを選んだ場合のみ別のルートへ
            const member = context.currentMember;
            return context['新しい質問タイトルですか？'][member.relationship][member.index]?.selection === true;
          },
        },
      ],
      // 最初の質問の場合は false、それ以外は true
      hasBack: true,
    }),
  },
},
```

また、直前の質問の `nextQuestionKey`（または `nextConditions` の `target`）を新しい質問のタイトルに変更して、フローに組み込んでください。

---

### Step 4: React コンポーネントを作成する

`dashboard/src/components/forms/questions/` に新しいファイルを作成します。
各タイプに対応するテンプレートコンポーネントを使います。

#### Boolean（はい／いいえ）

```tsx
// dashboard/src/components/forms/questions/newBooleanQuestion.tsx
import { useRecoilState, useRecoilValue } from 'recoil';
import { YesNoQuestion } from '../templates/yesNoQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const NewBooleanQuestion = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const yesOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].対応するOpenFisca変数名 = { [currentDate]: true };
    setHousehold({ ...newHousehold });
  };

  const noOnClick = () => {
    const newHousehold = { ...household };
    newHousehold.世帯員[personName].対応するOpenFisca変数名 = { [currentDate]: false };
    setHousehold({ ...newHousehold });
  };

  return (
    <YesNoQuestion
      title="新しい質問タイトルですか？"
      yesOnClick={yesOnClick}
      noOnClick={noOnClick}
    />
  );
};
```

#### Selection（単一選択）

```tsx
// dashboard/src/components/forms/questions/newSelectionQuestion.tsx
import { useRecoilState, useRecoilValue } from 'recoil';
import { SelectionQuestion } from '../templates/selectionQuestion';
import { currentDateAtom, householdAtom } from '../../../state';

export const NewSelectionQuestion = ({ personName }: { personName: string }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const [household, setHousehold] = useRecoilState(householdAtom);

  const choices = ['選択肢A', '選択肢B', '選択肢C'];

  const selections = choices.map((choice) => ({
    selection: choice,
    onClick: () => {
      const newHousehold = { ...household };
      newHousehold.世帯員[personName].対応するOpenFisca変数名 = { [currentDate]: choice };
      setHousehold({ ...newHousehold });
    },
  }));

  return <SelectionQuestion title="新しい選択質問" selections={selections} />;
};
```

#### MultipleSelection（複数選択）

```tsx
// dashboard/src/components/forms/questions/newMultipleSelectionQuestion.tsx
import { useRecoilState } from 'recoil';
import { frontendHouseholdAtom } from '../../../state';
import { MultipleSelectionQuestion } from '../templates/multipleSelectionQuestion';

export const NewMultipleSelectionQuestion = () => {
  const [frontendHousehold, setFrontendHousehold] = useRecoilState(frontendHouseholdAtom);

  const selectionValues = ['項目1', '項目2', '項目3'];

  const selections = selectionValues.map((value) => ({
    selection: value,
    enable: () => {
      const copied = { ...frontendHousehold };
      copied.対応するfrontendHouseholdのキー[value] = true;
      setFrontendHousehold(copied);
    },
    disable: () => {
      const copied = { ...frontendHousehold };
      copied.対応するfrontendHouseholdのキー[value] = false;
      setFrontendHousehold(copied);
    },
  }));

  return (
    <MultipleSelectionQuestion
      title="新しい複数選択質問ですか？"
      selections={selections}
    />
  );
};
```

> **Note:** `対応するOpenFisca変数名` は、この質問が更新する `household.世帯員[personName]` のプロパティ名です。OpenFisca の変数定義と合わせてください。

---

## チェックリスト

追加完了後、以下を確認してください。

- [ ] `questionDefinition.ts` の対応する `~QuestionDefinitions` に定義を追加した
- [ ] `questionState.ts` の `context` に初期値を追加した
- [ ] `questionState.ts` の `states` に state を追加した
- [ ] 直前の質問の `nextQuestionKey` または `nextConditions` を新しい質問に向けた
- [ ] コンポーネントファイルを作成した
- [ ] `npm run test` および `npm run typecheck` が通ることを確認した
