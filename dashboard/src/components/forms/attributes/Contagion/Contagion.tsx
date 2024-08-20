// Hepatitis C（C型肝炎）

import { useCallback, useState } from 'react';
import { Checkbox, Box } from '@chakra-ui/react';

import { HIV } from './HIV/HIV';
import { HepatitisC } from './HepatitisC/HepatitisC';

export const Contagion = ({ personName }: { personName: string }) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  }, []);

  return (
    <Box mb={4}>
      <Checkbox colorScheme="cyan" isChecked={isChecked} onChange={onChange}>
        感染症
      </Checkbox>

      {isChecked && (
        <Box mt={2} ml={4} mr={4} mb={4}>
          <>
            <HIV personName={personName} />
            <HepatitisC personName={personName} />
          </>
        </Box>
      )}
    </Box>
  );
};
