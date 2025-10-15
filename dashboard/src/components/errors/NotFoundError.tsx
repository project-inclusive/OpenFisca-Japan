import { Box, Button, Center } from '@chakra-ui/react';
import { NarrowWidth } from '../layout/narrowWidth';
import { Link as RouterLink } from 'react-router-dom';
import { HomeButton } from '../homeButton';
import configData from '../../config/app_config.json';

export const NotFoundError = () => (
  <NarrowWidth>
    <HomeButton />
    <Box bg="white" borderRadius="xl" p={4} m={4}>
      <Center>ページが見つかりませんでした。</Center>
      <Center pr={4} pl={4} pb={4} mt={8} style={{ textAlign: 'center' }}>
        <Button
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="2em"
          width="100%"
          bg="cyan.600"
          color="white"
          _hover={{ bg: 'cyan.700' }}
          as={RouterLink}
          to="/"
        >
          トップページに戻る
        </Button>
      </Center>
    </Box>
  </NarrowWidth>
);
