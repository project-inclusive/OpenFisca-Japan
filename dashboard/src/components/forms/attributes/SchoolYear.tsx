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
  const [schoolYear, setSchoolYear] = useState<string>();
  const [schoolEducationalAuthority, setschoolEducationalAuthority] =
    useState<string>();
  const [suffix, setSuffix] = useState<string>();

  function handleSchoolYearChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSchoolYear(event.currentTarget.value);
  }

  // 教育機関の情報
  const schoolInfo = [
    {
      minAge: 0,
      maxAge: 6,
      building: '小学校入学前',
      yearCalc: () => '',
      suffix: () => '',
    },
    {
      minAge: 7,
      maxAge: 12,
      building: '小学校',
      yearCalc: (age: number) => String(age - 6),
      suffix: (age: number) => '年生',
    },
    {
      minAge: 13,
      maxAge: 15,
      building: '中学校',
      yearCalc: (age: number) => String(age - 12),
      suffix: () => '年生',
    },
    {
      minAge: 16,
      maxAge: 18,
      building: '高等学校',
      yearCalc: (age: number) => String(age - 15),
      suffix: () => '年生',
    },
    {
      minAge: 16,
      maxAge: 999,
      building: '高校卒業後相当',
      yearCalc: () => '',
      suffix: () => '',
    },
  ];

  // 誕生日が変更された時に実行される処理
  useEffect(() => {
    if (household.世帯員[personName].誕生年月日?.ETERNITY) {
      const age =
        new Date().getFullYear() -
        new Date(
          household.世帯員[personName].誕生年月日?.ETERNITY
        ).getFullYear();

      for (const info of schoolInfo) {
        if (age >= info.minAge && age <= info.maxAge) {
          setSchoolYear(info.yearCalc(age));
          setschoolEducationalAuthority(info.building);
          setSuffix(info.suffix(age));
          break;
        }
      }
    }
  }, [household.世帯員[personName].誕生年月日?.ETERNITY]);

  // State用の変数が変更された時に実行される処理
  useEffect(() => {
    if (schoolYear && schoolEducationalAuthority) {
      const newHousehold = {
        ...household,
      };
      newHousehold.世帯員[personName].学校教育機関 = schoolEducationalAuthority;
      newHousehold.世帯員[personName].学年 = Number(schoolYear);
      setHousehold(newHousehold);
    }
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

          {schoolEducationalAuthority !== '高校卒業後相当' &&
            schoolEducationalAuthority !== '小学校入学前' && (
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
