import { useContext } from "react";
import { Box, Center, Checkbox } from "@chakra-ui/react";

import { ShowAlertMessageContext } from "../../../../contexts/ShowAlertMessageContext";

export const ErrorMessage = ({ condition }: { condition: boolean }) => {
  const showAlertMessage = useContext(ShowAlertMessageContext);

  if (!condition) {
    return null;
  }

  // HACK: spanタグのinvalidクラスをバリデーションエラーの存在チェックに使用
  return (
    <>
      <span className="invalid"></span>
      {showAlertMessage && (
        <Center
          style={showAlertMessage ? {} : { display: "none" }}
          bg="red.100"
          color="red.800"
          border="1px"
          borderColor="red.200"
          borderRadius="lg"
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
