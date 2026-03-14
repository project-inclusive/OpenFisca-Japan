import { useState, useEffect } from 'react';
import {
  Box,
  Center,
  FormControl,
  FormLabel,
  HStack,
  Input,
  VStack,
} from '@chakra-ui/react';

import configData from '../../../config/app_config.json';
import { questionValidatedAtom } from '../../../state';
import { useRecoilState } from 'recoil';
import { PersonNumQuestion } from '../../../state/questionDefinition';
import { toHalf } from '../../../utils/toHalf';
import {
  isMobile,
  isWindows,
  isChrome,
  isEdge,
  isChromium,
} from 'react-device-detect';
import { ErrorMessage } from '../../forms/validation/ErrorMessage';

export const PersonNumQuestionTemplate = ({
  title,
  assignFunc,
  initialValue,
}: {
  title: string;
  assignFunc: (question: PersonNumQuestion) => void;
  initialValue: PersonNumQuestion;
}) => {
  const [, setQuestionValidated] = useRecoilState(questionValidatedAtom);
  const [numState, setNumState] = useState<number | undefined>(
    initialValue.selection
  );

  useEffect(() => {
    setQuestionValidated(numState != null);
  }, [numState]);

  const changeNum = (num: number | undefined) => {
    if (typeof num === 'number' && num < 0) {
      setNumState(0);
      assignFunc({ type: 'PersonNum', selection: 0 });
      return;
    }
    setNumState(num);
    assignFunc({ type: 'PersonNum', selection: num });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value: string = toHalf(event.currentTarget.value) ?? '';
    value = value.replace(/[^0-9]/g, '');

    // NOTE: WindowsのChromium系ブラウザでは全角入力時に2回入力が発生してしまうため、片方を抑制
    if (isWindows && (isChrome || isEdge || isChromium)) {
      if (
        event.nativeEvent instanceof InputEvent &&
        event.nativeEvent.isComposing
      ) {
        changeNum(numState);
        return;
      }
    }

    if (value === '') {
      setNumState(undefined);
      return;
    }

    changeNum(Number(value));
  };

  return (
    <VStack flex={1}>
      <ErrorMessage />
      <FormControl>
        <FormLabel fontSize={configData.style.subTitleFontSize}>
          <Center>
            <Box textAlign="center">{title}</Box>
          </Center>
        </FormLabel>

        <Center>
          <HStack mt={8} mb={8}>
            <Input
              width="100%"
              height="3.5em"
              textAlign="right"
              fontSize={configData.style.itemFontSize}
              type={isMobile ? 'number' : 'text'}
              value={numState ?? ''}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  changeNum(numState != null ? numState + 1 : 1);
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  changeNum(numState != null ? Math.max(numState - 1, 0) : 0);
                }
              }}
              {...(isMobile && { pattern: '[0-9]*' })}
            />
            <Box>人</Box>
          </HStack>
        </Center>
      </FormControl>
    </VStack>
  );
};
