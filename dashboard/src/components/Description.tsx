import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Center,
  Button,
  VStack,
  Image,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  UnorderedList,
  ListItem,
  Link as ChakraLink,
  useDisclosure,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { FaGithub } from 'react-icons/fa';
import { useRecoilValue, useResetRecoilState } from 'recoil';

import { agreedToTermsAtom, householdAtom } from '../state';
import configData from '../config/app_config.json';
import bokyuIcon from '../assets/bokyu_lab_icon_cyan.png';
import yadokariKunIcon from '../assets/yadokari-kun.png';
import TermsModal from './TermsModal';

const defaultInnerWidth = window.innerWidth;

function Description() {
  const [screenWidth, setScreenWidth] = useState(defaultInnerWidth);
  const [isMobile, setIsMobile] = useState(defaultInnerWidth <= 800);
  const agreedToTerms = useRecoilValue(agreedToTermsAtom);
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [modalLink, setModalLink] = useState('/');

  const resetHousehold = useResetRecoilState(householdAtom);

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);

      if (screenWidth <= 800) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }
    window.addEventListener('resize', handleResize);
  });

  // 何もしない関数（onClickで発火する関数のデフォルト値として使用）
  const noop = () => {};

  return (
    <>
      <Box bg="white" borderRadius="xl" p={4} m={4}>
        <Center
          fontSize={configData.style.titleFontSize}
          fontWeight="semibold"
          color="blue.800"
          mb="0.5em"
        >
          {configData.description.title}
          {!isMobile && (
            <Image
              src={yadokariKunIcon}
              alt="yadokari kun icon"
              boxSize="3em"
              ml="15px"
            />
          )}
        </Center>
        {isMobile && (
          <Image
            src={yadokariKunIcon}
            alt="yadokari kun icon"
            boxSize="3em"
            margin="auto"
          />
        )}

        <Box fontSize={configData.style.descriptionFontSize} mb="1em">
          {configData.description.description[0]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[0]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[1]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[1]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[2]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[2]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="1.5em">
          {configData.description.description[3]}
        </Box>

        <Center
          fontSize={configData.style.subTitleFontSize}
          mb="0.5em"
          color="cyan.800"
        >
          <CheckCircleIcon color="cyan.600" mr="0.3em" />
          {configData.description.feature[3]}
        </Center>
        <Box fontSize={configData.style.descriptionFontSize} mb="0.5em">
          {configData.description.description[4]}
          <br></br>
          {configData.description.description[5]}
        </Box>

        {/* 見積もり対象制度一覧 */}
        <Accordion mb={4} allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <AccordionIcon />
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  見積もり対象制度一覧
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <UnorderedList ml={8} mt={1}>
                <ul>
                  {/* benefit 給付制度 */}
                  {Object.entries(configData.result.給付制度.制度一覧).map(
                    (entry: any, index: number) => (
                      <ListItem key={index}>
                        <Box color="blue">
                          <a href={entry[1].reference}>
                            {entry[0]}
                            {entry[1].local && `(${entry[1].local})`}
                          </a>
                        </Box>
                      </ListItem>
                    )
                  )}

                  {/* loan 貸付制度 */}
                  {Object.entries(
                    configData.result.貸付制度.その他.制度一覧
                  ).map((entry: any, index: number) => (
                    <ListItem key={index}>
                      <Box color="blue">
                        <a href={entry[1].reference}>
                          {entry[0]}
                          {entry[1].local && `(${entry[1].local})`}
                        </a>
                      </Box>
                    </ListItem>
                  ))}

                  <ListItem>
                    <Box color="blue">
                      <a
                        href={
                          configData.result.貸付制度.生活福祉資金貸付制度
                            .reference
                        }
                      >
                        生活福祉資金貸付制度
                      </a>
                    </Box>
                    <UnorderedList ml={8} mt={1}>
                      <ul>
                        {Object.entries(
                          configData.result.貸付制度.生活福祉資金貸付制度
                            .制度一覧
                        ).map((entry: any, index: number) => (
                          <ListItem key={index}>
                            <Box color="blue">
                              <a href={entry[1].reference}>
                                {entry[0]}
                                {entry[1].local && `(${entry[1].local})`}
                              </a>
                            </Box>
                          </ListItem>
                        ))}
                      </ul>
                    </UnorderedList>
                  </ListItem>

                  {/* その他該当制度 */}
                  {Object.entries(configData.result.該当制度.制度一覧).map(
                    (entry: any, index: number) => (
                      <ListItem key={index}>
                        <Box color="blue">
                          <a href={entry[1].reference}>
                            {entry[0]}
                            {entry[1].local && `(${entry[1].local})`}
                          </a>
                        </Box>
                      </ListItem>
                    )
                  )}
                </ul>
              </UnorderedList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* icon */}
        <Center>
          <a href={configData.URL.contact}>
            <VStack mr={4}>
              <Image src={bokyuIcon} alt="防窮研究所" boxSize="2em" />
              <Box color="gray.600">Contact</Box>
            </VStack>
          </a>
          <a href={configData.URL.Github}>
            <VStack>
              <Icon as={FaGithub} boxSize="2em" color="cyan.600"></Icon>
              <Box color="gray.600">Github</Box>
            </VStack>
          </a>
        </Center>
      </Box>

      <TermsModal
        isOpen={isModalOpen}
        onOpen={onModalOpen}
        onClose={onModalClose}
        to={modalLink}
      />

      <Center pr={4} pl={4} pb={4} style={{ textAlign: 'center' }}>
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
          height="4em"
          width="100%"
          bg="orange.400"
          color="white"
          _hover={{ bg: 'orange.500' }}
        >
          能登半島地震
          <br />
          被災者支援制度見積もり
        </Button>
      </Center>

      <Center pr={4} pl={4} pb={4} style={{ textAlign: 'center' }}>
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
          style={{ marginRight: '8%' }}
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="4em"
          width="45%"
          bg="blue.500"
          color="white"
          _hover={{ bg: 'blue.600' }}
          data-testid="calculate-detail-button"
        >
          くわしく
          <br />
          見積もり
        </Button>
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
          fontSize={configData.style.subTitleFontSize}
          borderRadius="xl"
          height="4em"
          width="45%"
          bg="teal.500"
          color="white"
          _hover={{ bg: 'teal.600' }}
          data-testid="calculate-simple-button"
        >
          かんたん
          <br />
          見積もり
        </Button>
        <br />
      </Center>
      <Center mb="1em">
        <ChakraLink as={RouterLink} to="/privacypolicy" ml="1.0em">
          プライバシーポリシー
        </ChakraLink>
      </Center>
    </>
  );
}

