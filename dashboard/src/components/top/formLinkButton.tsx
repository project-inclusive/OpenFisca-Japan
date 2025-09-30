import { Button, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import configData from '../../config/app_config.json';
import { agreedToTermsAtom } from '../../state';
import { useRecoilValue } from 'recoil';

export const FormLinkButton = ({
  name,
  to,
  onClick,
}: {
  name: string;
  to: string;
  onClick: () => void;
}) => {
  const agreedToTerms = useRecoilValue(agreedToTermsAtom);

  return (
    <Button
      as={RouterLink}
      // 規約に同意していない場合のみモーダルが開く
      to={agreedToTerms ? to : '/'}
      onClick={onClick}
      fontSize={configData.style.subTitleFontSize}
      py="1.5em"
      px="1em"
      marginLeft="1em"
      marginRight="1em"
      whiteSpace="normal"
    >
      <Text>{name}</Text>
    </Button>
  );
};
