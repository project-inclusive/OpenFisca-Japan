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
          borderRadius="xl"
          fontSize="md"
          width="100%"
          p={1}
          mt={1}
          mb={1}
        >
          入力必須項目です
        </Center>
      )}
    </>
  );
};
