import { Flex } from '@chakra-ui/react';

import { CalculationLabel } from '../../forms/calculationLabel';
import { HomeLink } from '../../navigation/HomeLink';

export const ReferralHeader = () => (
  <Flex w="100%" alignItems="center" justifyContent="space-between">
    <HomeLink />
    <CalculationLabel
      text="紹介状モード"
      colour="cyan"
      textColor="cyan.900"
      borderColor="cyan.900"
    />
  </Flex>
);
