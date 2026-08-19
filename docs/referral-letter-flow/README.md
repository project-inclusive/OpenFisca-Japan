# 紹介状機能 画面遷移一覧

トップページ右下の「紹介状 β版」から紹介状を生成するまでの、標準的な画面遷移です。

- [納品先への確認事項](stakeholder-confirmation.md)

- 表示幅：402 px相当（スマートフォン）
- 対象分野：高齢分野
- 回答例：各質問の先頭の選択肢
- 困りごと：主な困りごと1件、その他の困りごと3件
- 氏名・メールアドレス・自由記述：未入力

## 遷移概要

`トップページ` → `機能説明` → `利用前の確認` → `分野選択` → `質問1〜7` → `主な困りごと選択` → `その他の困りごと選択` → `任意入力` → `完成画面`

## 条件分岐と後続プロセス

### 紹介状を作成するまでの分岐

ひし形が判定、四角形が画面または処理を表します。「次へ／完了が無効」は、その条件を満たすまで同じ画面に留まることを意味します。

```mermaid
flowchart TD
  START["トップページ<br/>右下の『紹介状 β版』"] --> DESCRIPTION["機能説明"]
  DESCRIPTION --> NOTICE["利用前の確認"]

  NOTICE --> CONSENT{"注意事項に同意した？"}
  CONSENT -- "いいえ" --> CONSENT_WAIT["『次へ』が無効<br/>利用前の確認に留まる"]
  CONSENT_WAIT --> NOTICE
  CONSENT -- "はい" --> AREA["分野選択"]

  AREA --> AREA_SELECTED{"分野を1つ選択した？"}
  AREA_SELECTED -- "いいえ" --> AREA_WAIT["『次へ』が無効<br/>分野選択に留まる"]
  AREA_WAIT --> AREA
  AREA_SELECTED -- "はい" --> QUESTIONS["選択分野の質問1〜7"]

  QUESTIONS --> ANSWERED{"現在の質問に回答した？"}
  ANSWERED -- "いいえ" --> ANSWER_WAIT["『次へ』が無効<br/>現在の質問に留まる"]
  ANSWER_WAIT --> QUESTIONS
  ANSWERED -- "はい・質問1〜6" --> QUESTIONS
  ANSWERED -- "はい・質問7" --> CANDIDATES{"相談候補が1件以上ある？<br/>回答の緊急度が none 以外"}

  CANDIDATES -- "0件" --> NO_CONCERNS["紹介状を生成しない<br/>『大きな困り事はなさそうです』"]
  NO_CONCERNS -- "前へ" --> QUESTIONS
  NO_CONCERNS -- "最初から／トップへ" --> CLEAR_HOME["入力状態を削除<br/>トップページへ"]

  CANDIDATES -- "1件以上" --> CONCERNS["主な困りごと選択"]
  CONCERNS --> MAIN_SELECTED{"主な困りごとを<br/>1件選択した？"}
  MAIN_SELECTED -- "いいえ" --> MAIN_WAIT["『次へ』が無効<br/>主な困りごと選択に留まる"]
  MAIN_WAIT --> CONCERNS
  MAIN_SELECTED -- "はい" --> OTHERS["別画面：その他の困りごと選択<br/>0〜3件、任意で選択<br/>主な困りごとは候補外"]
  OTHERS --> DETAILS["氏名・メール・自由記述<br/>すべて任意"]

  DETAILS --> EMAIL_VALID{"メールは空欄、または<br/>有効な形式？"}
  EMAIL_VALID -- "いいえ" --> EMAIL_WAIT["形式エラーを表示<br/>『完了』が無効"]
  EMAIL_WAIT --> DETAILS
  EMAIL_VALID -- "はい" --> RESULT["説明書・紹介状を生成<br/>選択した各困りごとの相談先を表示"]

  RESULT --> RESULT_ACTION{"完成後の操作"}
  RESULT_ACTION -- "回答を編集" --> DETAILS
  RESULT_ACTION -- "PNG保存" --> PNG_RESULT{"画像生成に成功？"}
  PNG_RESULT -- "はい" --> PNG_DONE["ダウンロード開始"]
  PNG_RESULT -- "いいえ" --> PNG_ERROR["エラー表示<br/>内容を保持して再試行可能"]
  PNG_DONE --> RESULT
  PNG_ERROR --> RESULT
  RESULT_ACTION -- "印刷" --> PRINT["ブラウザの印刷画面"]
  PRINT --> RESULT
  RESULT_ACTION -- "くわしく計算" --> CALCULATE["/calculate へ移動<br/>回答は引き継がない"]
  RESULT_ACTION -- "アンケート" --> SURVEY["外部フォームを<br/>新しいタブで開く"]
  RESULT_ACTION -- "最初からやり直す" --> CLEAR_HOME

  classDef screen fill:#e6fffa,stroke:#285e61,color:#1a202c;
  classDef decision fill:#fefcbf,stroke:#975a16,color:#1a202c;
  classDef blocked fill:#fff5f5,stroke:#c53030,color:#1a202c;
  classDef terminal fill:#ebf8ff,stroke:#2b6cb0,color:#1a202c;
  class DESCRIPTION,NOTICE,AREA,QUESTIONS,NO_CONCERNS,CONCERNS,OTHERS,DETAILS,RESULT screen;
  class CONSENT,AREA_SELECTED,ANSWERED,CANDIDATES,MAIN_SELECTED,EMAIL_VALID,RESULT_ACTION,PNG_RESULT decision;
  class CONSENT_WAIT,AREA_WAIT,ANSWER_WAIT,MAIN_WAIT,EMAIL_WAIT,PNG_ERROR blocked;
  class START,CLEAR_HOME,PNG_DONE,PRINT,CALCULATE,SURVEY terminal;
```

