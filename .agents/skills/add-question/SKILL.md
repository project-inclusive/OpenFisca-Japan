フロントエンドの一問一答フォームに新しい質問を追加します。

## パラメータ（$ARGUMENTS に渡す形式）

```
タイトル: <質問のタイトル>
タイプ: <Boolean | Selection | MultipleSelection | Age | AmountOfMoney | PersonNum | Address>
選択肢: <Selection または MultipleSelection の場合のみ、カンマ区切りで列挙>
```

例:
```
タイトル: 奨学金を受給していますか？
タイプ: Boolean
```
```
タイトル: 住居の種類
タイプ: Selection
選択肢: 持ち家,賃貸,公営住宅,その他
```

---

## 実装手順

まず `docs/add_frontend_question.md` を Read して手順とコード例を確認してください。

次に、以下の引数を解釈してください：

$ARGUMENTS

引数が不足している場合（タイトルやタイプが未指定、SelectionまたはMultipleSelectionなのに選択肢がない場合）は、実装を開始する前にユーザーに確認してください。

確認が取れたら、`docs/add_frontend_question.md` の手順に従い、以下の順で実装してください：

1. `dashboard/src/state/questionDefinition.ts` に定義を追加
2. `dashboard/src/state/questionState.ts` の context に初期値を追加
3. `dashboard/src/state/questionState.ts` の states に state を追加（遷移先は「どの質問の後に配置するか」をユーザーに確認する）
4. `dashboard/src/state/convert.ts` に新質問の回答を OpenFisca 変数へマッピングする処理を追加する（`収入`、`預貯金` 等を参照のこと）
5. テストファイルを更新する
   - `dashboard/src/state/convert.test.ts` の `defaultContext()` に初期値を追加
   - `dashboard/src/state/questionState.test.ts` の `skipUntil` 系ヘルパー関数すべてに新質問のステップを追加し、遷移先が変わったテストを修正する
   - `dashboard/src/state/progress.test.ts` の手動ステップシーケンスに新質問のステップを追加する

> **注意:** `dashboard/src/components/forms/questions/` 以下の個別コンポーネントは旧システムのもので現在は使用されていない。
> 現行アプリは `dashboard/src/components/questions/question.tsx` が質問タイプに応じて汎用レンダリングするため、コンポーネントファイルの新規作成は不要。

実装後、型エラーとテストがすべて通ることを確認してください。

```bash
cd dashboard && npx tsc --noEmit && npm run test
```
