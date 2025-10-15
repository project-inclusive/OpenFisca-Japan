import { Flex, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import {
  defaultNextQuestionKeyAtom,
  nextQuestionKeyAtom,
  questionKeyAtom,
  questionKeyHistoryAtom,
  resetQuestionKeys,
} from '../state';
import { useRecoilState } from 'recoil';

export const HomeButton = () => {
  const [questionKey, setQuestionKey] = useRecoilState(questionKeyAtom);
  const [nextQuestionKey, setNextQuestionKey] =
    useRecoilState(nextQuestionKeyAtom);
  const [defaultNextQuestionKey, setDefaultNextQuestionKey] = useRecoilState(
    defaultNextQuestionKeyAtom
  );
  const [questionKeyHistory, setQuestionKeyHistory] = useRecoilState(
    questionKeyHistoryAtom
  );

  const onClick = () => {
    // 質問の1問目に戻る
    // (戻さないと別の見積もりモードへ移った際に想定外の設問から始まってしまうため)
    resetQuestionKeys({
      setQuestionKey,
      setNextQuestionKey,
      setDefaultNextQuestionKey,
      setQuestionKeyHistory,
    });
  };

  return (
    <Flex w="90%" justifyContent="left" marginTop="0.5em">
      <RouterLink to="/">
        <Icon
          as={FaHome}
          paddingLeft="1.5em"
          justifyContent="left"
          boxSize="4em"
          color="cyan.900"
          onClick={onClick}
        />
      </RouterLink>
    </Flex>
  );
};
