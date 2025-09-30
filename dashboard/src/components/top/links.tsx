import { Stack } from '@chakra-ui/react';
import { LinkButton } from './linkButton';
import configData from '../../config/app_config.json';

export const Links = () => {
  return (
    <Stack
      direction={{ base: 'column', xl: 'row' }}
      justify="center"
      justifyContent="space-between"
      align="center"
      bg="gray.300"
      width="100%"
      marginTop="2em"
    >
      <LinkButton title="Contact" to={configData.URL.contact} />
      <LinkButton title="GitHub" to={configData.URL.Github} />
      <LinkButton title="個人情報の扱いについて" to="/privacypolicy" />
    </Stack>
  );
};
