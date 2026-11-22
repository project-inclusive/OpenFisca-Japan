# フロントエンドのテストで保証していること

`dashboard` のテストが、どの層で、機能ごとに何を確かめ、何を確かめていないかをまとめる。
テストの流し方は [開発ドキュメント](./dev_note.md#フロントエンド) にある。この文書には流し方を書かない。

## 方針

- ファイルごとの「確かめていること」「確かめていないこと」の正本は `tools/test_report/viewpoints.yaml` の `test_descriptions`、段階ごとの受け持ちは `responsibilities` である。この文書の「機能ごとに保証していること」は、そこから生成した表であり、説明を二重に書かない。
- 機能の分け方は同じ YAML の `features` に置く。`features` は機能の名前とテストのファイルの一覧だけを持ち、説明は持たない。
- テストの説明を変えるときは YAML を直してから表を生成し直す。この文書の生成の区間を手で直さない。

## テストの層と役割

| 層 | 置き場所 | 役割 |
| --- | --- | --- |
| 単体 | `src/**/*.test.ts(x)` | node・jsdom の Vitest。状態機械・世帯の変換・進捗・共有データ・入力の正規化と境界など |
| story | `src/**/*.stories.tsx` | Storybook の play 関数を Chromium で動かす。入力・選択・結果とエラーの表示、自動 a11y |
| Browser Mode | `src/**/*.browser.test.tsx` | story にしない実ブラウザーの検査。実キーボード・フォーカス・画面幅・状態機械への配線 |
| E2E | `e2e/*.spec.ts` | Playwright の 5 つの project で、ホームと見積もりの固定経路を通す smoke |
| 見た目の比較 | `e2e/visual/screens.spec.ts` | 固定した Docker 環境の Chromium で、13 画面 × 2 幅の画像と ARIA スナップショットを比べる |

単体の段階は `unit` project、story と Browser Mode は `vitest.browser.config.mts` の `storybook`・`browser` projects、E2E は `playwright.config.ts`、見た目の比較は `playwright.visual.config.ts` で動く。
API の応答は、単体・story・Browser Mode では MSW 2 の共通 handler（`src/mocks/handlers.ts`）、E2E と見た目の比較では `page.route` などで固定の JSON に置き換える。

## 機能ごとに保証していること

機能は、利用者が画面で行うこと（質問に答える・入力する・計算を送る・結果を見る・共有する・画面を移る）と、画面の外側の条件（画面幅と端末・通しの操作・見た目）で分けた。
一つのテストのファイルが二つの機能にまたがる場合は、両方の表に出す。
表は次のコマンドで生成し、下の目印のコメントの間だけを書き換える。生成し直して差が出ないことは `python -m pytest tools/test_report` で確かめている。

```bash
python tools/test_report/report.py --write-test-note
```

<!-- test-report:features:begin -->

<!-- この区間は `python tools/test_report/report.py --write-test-note` で tools/test_report/viewpoints.yaml から生成する。手で直さない。 -->

### 段階ごとの受け持ち

| 受け持ち | 段階 | 範囲 |
| --- | --- | --- |
| 状態の論理 | unit | 質問の流れ・回答から世帯JSONへの変換・決まった時点の進捗・共有データ。 |
| 表示・入力・操作 | unit / ui | 入力テンプレート、モック応答の結果とエラー、幅・キー操作・自動a11y検査。 |
| 通し | e2e | 5設定でホームとかんたん・くわしい見積もりの固定経路。APIはモック。 |

### 質問の流れと回答の保存

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| 単体 | `dashboard/src/state/questionState.test.ts` | 決まった回答経路で目的の質問まで進み、値の保存・次の質問・戻る際の質問と回答と世帯員の復元、一部の分岐を確認する。 | 画面表示、すべての回答経路・分岐の組合せ、入力値の妥当性。 |
| 単体 | `dashboard/src/state/progress.test.ts` | 3モードの決まった時点で進捗の値や下限を確認する（最初は0、配偶者の最初は0.6以上など）。 | 途中の全値、単調増加、最後に1になること。 |
| Browser Mode | `dashboard/src/components/questions/question.browser.test.tsx` | 実際の状態機械につないだ質問画面で、未回答と一部回答の阻止、次へ・前への回答の復元、配偶者・子ども・親の入力欄の切り替えと世帯員ごとの回答、3モードで最後の質問のあとに結果へ移り両方の世帯を保存することを確認する。 | 結果の表示と計算の送信、すべての質問と回答経路、全端末。 |

### 入力欄

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| 単体 | `dashboard/src/components/questions/template/questionTemplates.test.tsx` | DOM上で年齢・金額・子の年齢と学年・人数の正規化と境界・未回答・復元・再描画を確認する。 | 実ブラウザーのレイアウト、全質問への配線、OS固有IME。 |
| 単体 | `dashboard/src/components/questions/template/questionTemplates.device.test.tsx` | jsdomで8種の端末・ブラウザーのUAを与え、年齢・金額・子の年齢・人数の入力欄のtypeとpattern、IME変換中の値と回答の扱い、InputEventのない変更、未回答・復元・消去と0の再入力の有効性を確認する。 | 実ブラウザー・実端末とOSのIME、レイアウト、状態機械への配線。 |
| Browser Mode | `dashboard/src/components/questions/template/ageQuestionTemplate.browser.test.tsx` | 実キーボードの下キーで年齢が0未満にならず、値と有効性とフォーカスを保つことを確認する。 | 年齢の全境界、ほかのテンプレート、OS固有キー動作。 |
| Browser Mode | `dashboard/src/components/questions/template/questionTemplates.input.browser.test.tsx` | 実ブラウザーのキー操作で、年齢・金額・子の年齢の復元値を消して0を入れ直すこと、学年の編集から年齢への変換、金額欄のEnterでフォームを送らないこと、人数の「はい」でのフォーカスと値の復元を確認する。 | IME、全端末、自動a11y検査、状態機械への配線。 |
| story | `dashboard/src/components/questions/template/questionTemplates.stories.tsx` | 実ブラウザーで各テンプレートの入力・選択・復元・フォーカスと自動a11y検査を確認する。 | 全質問の状態機械への配線、全端末、手動支援技術。 |

### 計算の送信

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| 単体 | `dashboard/src/state/convert.test.ts` | 主に回答を1項目ずつ設定し、contextから送信する世帯JSONの変数名・期間・単位換算・未回答の省略・世帯員追加・変換規則を確認する。 | 複数回答の組合せ、バックエンドによる受理。 |
| 単体 | `dashboard/src/hooks/calculate.test.tsx` | モックHTTPでPOSTのURL・本文・応答保存、未指定時の非送信、HTTP500・通信失敗と再試行を確認する。 | 実バックエンド、全環境の送信先、ブラウザー表示。 |
| 単体 | `dashboard/src/components/calculate/calculate.test.tsx` | 3つの住所で困りごとごとに候補にする制度の一覧、前の結果の解除、複数の困りごとの組み合わせと再計算、選んだ日付の住所での地域の制度を確認する。 | 制度を受けられるかの判定、バックエンドの計算、画面表示、ほかの地域。 |

### 結果と窓口

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| Browser Mode | `dashboard/src/components/result/applicable.browser.test.tsx` | 困りごとから候補にした制度の表示と説明・窓口、バックエンドとフロントの制度の統合と重複・偽の値の除外、結果がないときの非表示、HIVの回答による窓口、結果の都道府県による窓口、新しい結果での入れ替えを確認する。フロントの結果だけが変わったときの入れ替えは既知の失敗（it.fails）として残す。 | 制度を受けられるかの判定、すべての制度と窓口、全端末。 |
| Browser Mode | `dashboard/src/components/result/resultDetails.browser.test.tsx` | 社会福祉協議会の調べ方、窓口がない住所での非表示、3種の窓口の名前・地図・電話のリンクとWebサイトがないときの文字、金額が0のときに給付と貸付の欄を出さないことを確認する。 | すべての住所と窓口のデータ、設定の値の正しさ、全端末。 |
| story | `dashboard/src/components/result/result.stories.tsx` | モック応答で給付・貸付の有無、地域・URL・金額幅・単位・HIVの表示分岐、HTTP500・通信失敗時の移動とa11yを確認する。 | 実制度計算、全応答データ、全端末。 |
| story | `dashboard/src/components/result/resultDetails.stories.tsx` | 給付の金額の並びと単位、貸付の上限と区分、HIVの回答による拠点病院の表示、拠点病院の並びと重複の除去、注記つきの窓口と各リンクを確認する。 | 実制度計算、すべての制度と窓口、自動a11y検査での合否。 |

### 共有

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| 単体 | `dashboard/src/components/result/shareLink.test.ts` | 共有データの主な項目の往復・短縮・旧形式、base64の可逆性と展開を確認する。 | 全項目の一致、壊れたURL、画面操作。 |
| Browser Mode | `dashboard/src/components/result/resultShare.browser.test.tsx` | モック応答で、短縮・旧形式の共有リンクを3モードで開いた送信内容とQRのURL、壊れたリンクのエラーと戻り先、リンクのコピー、コピーの拒否と環境情報のコピーの再試行、画像保存と読み込み中の表示を確認する。 | QRの画像そのもの、画像の中身、実際のクリップボードと実API。 |
| story | `dashboard/src/components/result/resultShare.stories.tsx` | 実ブラウザーで、短縮の共有リンクの3モード、frontendのデータの有無による旧形式のリンク、壊れたリンクのエラーと戻り先を表示することを確認する。 | 送信内容、コピー・QR・画像の操作、自動a11y検査での合否。 |

### 画面の移動・同意とエラーの画面

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| Browser Mode | `dashboard/src/App.browser.test.tsx` | Appのルート表で、2つの同意の確認と取り消し・閉じたときの解除、トップの説明とフッターのリンク、3モードの画面を直接開いて始めること、プライバシーポリシー・保存した結果のURL・応答エラー・存在しないURLの表示と戻り先を確認する。 | 同意から結果までの通し（E2E）、実API、全端末。 |
| story | `dashboard/src/components/errors/errors.stories.tsx` | 汎用・404・応答エラーの表示、モード別の戻り先とキー操作、自動a11y検査を確認する。 | 実HTTPでの発生、手動支援技術、すべてのエラー本文。 |

### 画面幅と端末（互換）

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| Browser Mode | `dashboard/src/components/layout/uiCompatibility.browser.test.tsx` | 390・820・1440 CSS pxで質問・結果・3種のエラーの幅とキーボード操作、同意モーダルのフォーカス復帰を確認する。 | モバイル実機のUA、全画面幅、状態機械との通し操作。 |
| 単体 | `dashboard/src/components/questions/template/questionTemplates.device.test.tsx` | jsdomで8種の端末・ブラウザーのUAを与え、年齢・金額・子の年齢・人数の入力欄のtypeとpattern、IME変換中の値と回答の扱い、InputEventのない変更、未回答・復元・消去と0の再入力の有効性を確認する。 | 実ブラウザー・実端末とOSのIME、レイアウト、状態機械への配線。 |

### 通しの操作

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| E2E | `dashboard/e2e/Homepage.spec.ts` | 5ブラウザー・端末設定でホームの見出しと2つの見積もりの入口の表示を確認する。 | 実端末、すべてのルート、実API。 |
| E2E | `dashboard/e2e/SimpleCalculation.spec.ts` | 5設定でかんたん見積もりの決まった回答経路からモック結果の表示までを確認する。 | 全回答経路、実API・制度計算。 |
| E2E | `dashboard/e2e/DetailedCalculation.spec.ts` | 5設定でくわしい見積もりの決まった回答経路からモック結果の表示までを確認する。 | 全回答経路、災害モードの通し、実API・制度計算。 |

### 見た目

| 層 | ファイル | 確かめていること | 確かめていないこと |
| --- | --- | --- | --- |
| 見た目の比較 | `dashboard/e2e/visual/screens.spec.ts` | 通常のE2Eの設定から外し、playwright.visual.config.tsでだけ実行する（この表の件数は0）。固定したDocker環境のChromiumで、13画面をdesktopとmobileの2幅で撮り、保存した期待値と画像・ARIAスナップショットが一致することを確認する。 | 5ブラウザー・端末設定、操作の結果、期待値そのものの正しさ（撮影時にレビューする）。 |

<!-- test-report:features:end -->

## 保証していないこと・既知の制約

ここに書くのは、テストのファイルと `viewpoints.yaml` から確かめられる事実だけである。各ファイルの細かい「確かめていないこと」は上の表にある。

- **本物のバックエンドとはつながない。** E2E は `page.route` で `/calculate` への POST に `src/mocks/calculate/*.response.json` を返す。単体・story・Browser Mode も MSW の handler で応答を置き換え、未定義の通信はエラーにする。固定の応答は画面が読む形に合わせた手作りのデータであり、実 API の記録や制度の適格性・金額の根拠ではない。実 API との差は開発ドキュメントの「計算 API の固定データと再記録」の手順で別に確かめる。
- **制度の計算そのものは確かめない。** 結果の画面のテストはモック応答の表示分岐を確かめる。制度を受けられるかの判定、すべての制度と窓口のデータは対象外である（`test_descriptions` の `does_not_verify`）。
- **E2E は固定の経路の smoke である。** かんたん見積もりとくわしい見積もりを 1 本ずつ通し、災害モードの通しと全回答経路は確かめない。`retries` は 0 で、失敗を再試行で隠さない。
- **網羅率の閾値はない。** `--coverage` の数値はテストを足す先を探すためのもので、閾値や CI での強制は設定していない。`make test-report` の 80% も調査先を絞る目安であり、合否の条件ではない。E2E の網羅率は測らない。
- **自動 a11y 検査は合否にしない。** `.storybook/preview.ts` は `a11y: { test: 'todo' }` とし、違反を警告として報告する。手動の支援技術による確認もしていない。
- **既知の不具合を `it.fails` で残している。** `src/components/result/applicable.browser.test.tsx` の「refreshes programs when only the frontend calculation changes」は、バックエンドの応答が同じでフロントの計算結果だけが変わったときに表示する制度が入れ替わらないことを、既知の失敗として残している。直ると、このテストが失敗して知らせる。
- **見た目の比較は通常の E2E に含まれない。** `playwright.config.ts` の `testIgnore` で外し、Docker の Chromium でだけ動かす。5 つのブラウザー・端末の設定では比べず、期待値そのものの正しさは撮影時のレビューに任せる。
- **実機と OS の IME は確かめない。** 端末ごとの入力は jsdom で UA を与えて確かめ、IME は変換中のイベントで確かめる。実端末と OS 固有の IME・キー動作は対象外である。
- **対象外にした部品と条件がある。** `viewpoints.yaml` の `exclusions` で、説明文だけの部品（`PrivacyPolicy.tsx`・`Description.tsx`・`questions/description.tsx`・`descriptions/spouseExistsButSingleParent.tsx`）と起動入口の `main.tsx`、説明だけのプライバシーポリシー画面を全条件で対象外にしている。選択式の入力欄（住所・選択肢・複数選択・はい/いいえ）には自由入力・数値の境界・IME・数値入力属性を求めず、給付・貸付・窓口には互いの責務の表示（単位・金額の範囲・HIV の分岐）を求めない。
- **状態機械の通過は代表回答による。** `make test-report` の「状態機械の分かれ道」は、代表回答での探索と既存テストの実行時の通過を示す。全回答の組合せの網羅や、各遷移への専用の assertion を意味しない。

## レポートの読み方

`make test-report` は、テストの本体を実行せずに一覧を集め、`tmp/test-report/frontend.md` にレポートを出す（生成物であり、commit しない）。実行結果と網羅率は、別に採取した JSON があるときだけ載る。出し方と採取の手順、タグと分類の詳しい規則は、リポジトリの `tools/test_report/README.md` にある。

- **テストの構成**: ファイルごとの段階・import・件数・観点の内訳と、`test_descriptions` の説明。この文書の表と同じ説明を使う。
- **観点×条件**: 対象（実装）ごとに期待する観点・条件と、それを埋めるテスト。タグは確かめていることの分類であり、確かめ方の強さや成功を示さない。
- **空きの扱い**: 「空き（不足候補）」はテストを足す候補であり、必ず足すべきという判定ではない。名前・タグ・対応の定義と実際の assertion を確かめ、必要がなければ `exclusions` に理由を書いて対象外にする。「対象外」のますには、その理由が出る。
- **未分類のテスト**: タグも分類の規則もないテスト、または対象に結び付かないテスト。0 件を保つ。新しい名前の型を足したら、宣言にタグを書くか `classification_rules` を足す。
- **テストの状況・網羅率**: JSON がなければ「未実行」「未計測」と、採取のコマンドを出す。古い結果は自動では見分けられないため、コードを変えたら採取し直す。

## 流し方

テストの流し方、ブラウザーの準備、網羅率と見た目の比較の手順は、[開発ドキュメントの「フロントエンド」](./dev_note.md#フロントエンド) にある。