### セッション保存・再開時の分岐

紹介状の回答はURLやサーバーには送らず、同じタブの `sessionStorage` に保存します。ホームへ戻る操作と、明示的に「最初からやり直す」操作では、保存状態の扱いが異なります。

```mermaid
flowchart TD
  OPEN["/referral-letter を開く"] --> SAVED{"このタブに<br/>保存データがある？"}
  SAVED -- "ない" --> INITIAL["機能説明から開始"]
  SAVED -- "ある" --> VALID{"バージョン・項目・<br/>現在ステップが整合している？"}
  VALID -- "はい" --> RESUME["保存されていた画面から再開"]
  VALID -- "いいえ／JSON破損" --> DISCARD["保存データを破棄"]
  DISCARD --> INITIAL

  CHANGE["回答・選択・入力を変更"] --> STORAGE{"sessionStorageへ<br/>保存できた？"}
  STORAGE -- "はい" --> CONTINUE["再読み込み後も同じ画面から再開"]
  STORAGE -- "いいえ" --> MEMORY["警告を表示し<br/>メモリ上で利用を継続"]
  MEMORY --> RELOAD_RISK["再読み込みすると<br/>進捗を復元できない可能性"]

  HOME_ICON["各画面のホームアイコン"] --> KEEP["保存データを残して<br/>トップページへ"]
  KEEP --> REENTER["再度開くと保存画面から再開"]

  EXPLICIT_RESET["『最初からやり直す』<br/>または困りごとなし画面の<br/>『トップページへ戻る』"] --> CLEAR["保存データと画面状態を削除"]
  CLEAR --> TOP["トップページへ"]

  TAB_END["タブを閉じる"] --> SESSION_END["タブのセッション終了"]

  classDef process fill:#e6fffa,stroke:#285e61,color:#1a202c;
  classDef decision fill:#fefcbf,stroke:#975a16,color:#1a202c;
  classDef warning fill:#fff5f5,stroke:#c53030,color:#1a202c;
  class SAVED,VALID,STORAGE decision;
  class MEMORY,RELOAD_RISK warning;
  class OPEN,INITIAL,RESUME,DISCARD,CHANGE,CONTINUE,HOME_ICON,KEEP,REENTER,EXPLICIT_RESET,CLEAR,TOP,TAB_END,SESSION_END process;
```

### 分岐条件の補足

| 分岐タイミング       | 条件                                 | 条件を満たさない場合                     | 条件を満たした後                        |
| -------------------- | ------------------------------------ | ---------------------------------------- | --------------------------------------- |
| 利用前の確認         | 同意チェックがオン                   | 「次へ」が無効                           | 分野選択へ進む                          |
| 分野選択             | 3分野から1件を選択                   | 「次へ」が無効                           | 選択分野の質問1へ進む                   |
| 各質問               | 現在の質問に1件回答                  | 「次へ」が無効                           | 次の質問へ進む。質問7では候補判定を行う |
| 質問7の完了          | `urgency !== none` の回答が1件以上   | 困りごとなし画面へ進み、紹介状は作らない | 困りごと選択へ進む                      |
| 主な困りごと選択     | 主な困りごとを1件選択                | 「次へ」が無効                           | その他の困りごと選択画面へ進む          |
| その他の困りごと選択 | 0〜3件を任意で選択                   | 選択なしでも進める                       | 任意入力へ進む                          |
| 任意入力             | メールが空欄、または形式が有効       | エラーを表示して「完了」が無効           | 説明書・紹介状を生成する                |
| PNG保存              | ブラウザで画像を生成できる           | エラーを表示し、内容を保持したまま再試行 | ダウンロードを開始する                  |
| セッション復元       | 保存データの形式と現在ステップが整合 | 保存データを破棄し、機能説明から開始     | 保存されていた画面から再開する          |

