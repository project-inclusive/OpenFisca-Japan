import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Center,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';

import { ErrorMessage } from '../../forms/validation/ErrorMessage';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';

import { toHalf } from '../../../utils/toHalf';
import {
  isChrome,
  isChromium,
  isEdge,
  isMobile,
  isWindows,
} from 'react-device-detect';
import { AgeQuestion } from '../../../state/questionDefinition';

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

const ignoreSchoolYear: Array<string> = ['高校卒業後相当', '小学校入学前'];

export const ChildrenAgeQuestionTemplate = ({
  assignFunc,
  initialValue,
}: {
  assignFunc: (question: AgeQuestion) => void;
  initialValue?: AgeQuestion;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );
  const [ageState, setAgeState] = useState<number | undefined>(
    initialValue?.selection
  );

  // 学年に関する状態
  const [schoolYear, setSchoolYear] = useState<number | string>('');
  const [schoolEducationalAuthority, setSchoolEducationalAuthority] =
    useState<string>('');
  const [suffix, setSuffix] = useState<string>();

  useEffect(() => {
    setQuestionValidated(ageState != null);
  }, [ageState, initialValue]);

  const changeAge = (age: number | undefined) => {
    if (typeof age === 'number' && age < 0) {
      setAgeState(0);
      assignFunc({ type: 'Age', selection: 0 });
      return;
    }
    setAgeState(age);
    assignFunc({ type: 'Age', selection: age });
  };

  // householdのbirthdayを更新（学年から誕生日を計算）
  const calcBirthdayFromSchoolYear = useCallback(
    (
      inputSchoolYear: number,
      inputSchoolEducationalAuthority: string | undefined
    ) => {
      const age =
        inputSchoolYear +
        Number(
          schoolInfo.find(
            (info) => info.building === inputSchoolEducationalAuthority
          )?.diff
        );
      changeAge(age);
    },
    []
  );

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string = toHalf(event.currentTarget.value) ?? '';
    value = value.replace(/[^0-9]/g, '');

    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        changeAge(ageState);
        return;
      }
    }

    setQuestionValidated(value !== '');

    if (value === '') {
      setAgeState(undefined);
      return;
    }

    const numValue = Number(value);
    const inputAge = numValue < 0 || numValue > 200 ? 200 : numValue; // 0~200歳に入力を制限
    changeAge(inputAge);
  };

  function handleSchoolYearChange(event: React.ChangeEvent<HTMLInputElement>) {
    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        return;
      }
    }

    let value: number | string = toHalf(event.currentTarget.value);
    value = value.replace(/[^0-9]/g, '');
    value = parseInt(value);

    if (value) {
      setSchoolYear(value);
      calcBirthdayFromSchoolYear(Number(value), schoolEducationalAuthority);
    } else {
      setSchoolYear('');
    }
  }

  // 年齢が変更された時に学年フォームを更新
  useEffect(() => {
    if (ageState == null) return;

    // その年の1/1生まれとして計算
    const birthday = new Date(
      new Date().getFullYear() - ageState,
      0, // January
      1
    );
    const birthBeforeApril1th =
      birthday.getMonth() < 3 ||
      (birthday.getMonth() == 3 && birthday.getDate() == 1);
    const afterApril = new Date().getMonth() >= 3;
    const totalSchoolYear =
      ageState + Number(birthBeforeApril1th) + Number(afterApril) - 7;

    for (const info of schoolInfo) {
      if (
        totalSchoolYear >= info.minTotalSchoolYear &&
        totalSchoolYear <= info.maxTotalSchoolYear
      ) {
        const newSchoolEducationalAuthority = info.building;
        const newSchoolYear = totalSchoolYear - info.diff + 6;
        setSchoolEducationalAuthority(newSchoolEducationalAuthority);
        setSchoolYear(newSchoolYear);
        setSuffix(info.suffix);
        break;
      }
    }
  }, [ageState]);

  // 学校教育機関が変更された時にsuffixを更新
  useEffect(() => {
    if (schoolEducationalAuthority) {
      setSuffix(
        schoolInfo.find((info) => info.building === schoolEducationalAuthority)
          ?.suffix
      );
    }

    if (!schoolYear) return;

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

    if (Number(schoolYear) > maximum) {
      setSchoolYear(maximum);
    }
  }, [schoolYear, schoolEducationalAuthority]);

  return (
    <VStack flex={1}>
      <ErrorMessage />
      <HStack>
        <FormControl paddingRight={4}>
          <FormLabel fontSize={configData.style.subTitleFontSize}>
            <Center>
              <HStack>
                <Box>年齢</Box>
              </HStack>
            </Center>
          </FormLabel>

          <HStack mt={8} mb={8}>
            <Input
              width="3em"
              height="3.5em"
              fontSize={configData.style.itemFontSize}
              type={isMobile ? 'number' : 'text'}
              value={ageState ?? ''}
              onChange={handleAgeChange}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  changeAge(ageState ? ageState + 1 : 1);
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const newAge = ageState ? Math.max(ageState - 1, 0) : 0;
                    changeAge(Number(newAge === 0 ? undefined : newAge));
                  }
                }
              }}
              {...(isMobile && { pattern: '[0-9]*' })}
            />
            <Box>歳</Box>
          </HStack>
        </FormControl>
        <FormControl>
          <FormLabel fontSize={configData.style.subTitleFontSize}>
            <Center>
              <HStack>
                <Box>学年</Box>
              </HStack>
            </Center>
          </FormLabel>

          <HStack mt={8} mb={8}>
            <Select
              width={
                ignoreSchoolYear.includes(schoolEducationalAuthority)
                  ? '11em'
                  : '7em'
              }
              height="3.5em"
              value={schoolEducationalAuthority}
              placeholder="学校教育機関"
              fontSize={configData.style.itemFontSize}
              onChange={(e: any) => {
                setSchoolEducationalAuthority(
                  e.target.value as typeof schoolEducationalAuthority
                );

                if (schoolYear) {
                  calcBirthdayFromSchoolYear(
                    Number(schoolYear),
                    e.target.value as typeof schoolEducationalAuthority
                  );
                }
                setQuestionValidated(ageState != null);
              }}
            >
              {schoolInfo.map((item, index) => (
                <option value={item.building} key={index}>
                  {item.building}
                </option>
              ))}
            </Select>

            {!ignoreSchoolYear.includes(schoolEducationalAuthority) &&
              typeof schoolEducationalAuthority !== 'undefined' &&
              schoolEducationalAuthority !== '' && (
                <Input
                  width="3em"
                  height="3.5em"
                  fontSize={configData.style.itemFontSize}
                  type={isMobile ? 'number' : 'text'}
                  value={schoolYear}
                  onChange={handleSchoolYearChange}
                  {...(isMobile && { pattern: '[0-9]*' })}
                />
              )}
            {suffix && <Box whiteSpace="nowrap">{suffix}</Box>}
          </HStack>
        </FormControl>
      </HStack>
    </VStack>
  );
};
