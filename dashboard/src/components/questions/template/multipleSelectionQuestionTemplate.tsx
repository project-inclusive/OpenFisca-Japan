import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';
import {
  MultipleSelectionQuestion,
  MultipleSelectionQuestionKey,
} from '../../../state/questionDefinition';

export const MultipleSelectionQuestionTemplate = <
  T extends MultipleSelectionQuestionKey,
>({
  title,
  selections,
  assignFunc,
  initialValue,
}: {
  title: string;
  selections: readonly string[];
  assignFunc: (question: MultipleSelectionQuestion<T>) => void;
  initialValue?: MultipleSelectionQuestion<T>;
}) => {
  const [, setQuestionValidated] = useRecoilState(questionValidatedAtom);
  const [selectedItems, setSelectedItems] = useState<string[] | undefined>(
    initialValue?.selection
  );

  useEffect(() => {
    // 複数選択は0件でも有効
    setQuestionValidated(true);
  }, []);

  const toggle = (item: string) => {
    const next = selectedItems?.includes(item)
      ? selectedItems.filter((s) => s !== item)
      : [...(selectedItems || []), item];
    setSelectedItems(next);
    assignFunc({ type: 'MultipleSelection', selection: next as any });
  };

  const selectNone = () => {
    setSelectedItems([]);
    assignFunc({ type: 'MultipleSelection', selection: [] as any });
  };

  const neitherSelected = selectedItems?.length === 0;

  return (
    <VStack flex={1}>
      <FormControl>
        <FormLabel fontSize={configData.style.subTitleFontSize}>
          <Center mb={4}>
            <Box
              fontSize={configData.style.subTitleFontSize}
              textAlign="center"
            >
              {title + '（複数選択可）'}
            </Box>
          </Center>
        </FormLabel>

        <VStack mt={8} mb={8}>
          {selections.map((item, index) => (
            <Button
              key={index}
              mb={2}
              variant="outline"
              borderRadius="xl"
              height="3.5em"
              width="100%"
              bg={selectedItems?.includes(item) ? 'cyan.600' : 'white'}
              borderColor={selectedItems?.includes(item) ? 'cyan.900' : 'black'}
              color={selectedItems?.includes(item) ? 'white' : 'black'}
              _hover={
                selectedItems?.includes(item)
                  ? { bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }
                  : undefined
              }
              onClick={() => toggle(item)}
            >
              {item}
            </Button>
          ))}
          <Button
            mb={2}
            variant="outline"
            borderRadius="xl"
            height="3.5em"
            width="100%"
            bg={neitherSelected ? 'cyan.600' : 'white'}
            borderColor={neitherSelected ? 'cyan.900' : 'black'}
            color={neitherSelected ? 'white' : 'black'}
            _hover={{ bg: 'cyan.600', borderColor: 'cyan.900', color: 'white' }}
            onClick={selectNone}
          >
            いずれでもない
          </Button>
        </VStack>
      </FormControl>
    </VStack>
  );
};