### 戻る・編集で変わる状態

- 分野を別の分野へ変更すると、7問の回答・主な困りごと・その他の困りごとは解除されます。氏名・メール・自由記述は維持されます。
- 回答を変更して、選択済みの困りごとが相談候補でなくなった場合、その主・その他の選択は自動解除されます。
- 質問1の「前へ」は分野選択へ、質問2〜7は1つ前の質問へ戻ります。
- 主な困りごと選択の「前へ」は質問7へ、その他の困りごと選択の「前へ」は主な困りごと選択へ、任意入力の「前へ」はその他の困りごと選択へ戻ります。
- 完成画面の「回答を編集」は任意入力へ戻り、回答・困りごと・入力内容を維持します。
- 完成画面から「くわしく計算」へ移動しても紹介状の保存状態は残りますが、見積もり画面へ回答内容は引き継がれません。

### 代表的な分岐画面

| 相談候補が0件                                                                                        | メール形式が無効                                                                                         |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| <img src="screenshots/09-branch-no-concerns.jpg" width="300" alt="相談候補がない場合の回答結果画面"> | <img src="screenshots/10-branch-invalid-email.jpg" width="300" alt="メール形式エラーで完了できない画面"> |
| 紹介状を生成せず、質問7へ戻るか状態を削除してトップへ戻る。                                          | 入力内容を保持したまま、形式を修正するまで「完了」を無効にする。                                         |

## 画面一覧

| 1. トップページ                                                                             | 2. 機能説明                                                                       |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="screenshots/01-top.jpg" width="300" alt="トップページ右下の紹介状ベータ版ボタン"> | <img src="screenshots/02-description.jpg" width="300" alt="紹介状機能の説明画面"> |
| 右下に固定された「紹介状 β版」から開始する。                                                | 機能の目的と作成できる内容を確認する。                                            |

| 3. 利用前の確認                                                                    | 4. 分野選択                                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| <img src="screenshots/03-notice.jpg" width="300" alt="紹介状機能の利用前確認画面"> | <img src="screenshots/04-area.jpg" width="300" alt="相談したい分野の選択画面"> |
| 注意事項を確認して同意する。                                                       | 高齢・子育て・若者から1分野を選択する。                                        |

### 質問1〜7

| 5-1. お金                                                               | 5-2. 介護                                                               |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <img src="screenshots/05-question-01.jpg" width="300" alt="質問1 お金"> | <img src="screenshots/05-question-02.jpg" width="300" alt="質問2 介護"> |

| 5-3. 移動                                                               | 5-4. 身体的健康                                                               |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| <img src="screenshots/05-question-03.jpg" width="300" alt="質問3 移動"> | <img src="screenshots/05-question-04.jpg" width="300" alt="質問4 身体的健康"> |

| 5-5. 地域とのつながり                                                               | 5-6. 家の片付け                                                               |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| <img src="screenshots/05-question-05.jpg" width="300" alt="質問5 地域とのつながり"> | <img src="screenshots/05-question-06.jpg" width="300" alt="質問6 家の片付け"> |

| 5-7. 精神的健康                                                               |                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| <img src="screenshots/05-question-07.jpg" width="300" alt="質問7 精神的健康"> | 各質問で、現在の状況にもっとも近い回答を1件選択する。 |

| 6. 主な困りごと選択                                                                  | 7. その他の困りごと選択                                                                    |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| <img src="screenshots/06-main-concern.png" width="300" alt="主な困りごとの選択画面"> | <img src="screenshots/07-other-concerns.png" width="300" alt="その他の困りごとの選択画面"> |
| 主な困りごとを必須で1件選択する。                                                    | 次の別画面で、その他の困りごとを任意で最大3件選択する。                                    |

| 8. 任意入力                                                                                           | 9. 完成画面                                                                          |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <img src="screenshots/07-details.jpg" width="300" alt="氏名、メールアドレス、自由記述の任意入力画面"> | <img src="screenshots/09-result.png" width="300" alt="説明書と紹介状の完成画面">     |
| 紹介状へ掲載する情報を必要に応じて入力する。                                                          | 緊急度は表示せず、回答に対応する相談先を確認して画像保存・印刷・回答編集などへ進む。 |

## 補足

- この一覧は、紹介状が生成される標準ルートを撮影したものです。
- 7問すべてで「該当しない」相当の回答を選んだ場合は、紹介状を生成せず「大きな困り事はなさそうです」画面へ分岐します。
- スクリーンショット内の回答は画面遷移確認用の例であり、推奨回答を示すものではありません。
