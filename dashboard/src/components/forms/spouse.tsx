import { useContext, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Center, Checkbox, UnorderedList, ListItem } from '@chakra-ui/react';

import configData from '../../config/app_config.json';
import { HouseholdContext } from '../../contexts/HouseholdContext';
import { CurrentDateContext } from '../../contexts/CurrentDateContext';
import { Birthday } from './attributes/Birthday';
import { Income } from './attributes/Income';
import { Disability } from './attributes/Disability';
import { Student } from './attributes/Student';
import { Working } from './attributes/Working';
import { Recuperation } from './attributes/Recuperation';
import { NursingHome } from './attributes/NursingHome';

export const FormSpouse = () => {
  const location = useLocation();
  const isSimpleCalculation = location.pathname === '/calculate-simple';

  const currentDate = useContext(CurrentDateContext);
  const [isChecked, setIsChecked] = useState(false);
  const { household, setHousehold } = useContext(HouseholdContext);
  const spouseName = '配偶者';

  // チェックボックスの値が変更された時
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newHousehold = { ...household };

      if (event.target.checked) {
        newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当 = {
          [currentDate]: true,
        };
      } else {
        newHousehold.世帯.世帯1.配偶者がいるがひとり親に該当 = {
          [currentDate]: false,
        };
      }

      setHousehold({ ...newHousehold });
      setIsChecked(event.target.checked);
    },
    [currentDate, household, setHousehold],
  );

  return (
    <>
      {household.世帯.世帯1.配偶者一覧 && (
        <>
          <Box bg="white" borderRadius="xl" p={4} m={4}>
            <Center fontSize={configData.style.subTitleFontSize} fontWeight="medium" mb="0.5em">
              {configData.calculationForm.spouseDescription}
            </Center>

            {!isSimpleCalculation && <Birthday personName={spouseName} mustInput={true} />}
            <Income personName={spouseName} mustInput={true} />
            {!isSimpleCalculation && <Student personName={spouseName} />}
            {!isSimpleCalculation && <Working personName={spouseName} />}
            {!isSimpleCalculation && <Disability personName={spouseName} />}
            {!isSimpleCalculation && <Recuperation personName={spouseName} />}
            {!isSimpleCalculation && <NursingHome personName={spouseName} />}

            {!isSimpleCalculation && (
              <>
                <Checkbox colorScheme="cyan" checked={isChecked} onChange={onChange}>
                  以下のいずれかに当てはまる
                </Checkbox>
                <UnorderedList ml={8} mt={1}>
                  <ul>
                    <ListItem>重度の障害がある</ListItem>
                    <ListItem>生死が不明</ListItem>
                    <ListItem>子を1年以上遺棄している</ListItem>
                    <ListItem>裁判所からのDV保護命令を受けた</ListItem>
                    <ListItem>法令により1年以上拘禁されている</ListItem>
                  </ul>
                  <br></br>
                </UnorderedList>
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};
