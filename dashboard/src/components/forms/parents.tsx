import { useContext } from "react";
import { Box, Center, Checkbox } from "@chakra-ui/react";

import configData from "../../app_config.json";
import { HouseholdContext } from "../../contexts/HouseholdContext";
import { Birthday } from "./attributes/Birthday";
import { Disability } from "./attributes/Disability";

export const FormParents = () => {
  const { household, setHousehold } = useContext(HouseholdContext);
  // 「あなた」の情報を上書きしないよう除外
  const parents = household.世帯.世帯1.保護者一覧.filter((name: string, _index: number) => name !== "あなた");
  return (
    <>
      {parents &&
        parents.map(
          (parentName: string, index: number) => (
            <div key={index}>
              <Box bg="white" borderRadius="xl" p={4} m={4}>
                <Center
                  fontSize={configData.style.subTitleFontSize}
                  fontWeight="medium"
                  mb="0.5em"
                >
                  {configData.calculationForm.parentDescription}
                  {`（${index+1}人目）`}
                </Center>
                <Birthday personName={parentName} mustInput={true} />
                <Disability personName={parentName} />
              </Box>
            </div>
          )
        )}
    </>
  );
};
