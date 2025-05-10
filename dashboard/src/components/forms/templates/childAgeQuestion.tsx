import { useState, useEffect, useCallback } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { Question } from '../question';

// TODO: タイトルやonClickを引数で変更可能にする
export const ChildAgeQuestion = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);

  // 年齢に関する処理
  const [age, setAge] = useState<string | number>('');

  function changeAge(age: number) {
    setAge(age);

    if (typeof age === 'number' && age >= 0) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const birthYear = currentYear - age;
      const newHousehold = {
        ...household,
      };
      newHousehold.世帯員[personName].誕生年月日 = {
        ETERNITY: `${birthYear.toString()}-01-01`,
      };
      setHousehold(newHousehold);
    }
  }

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string = toHalf(event.currentTarget.value) ?? '';
    value = value.replace(/[^0-9]/g, '');

    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        // 前回と同じ値を設定して終了
        // （設定しないままreturnすると未変換の全角入力が残ってしまいエンターキーを押すまで反映できなくなってしまう）
        changeAge(Number(age));
        return;
      }
    }

    // If empty string, set as is
    if (value === '') {
      setAge('');
      return;
    }

    const numValue = Number(value);
    const inputAge = numValue < 0 || numValue > 200 ? '' : numValue; // 0~200歳に入力を制限(年齢が高すぎて誕生年が3桁になるとパース処理が煩雑なため)
    changeAge(Number(inputAge));
  };

  // 学年に関する処理
  const [schoolYear, setSchoolYear] = useState<number | string>('');
  const [schoolEducationalAuthority, setschoolEducationalAuthority] =
    useState<string>();
  const [suffix, setSuffix] = useState<string>();

  const ignoreSchoolYear: Array<string> = ['高校卒業後相当', '小学校入学前'];

  // 教育機関の情報
  const schoolInfo = [
    {
      minAge: 0,
      maxAge: 6,
      minTotalSchoolYear: -6,
      maxTotalSchoolYear: 0,
      building: '小学校入学前',
      diff: 0,
      suffix: '',
    },
    {
      minAge: 7,
      maxAge: 12,
      minTotalSchoolYear: 1,
      maxTotalSchoolYear: 6,
      building: '小学校',
      diff: 6,
      suffix: '年生',
    },
    {
      minAge: 13,
      maxAge: 15,
      minTotalSchoolYear: 7,
      maxTotalSchoolYear: 9,
      building: '中学校',
      diff: 12,
      suffix: '年生',
    },
    {
      minAge: 16,
      maxAge: 18,
      minTotalSchoolYear: 10,
      maxTotalSchoolYear: 12,
      building: '高等学校',
      diff: 15,
      suffix: '年生相当',
    },
    {
      minAge: 16,
      maxAge: 999,
      minTotalSchoolYear: 13,
      maxTotalSchoolYear: 999,
      building: '高校卒業後相当',
      diff: 0,
      suffix: '',
    },
  ];

  function handleSchoolYearChange(event: React.ChangeEvent<HTMLInputElement>) {
    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        // 前回と同じ値を設定して終了
        // （設定しないままreturnすると未変換の全角入力が残ってしまいエンターキーを押すまで反映できなくなってしまう）
        setHousehold({ ...household });
        return;
      }
    }

    let value: number | string = toHalf(event.currentTarget.value);
    value = value.replace(/[^0-9]/g, '');
    value = parseInt(value);

    if (value) {
      setSchoolYear(value);
      //console.log('[DEBUG] schoolYear ->', schoolYear);
      setBirthday(Number(value), schoolEducationalAuthority);
    } else {
      setSchoolYear('');
    }
  }

  // householdのbirthdayを更新
  const setBirthday = useCallback(
    (
      inputSchoolYear: number,
      inputSchoolEducationalAuthority: string | undefined
    ) => {
      // 現在の学年と年齢との差を足して年齢を計算
      const age =
        inputSchoolYear +
        Number(
          schoolInfo.find(
            (info) => info.building === inputSchoolEducationalAuthority
          )?.diff
        );
      const date = new Date();
      date.setFullYear(date.getFullYear() - age); // 誕生年を計算

      const newHousehold = {
        ...household,
      };

      // 現在が4月以降か以前で異なる誕生日を設定
      if (date.getMonth() >= 3) {
        // 例：現在2024/4/2 で8歳と入力されると誕生日は2016/1/1 に設定され、学年は小3と表示される。
        // ただし、小2の可能性もあるため、学年が小2に変更されたとき誕生日に2016/4/2 を設定すると
        // 年齢は8歳のままにできる。
        // (4/1のときは年齢と学年が一意のペアとして定まる。)
        newHousehold.世帯員[personName].誕生年月日 = {
          ETERNITY: `${date.getFullYear()}-04-02`,
        };
      } else {
        // 例：現在2024/3/31 で8歳と入力されると誕生日は2016/1/1 に設定され、学年は小2と表示される。
        // ただし、小3の可能性もあるため、学年が小3に変更されたとき誕生日に2015/4/1 を設定すると
        // 年齢は8歳のままにできる。
        newHousehold.世帯員[personName].誕生年月日 = {
          ETERNITY: `${date.getFullYear()}-04-01`,
        };
      }

      setHousehold(newHousehold);
    },
    []
  );

  // 年齢が変更された時に実行される処理
  useEffect(() => {
    // 年齢フォームの更新
    const birthdayObj = household.世帯員[personName].誕生年月日;
    if (birthdayObj && birthdayObj.ETERNITY) {
      const birthYear = Number(birthdayObj.ETERNITY.substring(0, 4));
      const birthMonth = Number(birthdayObj.ETERNITY.substring(5, 7));
      const birthDate = Number(birthdayObj.ETERNITY.substring(8));
      const birthSum = 10000 * birthYear + 100 * birthMonth + birthDate;
      const today = new Date();
      const todaySum =
        10000 * today.getFullYear() +
        100 * (today.getMonth() + 1) +
        today.getDate();
      setAge(Math.floor((todaySum - birthSum) / 10000));
    }

    // 学年フォームの更新
    const age =
      new Date().getFullYear() - new Date(birthdayObj?.ETERNITY).getFullYear();

    const birthday = new Date(birthdayObj?.ETERNITY);
    const birthBeforeApril1th =
      birthday.getMonth() < 3 ||
      (birthday.getMonth() == 3 && birthday.getDate() == 1);
    const afterApril = new Date().getMonth() >= 3;
    // 小学L年生をL, 中学M年生をM+6, 高校N年生をN+9 で表す
    const totalSchoolYear =
      age + Number(birthBeforeApril1th) + Number(afterApril) - 7;

    for (const info of schoolInfo) {
      // 20歳以降は変化がないのでフィルタリング
      if (
        totalSchoolYear >= info.minTotalSchoolYear &&
        totalSchoolYear <= info.maxTotalSchoolYear
      ) {
        setschoolEducationalAuthority(info.building);
        setSchoolYear(totalSchoolYear - info.diff + 6);
        setSuffix(info.suffix);
        break;
      }
    }
  }, [navigationType, household.世帯員[personName].誕生年月日?.ETERNITY]);

  // 学校教育機関と学年が変更された時に実行される処理
  useEffect(() => {
    if (schoolEducationalAuthority) {
      // 学年に応じたsuffixを設定
      setSuffix(
        schoolInfo.find((info) => info.building === schoolEducationalAuthority)
          ?.suffix
      );
    }

    if (!schoolYear) {
      //console.log('[DEBUG] schoolYear is not set');
      return;
    }

    const maximum: number =
      Number(
        schoolInfo.find((info) => info.building === schoolEducationalAuthority)
          ?.maxAge
      ) -
      Number(
        schoolInfo.find((info) => info.building === schoolEducationalAuthority)
          ?.minAge
      ) +
      1;

    // 学年が最大値を超えていた場合、最大値に設定
    if (Number(schoolYear) > maximum) {
      setSchoolYear(maximum);
    }
  }, [schoolYear, schoolEducationalAuthority]);

  return (
    <Question>
      {mustInput && schoolEducationalAuthority !== '小学校入学前' && (
        <ErrorMessage condition={!schoolEducationalAuthority || !schoolYear} />
      )}
      <HStack>
        <FormControl paddingRight={4}>
          <FormLabel
            fontSize={configData.style.itemFontSize}
            fontWeight="Regular"
          >
            <HStack>
              <Box>年齢</Box>
              {mustInput && (
                <Box color="red" fontSize="0.7em">
                  必須
                </Box>
              )}
            </HStack>
          </FormLabel>

          <HStack mb={4}>
            <Input
              width="4em"
              fontSize={configData.style.itemFontSize}
              type={isMobile ? 'number' : 'text'}
              value={age}
              onChange={handleAgeChange}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  changeAge(Number(age) + 1);
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const newAge = Math.max(Number(age) - 1, 0);
                    changeAge(Number(newAge === 0 ? '' : newAge));
                  }
                }
              }}
              {...(isMobile && { pattern: '[0-9]*' })}
            />
            <Box>歳</Box>
          </HStack>
        </FormControl>
        <FormControl>
          <FormLabel
            fontSize={configData.style.itemFontSize}
            fontWeight="Regular"
          >
            <HStack>
              <Box>学年</Box>
              {mustInput && (
                <Box color="red" fontSize="0.7em">
                  必須
                </Box>
              )}
            </HStack>
          </FormLabel>

          <HStack mb={4}>
            <Select
              width="9em"
              value={schoolEducationalAuthority}
              placeholder="学校教育機関"
              fontSize={configData.style.itemFontSize}
              onChange={(e: any) => {
                setschoolEducationalAuthority(
                  e.target.value as typeof schoolEducationalAuthority
                );
                if (schoolYear) {
                  setBirthday(
                    Number(schoolYear),
                    e.target.value as typeof schoolEducationalAuthority
                  );
                }
              }}
            >
              {schoolInfo.map((item, index) => (
                <option value={item.building} key={index}>
                  {item.building}
                </option>
              ))}
            </Select>

            {!ignoreSchoolYear.includes(schoolEducationalAuthority as string) &&
              typeof schoolEducationalAuthority !== 'undefined' &&
              schoolEducationalAuthority !== '' && (
                <Input
                  width="6em"
                  fontSize={configData.style.itemFontSize}
                  type={isMobile ? 'number' : 'text'}
                  value={schoolYear}
                  onChange={handleSchoolYearChange}
                  {...(isMobile && { pattern: '[0-9]*' })}
                />
              )}
            {/* NOTE:  */}
            {suffix && <Box whiteSpace="nowrap">{suffix}</Box>}
          </HStack>
        </FormControl>
      </HStack>
    </Question>
  );
};
