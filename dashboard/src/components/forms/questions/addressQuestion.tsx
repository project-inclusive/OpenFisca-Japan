import { useState, useCallback, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import {
  Box,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Center,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import pmJson from '../../../config/都道府県市区町村.json';

import { ErrorMessage } from '../attributes/validation/ErrorMessage';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentDateAtom,
  householdAtom,
  questionValidatedAtom,
} from '../../../state';

// TODO: タイトルやonClickを引数で変更可能にする
export const AddressQuestion = () => {
  const navigationType = useNavigationType();
  const [household, setHousehold] = useRecoilState(householdAtom);
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  interface pmType {
    [key: string]: string[];
  }
  const pmObj = { ...pmJson } as pmType;

  const currentDate = useRecoilValue(currentDateAtom);
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const prefectureArray = Object.keys(pmObj);

  // prefectureの値が変更された時
  const onPrefectureChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const prefecture = String(event.currentTarget.value);
      setSelectedPrefecture(prefecture);
      setSelectedMunicipality('');
      setQuestionValidated(prefecture !== '' && selectedMunicipality !== '');
      const newHousehold = { ...household };
      newHousehold.世帯一覧.世帯1.居住都道府県 = {
        [currentDate]: prefecture,
      };
      if (prefecture === '東京都') {
        newHousehold.世帯一覧.世帯1.児童育成手当 = {
          [currentDate]: null,
        };
        newHousehold.世帯一覧.世帯1.障害児童育成手当 = {
          [currentDate]: null,
        };
        newHousehold.世帯一覧.世帯1.重度心身障害者手当_最小 = {
          [currentDate]: null,
        };
        newHousehold.世帯一覧.世帯1.重度心身障害者手当_最大 = {
          [currentDate]: null,
        };
        newHousehold.世帯一覧.世帯1.受験生チャレンジ支援貸付 = {
          [currentDate]: null,
        };
      } else {
        if ('児童育成手当' in newHousehold.世帯一覧.世帯1) {
          delete newHousehold.世帯一覧.世帯1.児童育成手当;
        }
        if ('障害児童育成手当' in newHousehold.世帯一覧.世帯1) {
          delete newHousehold.世帯一覧.世帯1.障害児童育成手当;
        }
        if ('重度心身障害者手当_最小' in newHousehold.世帯一覧.世帯1) {
          delete newHousehold.世帯一覧.世帯1.重度心身障害者手当_最小;
        }
        if ('重度心身障害者手当_最大' in newHousehold.世帯一覧.世帯1) {
          delete newHousehold.世帯一覧.世帯1.重度心身障害者手当_最大;
        }
        if ('受験生チャレンジ支援貸付' in newHousehold.世帯一覧.世帯1) {
          delete newHousehold.世帯一覧.世帯1.受験生チャレンジ支援貸付;
        }
      }
      setHousehold({ ...newHousehold });
    },
    []
  );

  // municipalityの値が変更された時
  const onMunicipalityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const municipality = String(event.currentTarget.value);
      setSelectedMunicipality(municipality);
      setQuestionValidated(municipality !== '');

      const newHousehold = { ...household };
      newHousehold.世帯一覧.世帯1.居住市区町村 = {
        [currentDate]: municipality,
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  // stored states set displayed value when page transition
  useEffect(() => {
    const householdObj = household.世帯一覧.世帯1;
    if (householdObj.居住都道府県) {
      setSelectedPrefecture(householdObj.居住都道府県[currentDate]);
    }
    if (householdObj.居住市区町村) {
      setSelectedMunicipality(householdObj.居住市区町村[currentDate]);
    }
  }, [navigationType]);

  return (
    <>
      <ErrorMessage />

      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <Center>
            <HStack>
              <Box fontSize={configData.style.itemFontSize}>
                寝泊まりしている地域
              </Box>
            </HStack>
          </Center>
        </FormLabel>

        <HStack mb={4}>
          <Select
            data-testid="select-prefecture"
            value={selectedPrefecture}
            onChange={onPrefectureChange}
            fontSize={configData.style.itemFontSize}
            width={configData.style.selectPrefectureSize}
            placeholder="都道府県"
          >
            {prefectureArray.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            data-testid="select-city"
            value={selectedMunicipality}
            onChange={onMunicipalityChange}
            fontSize={configData.style.itemFontSize}
            width={configData.style.selectPrefectureSize}
            placeholder="市区町村"
          >
            {selectedPrefecture &&
              pmObj[selectedPrefecture].map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
          </Select>
        </HStack>
      </FormControl>
    </>
  );
};
