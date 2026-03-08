import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Select,
  HStack,
  FormControl,
  FormLabel,
  Center,
  Text,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import pmJson from '../../../config/都道府県市区町村.json';

import { ErrorMessage } from '../../forms/validation/ErrorMessage';
import { useRecoilState } from 'recoil';
import { questionValidatedAtom } from '../../../state';
import { AddressQuestion } from '../../../state/questionDefinition';

export const AddressQuestionTemplate = ({
  assignFunc,
  initialValue,
}: {
  assignFunc: (question: AddressQuestion) => void;
  initialValue: AddressQuestion;
}) => {
  const [questionValidated, setQuestionValidated] = useRecoilState(
    questionValidatedAtom
  );

  interface pmType {
    [key: string]: string[];
  }
  const pmObj = { ...pmJson } as pmType;

  // TODO: 初期値設定
  const [selectedPrefecture, setSelectedPrefecture] = useState(
    initialValue.prefecure ?? ('' as string)
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    initialValue.municipality ?? ('' as string)
  );
  const prefectureArray = Object.keys(pmObj);

  useEffect(() => {
    setQuestionValidated(
      selectedPrefecture !== '' && selectedMunicipality !== ''
    );
  }, [selectedPrefecture, selectedMunicipality]);

  // prefectureの値が変更された時
  const onPrefectureChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const prefecture = String(event.currentTarget.value);
      setSelectedPrefecture(prefecture);
      setSelectedMunicipality('');
      assignFunc({ type: 'Address', prefecure: prefecture, municipality: '' });
    },
    []
  );

  // municipalityの値が変更された時
  const onMunicipalityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const municipality = String(event.currentTarget.value);
      setSelectedMunicipality(municipality);
      assignFunc({
        type: 'Address',
        prefecure: selectedPrefecture,
        municipality: municipality,
      });
    },
    [selectedPrefecture]
  );

  return (
    <VStack>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.itemFontSize}>
          <Center>
            <HStack>
              <Box
                fontSize={configData.style.subTitleFontSize}
                textAlign="center"
              >
                寝泊まりしている地域
              </Box>
            </HStack>
          </Center>
        </FormLabel>

        <Center>
          <HStack mt={8} mb={8}>
            <Select
              height="3.5em"
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
              height="3.5em"
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
        </Center>
      </FormControl>
    </VStack>
  );
};
