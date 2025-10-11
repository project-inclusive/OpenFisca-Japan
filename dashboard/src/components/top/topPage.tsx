import {
  Button,
  Text,
  Center,
  VStack,
  useDisclosure,
  Stack,
  AbsoluteCenter,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Fragment, useState } from 'react';
import configData from '../../config/app_config.json';
import personIcon1 from '../../assets/top/person_icon1.png';
import personIcon2 from '../../assets/top/person_icon2.png';
import personIcon3 from '../../assets/top/person_icon3.png';
import { Feature } from './feature';
import { Links } from './links';
import { agreedToTermsAtom } from '../../state';
import TermsModal from '../TermsModal';
import { HomeButton } from '../homeButton';

// 何もしない関数（onClickで発火する関数のデフォルト値として使用）
const noop = () => {};

// 幅に応じて改行を入れる
const NarrowBr = () => {
  if (window.innerWidth < 1000) {
    return <br />;
  }
  return <span />;
};

export function TopPage() {
  const agreedToTerms = useRecoilValue(agreedToTermsAtom);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [modalLink, setModalLink] = useState('/');

  return (
    <>
      <VStack width="100%" overflowX="hidden">
        <HomeButton />
        <VStack width="auto">
          <Center>
            <Text
              color="cyan.900"
              fontSize={configData.style.titleLogoFontSize}
              fontWeight="bold"
              display="inline-block"
              textAlign="center"
            >
              {configData.topPage.title.map((line, i) => (
                <Fragment key={i}>
                  <span>{line}</span>
                  <NarrowBr />
                </Fragment>
              ))}
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

          <Center pt={2} pb={1} pr={4} pl={4} style={{ textAlign: 'center' }}>
            <Button
              as={RouterLink}
              // 規約に同意していない場合のみモーダルが開く
              to={agreedToTerms ? '/calculate-disaster' : '/'}
              onClick={
                agreedToTerms
                  ? noop
                  : () => {
                      setModalLink('/calculate-disaster');
                      onModalOpen();
                    }
              }
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              pr="1em"
              pl="1em"
              height="3.5em"
              width="100%"
              bg="orange.400"
              color="white"
              _hover={{ bg: 'orange.500' }}
            >
              能登半島地震被災者支援制度見積もり
            </Button>
          </Center>

          <Center pr={4} pl={4} pb={1} style={{ textAlign: 'center' }}>
            <Button
              as={RouterLink}
              // 規約に同意していない場合のみモーダルが開く
              to={agreedToTerms ? '/calculate-simple' : '/'}
              onClick={
                agreedToTerms
                  ? noop
                  : () => {
                      setModalLink('/calculate-simple');
                      onModalOpen();
                    }
              }
              style={{ marginRight: '1%' }}
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="3.5em"
              pr="1.2em"
              pl="1.2em"
              width="45%"
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600' }}
              data-testid="calculate-simple-button"
            >
              かんたん見積もり
            </Button>
            <Button
              as={RouterLink}
              // 規約に同意していない場合のみモーダルが開く
              to={agreedToTerms ? '/calculate' : '/'}
              onClick={
                agreedToTerms
                  ? noop
                  : () => {
                      setModalLink('/calculate');
                      onModalOpen();
                    }
              }
              fontSize={configData.style.subTitleFontSize}
              borderRadius="xl"
              height="3.5em"
              pr="1.2em"
              pl="1.2em"
              width="45%"
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
              data-testid="calculate-detail-button"
            >
              くわしく見積もり
            </Button>
            <br />
          </Center>
        </VStack>
        <Links />
      </VStack>
      <TermsModal
        isOpen={isModalOpen}
        onOpen={onModalOpen}
        onClose={onModalClose}
        to={modalLink}
      />
    </>
  );
}
