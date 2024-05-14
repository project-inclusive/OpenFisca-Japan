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

import { ErrorMessage } from './validation/ErrorMessage';
import { householdAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';

export const SchoolYear = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
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

  // 誕生日が変更された時に実行される処理
  useEffect(() => {
    const age =
      new Date().getFullYear() -
      new Date(household.世帯員[personName].誕生年月日?.ETERNITY).getFullYear();

    const birthday = new Date(
      household.世帯員[personName].誕生年月日?.ETERNITY
    );
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
    //console.log('[DEBUG] household -> ', household);
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

    //console.log('[DEBUG] maximum -> ', maximum);

    // 学年が最大値を超えていた場合、最大値に設定
    if (Number(schoolYear) > maximum) {
      setSchoolYear(maximum);
    }

    // デバッグ用
    //console.log('[DEBUG] schoolYear -> ', schoolYear);
    // console.log(
    //   '[DEBUG] schoolEducationalAuthority -> ',
    //   schoolEducationalAuthority
    // );
  }, [schoolYear, schoolEducationalAuthority]);

  return (
    <>
      {mustInput && (
        <ErrorMessage condition={!schoolEducationalAuthority || !schoolYear} />
      )}
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
            width="13em"
            value={schoolEducationalAuthority}
            placeholder="学校教育機関"
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
                type="text"
                value={schoolYear}
                onChange={handleSchoolYearChange}
              />
            )}
          {suffix && <Box>{suffix}</Box>}
        </HStack>
      </FormControl>
    </>
  );
};
