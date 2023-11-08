import { useState, useCallback, useContext, useMemo, useEffect } from 'react';
import { Box, Select, HStack, FormControl, FormLabel } from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import pmJson from '../../../config/都道府県市区町村.json';
import { HouseholdContext } from '../../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../../contexts/CurrentDateContext';
import { ErrorMessage } from './validation/ErrorMessage';

export const PrefectureMunicipality = ({
  mustInput,
}: {
  mustInput: boolean;
}) => {
  const { household, setHousehold } = useContext(HouseholdContext);

  interface pmType {
    [key: string]: string[];
  }
  const pmObj = { ...pmJson } as pmType;

  const currentDate = useContext(CurrentDateContext);
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const prefectureArray = Object.keys(pmObj);

  // prefectureの値が変更された時
  const onPrefectureChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const prefecture = String(event.currentTarget.value);
      setSelectedPrefecture(prefecture);
      setSelectedMunicipality('');
      const newHousehold = { ...household };
      newHousehold.世帯.世帯1.居住都道府県 = {
        [currentDate]: prefecture,
      };
      if (prefecture === '東京都') {
        newHousehold.世帯.世帯1.児童育成手当 = {
          [currentDate]: null,
        };
        newHousehold.世帯.世帯1.障害児童育成手当 = {
          [currentDate]: null,
        };
        newHousehold.世帯.世帯1.重度心身障害者手当_最小 = {
          [currentDate]: null,
        };
        newHousehold.世帯.世帯1.重度心身障害者手当_最大 = {
          [currentDate]: null,
        };
        newHousehold.世帯.世帯1.受験生チャレンジ支援貸付 = {
          [currentDate]: null,
        };
      } else {
        if ('児童育成手当' in newHousehold.世帯.世帯1) {
          delete newHousehold.世帯.世帯1.児童育成手当;
        }
        if ('障害児童育成手当' in newHousehold.世帯.世帯1) {
          delete newHousehold.世帯.世帯1.障害児童育成手当;
        }
        if ('重度心身障害者手当_最小' in newHousehold.世帯.世帯1) {
          delete newHousehold.世帯.世帯1.重度心身障害者手当_最小;
        }
        if ('重度心身障害者手当_最大' in newHousehold.世帯.世帯1) {
          delete newHousehold.世帯.世帯1.重度心身障害者手当_最大;
        }
        if ('受験生チャレンジ支援貸付' in newHousehold.世帯.世帯1) {
          delete newHousehold.世帯.世帯1.受験生チャレンジ支援貸付;
        }
      }
      console.log(newHousehold);
      setHousehold({ ...newHousehold });
    },
    []
  );

  // municipalityの値が変更された時
  const onMunicipalityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const municipality = String(event.currentTarget.value);
      setSelectedMunicipality(municipality);

      const newHousehold = { ...household };
      newHousehold.世帯.世帯1.居住市区町村 = {
        [currentDate]: municipality,
      };
      setHousehold({ ...newHousehold });
    },
    []
  );

  return (
    <>
      {mustInput && (
        <ErrorMessage
          condition={selectedPrefecture === '' || selectedMunicipality === ''}
        />
      )}

      <FormControl>
        <FormLabel
          fontSize={configData.style.itemFontSize}
          fontWeight="Regular"
        >
          <HStack>
            <Box fontSize={configData.style.itemFontSize}>
              寝泊まりしている地域
            </Box>
            {mustInput && (
              <Box color="red" fontSize="0.7em">
                必須
              </Box>
            )}
          </HStack>
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
