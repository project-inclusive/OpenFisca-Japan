import {
  Flex,
  Icon,
  Text,
  Center,
  VStack,
  HStack,
  useDisclosure,
  Stack,
  AbsoluteCenter,
  Spacer,
} from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { useState } from 'react';
import configData from '../../config/app_config.json';
import personIcon1 from '../../assets/top/person_icon1.png';
import personIcon2 from '../../assets/top/person_icon2.png';
import personIcon3 from '../../assets/top/person_icon3.png';
import { Feature } from './feature';
import { FormLinkButton } from './formLinkButton';
import { Links } from './links';
import { agreedToTermsAtom } from '../../state';
import TermsModal from '../TermsModal';
import { HomeButton } from '../homeButton';

// 何もしない関数（onClickで発火する関数のデフォルト値として使用）
const noop = () => {};

export function TopPage() {
  const agreedToTerms = useRecoilValue(agreedToTermsAtom);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [modalLink, setModalLink] = useState('/');

  const formLinkOnClick = (to: string) => {
    if (agreedToTerms) {
      // すでに利用規約に同意しているので何もしない
      return noop;
    }
    // 利用規約を開く
    return () => {
      setModalLink(to);
      onModalOpen();
    };
  };

  return (
    <AbsoluteCenter width="100%" axis="horizontal">
      <VStack>
        <HomeButton />
        <VStack width="100%">
          <Center>
            <Text
              color="cyan.900"
              fontSize={configData.style.titleLogoFontSize}
              fontWeight="bold"
            >
              {configData.topPage.title}
            </Text>
          </Center>
          <Stack
            direction={{ base: 'column', xl: 'row' }}
            justifyContent="space-between"
          >
            <Feature
              image={personIcon1}
              title={configData.topPage.features[0].feature}
              descriptions={configData.topPage.features[0].descriptions}
              titleColor="red.500"
            />
            <Spacer />
            <Feature
              image={personIcon2}
              title={configData.topPage.features[1].feature}
              descriptions={configData.topPage.features[1].descriptions}
              titleColor="blue.500"
            />
            <Spacer />
            <Feature
              image={personIcon3}
              title={configData.topPage.features[2].feature}
              descriptions={configData.topPage.features[2].descriptions}
              titleColor="green.500"
            />
          </Stack>
          <HStack marginTop="2em">
            <FormLinkButton
              name="かんたん見積もり"
              to={agreedToTerms ? '/calculate-simple' : '/'}
              onClick={formLinkOnClick('/calculate-simple')}
            />
            <FormLinkButton
              name="くわしく見積もり"
              to={agreedToTerms ? '/calculate' : '/'}
              onClick={formLinkOnClick('/calculate')}
            />
            <FormLinkButton
              name="能登半島地震被災者支援制度見積もり"
              to={agreedToTerms ? '/calculate-disaster' : '/'}
              onClick={formLinkOnClick('/calculate-disaster')}
            />
          </HStack>
          <Links />
        </VStack>
      </VStack>
      <TermsModal
        isOpen={isModalOpen}
        onOpen={onModalOpen}
        onClose={onModalClose}
        to={modalLink}
      />
    </AbsoluteCenter>
  );
}
