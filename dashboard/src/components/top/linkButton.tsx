import { Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import configData from '../../config/app_config.json';

export const LinkButton = ({ title, to }: { title: string; to: string }) => {
  return (
    <Button
      fontSize={configData.style.subTitleFontSize}
      as={RouterLink}
      to={to}
      paddingTop="1.5em"
      paddingBottom="1.5em"
      paddingLeft="4em"
      paddingRight="4em"
      width="100%"
      bg="gray.300"
    >
      {title}
    </Button>
  );
};