export default Description;

export function List() {
  return (
    <UnorderedList ml={8} mt={1}>
      <ul>
        {/* benefit 給付制度 */}
        {Object.entries(configData.result.給付制度.制度一覧).map(
          (entry: any, index: number) => (
            <ListItem key={index}>
              <Box color="blue">
                <a href={entry[1].reference}>
                  {entry[0]}
                  {entry[1].local && `(${entry[1].local})`}
                </a>
              </Box>
            </ListItem>
          )
        )}

        {/* loan 貸付制度 */}
        {Object.entries(configData.result.貸付制度.その他.制度一覧).map(
          (entry: any, index: number) => (
            <ListItem key={index}>
              <Box color="blue">
                <a href={entry[1].reference}>
                  {entry[0]}
                  {entry[1].local && `(${entry[1].local})`}
                </a>
              </Box>
            </ListItem>
          )
        )}

        <ListItem>
          <Box color="blue">
            <a href={configData.result.貸付制度.生活福祉資金貸付制度.reference}>
              生活福祉資金貸付制度
            </a>
          </Box>
          <UnorderedList ml={8} mt={1}>
            <ul>
              {Object.entries(
                configData.result.貸付制度.生活福祉資金貸付制度.制度一覧
              ).map((entry: any, index: number) => (
                <ListItem key={index}>
                  <Box color="blue">
                    <a href={entry[1].reference}>
                      {entry[0]}
                      {entry[1].local && `(${entry[1].local})`}
                    </a>
                  </Box>
                </ListItem>
              ))}
            </ul>
          </UnorderedList>
        </ListItem>
      </ul>
    </UnorderedList>
  );
}
