import { Center } from '@chakra-ui/react';

import { useRecoilValue } from 'recoil';

import { showsValidationErrorAtom } from '../../../state';

export const ErrorMessage = () => {
  const showsValidationError = useRecoilValue(showsValidationErrorAtom);

  // HACK: spanタグのinvalidクラスをバリデーションエラーの存在チェックに使用
  return (
    <>
      {showsValidationError && (
        <Center
          bg="red.100"
          color="red.800"
          border="1px"
          borderColor="red.200"
          borderRadius="lg"
          fontSize="md"
          p={1}
          mt={5}
          mb={1}
        >
          入力必須項目です
        </Center>
      )}
    </>
  );
};
