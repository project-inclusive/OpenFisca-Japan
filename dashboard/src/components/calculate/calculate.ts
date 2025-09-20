import { useRecoilValue } from 'recoil';
import { currentDateAtom, FrontendHousehold, householdAtom } from '../../state';

// フロントエンドのみで計算が完結する世帯情報については、この関数で処理する（バックエンドのロジックに相当）
export const calculateFrontendHouseHold = (
  frontendHousehold: FrontendHousehold
) => {
  const backendHousehold = useRecoilValue(householdAtom);
  const currentDate = useRecoilValue(currentDateAtom);
  const prefecture = backendHousehold.世帯一覧.世帯1.居住都道府県[currentDate];
  const city = backendHousehold.世帯一覧.世帯1.居住市区町村[currentDate];

  const calcuatedHouseHold = { ...frontendHousehold };

  // 前回の計算結果が残っているため一度すべてfalseにリセット
  for (const key in calcuatedHouseHold.制度) {
    calcuatedHouseHold.制度[key] = false;
  }

  if (calcuatedHouseHold.困りごと['仕事について']) {
    calcuatedHouseHold.制度['雇用保険（失業手当）'] = true;
    calcuatedHouseHold.制度['求職者支援制度（職業訓練・ハロートレーニング）'] =
      true;
    calcuatedHouseHold.制度['住宅支援（住居確保給付金）'] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民年金に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度['自立相談支援機関による相談支援'] = true;
  }

  if (calcuatedHouseHold.困りごと['妊娠について']) {
    if (prefecture === '埼玉県' && city === '富士見市') {
      calcuatedHouseHold.制度['富士見市出産・子育て応援給付金'] = true;
    }

    calcuatedHouseHold.制度['妊婦健診の助成'] = true;
    calcuatedHouseHold.制度['産前産後休業（産休）'] = true;
    calcuatedHouseHold.制度['低所得世帯向けの入院助産制度'] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民年金に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）'
    ] = true;
  }

  if (calcuatedHouseHold.困りごと['出産や子育てについて']) {
    if (prefecture === '埼玉県' && city === '富士見市') {
      calcuatedHouseHold.制度['富士見市産後ケア事業'] = true;
      calcuatedHouseHold.制度['富士見市こども医療費助成'] = true;
      calcuatedHouseHold.制度['富士見市出産・子育て応援給付金'] = true;
    }

    calcuatedHouseHold.制度[
      '出産育児一時金（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '出産育児一時金（共済組合、協会けんぽまたは健康保険組合に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度['出産手当金（会社員・公務員向け）'] = true;
    calcuatedHouseHold.制度['育児休業給付金'] = true;
    calcuatedHouseHold.制度[
      '高額療養費制度（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（国民年金に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '健康保険・年金の減免制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度['ひとり親家庭等医療費助成'] = true;
    calcuatedHouseHold.制度['未熟児養育医療費助成'] = true;
    calcuatedHouseHold.制度['小児慢性特定疾患医療費助成'] = true;
  }

  if (calcuatedHouseHold.困りごと['進学について']) {
    if (prefecture === '埼玉県') {
      calcuatedHouseHold.制度['埼玉県母子寡婦福祉資金貸付金'] = true;
      calcuatedHouseHold.制度['埼玉県私立学校の父母負担軽減'] = true;
    }

    calcuatedHouseHold.制度['給付型奨学金'] = true;
  }

  if (calcuatedHouseHold.困りごと['介護について']) {
    calcuatedHouseHold.制度['介護保険制度'] = true;
    calcuatedHouseHold.制度['介護休業制度'] = true;
    calcuatedHouseHold.制度['介護保険料の減免'] = true;
    calcuatedHouseHold.制度['老人介護手当'] = true;
    calcuatedHouseHold.制度['介護保険サービス利用者負担助成金'] = true;
  }

  if (calcuatedHouseHold.困りごと['入院について']) {
    calcuatedHouseHold.制度[
      '高額療養費制度（国民健康保険に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度[
      '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）'
    ] = true;
    calcuatedHouseHold.制度['医療費控除（確定申告）'] = true;
  }

  if (calcuatedHouseHold.困りごと['病気や障害について']) {
    calcuatedHouseHold.制度[
      '身体障害者手帳・療育手帳・精神障害者保健福祉手帳'
    ] = true;
    calcuatedHouseHold.制度['自立支援医療'] = true;
    calcuatedHouseHold.制度['重度障害者医療費助成'] = true;
    calcuatedHouseHold.制度['指定難病医療給付制度'] = true;
    calcuatedHouseHold.制度['障がい者向けの就労支援'] = true;
  }

  if (calcuatedHouseHold.困りごと['離婚について']) {
    calcuatedHouseHold.制度['ひとり親家庭等医療費助成'] = true;
    calcuatedHouseHold.制度['養育費に関する公正証書等の作成費用補助'] = true;
    calcuatedHouseHold.制度['子どものための養育費相談'] = true;
  }

  return calcuatedHouseHold;
};
