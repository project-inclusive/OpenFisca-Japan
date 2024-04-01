import { useState, useEffect } from 'react';
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

export const SchoolYear = ({
  personName,
  mustInput,
}: {
  personName: string;
  mustInput: boolean;
}) => {
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [schoolYear, setSchoolYear] = useState<number>();
  const [schoolEducationalAuthority, setschoolEducationalAuthority] =
    useState<string>();
  const [suffix, setSuffix] = useState<string>();

  function handleSchoolYearChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSchoolYear(Number(event.currentTarget.value));
  }

  const ignoreSchoolYear: Array<string> = ['高校卒業後相当', '小学校入学前'];

  // 教育機関の情報
  const schoolInfo = [
    {
      minAge: 0,
      maxAge: 6,
      building: '小学校入学前',
      diff: 0,
      suffix: '',
    },
    {
      minAge: 7,
      maxAge: 12,
      building: '小学校',
      diff: 6,
      suffix: '年生',
    },
    {
      minAge: 13,
      maxAge: 15,
      building: '中学校',
      diff: 12,
      suffix: '年生',
    },
    {
      minAge: 16,
      maxAge: 18,
      building: '高等学校',
      diff: 15,
      suffix: '年生相当',
    },
    {
      minAge: 16,
      maxAge: 999,
      building: '高校卒業後相当',
      diff: 0,
      suffix: '',
    },
  ];

  // 誕生日が変更された時に実行される処理
  useEffect(() => {
    const age =
      new Date().getFullYear() -
      new Date(household.世帯員[personName].誕生年月日?.ETERNITY).getFullYear();

    for (const info of schoolInfo) {
      // 20歳以降は変化がないのでフィルタリング
      if (age >= info.minAge && age <= info.maxAge && age < 20) {
        setschoolEducationalAuthority(info.building);
        setSuffix(info.suffix);
        break;
      }
    }
    console.log('[DEBUG] household -> ', household);
  }, [household.世帯員[personName].誕生年月日?.ETERNITY]);

  useEffect(() => {
    if (!schoolYear) {
      console.log('[DEBUG] schoolYear is not set');
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

    console.log('[DEBUG] maximum -> ', maximum);

    // 学年が最大値を超えていた場合、最大値に設定
    if (schoolYear > maximum) {
      setSchoolYear(maximum);
    }

    // 現在の学年と年齢との差を足して年齢を計算
    const age =
      schoolYear +
      Number(
        schoolInfo.find((info) => info.building === schoolEducationalAuthority)
          ?.diff
      );
    const date = new Date();
    date.setFullYear(date.getFullYear() - age); // 誕生年を計算

    const newHousehold = {
      ...household,
    };

    newHousehold.世帯員[personName].誕生年月日 = {
      ETERNITY: `${date.getFullYear()}-01-01`,
    };
    newHousehold.世帯員[personName].学校教育機関 = schoolEducationalAuthority;
    newHousehold.世帯員[personName].学年 = Number(schoolYear);

    setHousehold(newHousehold);

    // デバッグ用
    console.log('[DEBUG] schoolYear -> ', schoolYear);
    console.log(
      '[DEBUG] schoolEducationalAuthority -> ',
      schoolEducationalAuthority
    );

    // 学年に応じたsuffixを設定
    setSuffix(
      schoolInfo.find((info) => info.building === schoolEducationalAuthority)
        ?.suffix
    );
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
                type="number"
                value={schoolYear}
                pattern="[0-9]*"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9]/g,
                    ''
                  );
                }}
                onChange={handleSchoolYearChange}
              />
            )}
          {suffix && <Box>{suffix}</Box>}
        </HStack>
      </FormControl>
    </>
  );
};
