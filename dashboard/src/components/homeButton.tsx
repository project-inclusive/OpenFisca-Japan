import { Flex, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

export const HomeButton = () => {
  return (
    <Flex w="90%" justifyContent="left" marginTop="0.5em">
      <RouterLink to="/">
        <Icon
          as={FaHome}
          paddingLeft="1.5em"
          justifyContent="left"
          boxSize="4em"
          color="cyan.900"
        />
      </RouterLink>
    </Flex>
  );
};
