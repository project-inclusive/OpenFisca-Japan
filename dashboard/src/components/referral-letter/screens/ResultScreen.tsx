import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import configData from '../../../config/app_config.json';
import { NarrowWidth } from '../../layout/narrowWidth';
import { ReferralDocumentView } from '../components/ReferralDocumentView';
import { ReferralHeader } from '../components/ReferralHeader';
import { useReferralExport } from '../hooks/useReferralExport';
import type { ReferralDocument } from '../types';

type ResultScreenProps = {
  document: ReferralDocument;
  storageError: string | null;
  onEdit: () => void;
  onReset: () => void;
};

export const ResultScreen = ({
  document: referralDocument,
  storageError,
  onEdit,
  onReset,
}: ResultScreenProps) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const { downloadPng, printDocument, isExporting, exportError } =
    useReferralExport(documentRef);

  useEffect(() => {
    document.body.classList.add('referral-print-page');
    const pageStyle = document.createElement('style');
    pageStyle.dataset.referralPrintPage = 'true';
    pageStyle.media = 'print';
    pageStyle.textContent = '@page { size: A4 portrait; margin: 12mm; }';
    document.head.appendChild(pageStyle);

    return () => {
      document.body.classList.remove('referral-print-page');
      pageStyle.remove();
    };
  }, []);

  return (
    <NarrowWidth>
      <Box w="100%" pb={10}>
        <Box className="referral-no-print">
          <ReferralHeader />
          <Heading
            id="referral-page-heading"
            tabIndex={-1}
            as="h1"
            size="lg"
            px={4}
            pb={4}
            textAlign="center"
          >
            紹介状ができました
          </Heading>
        </Box>

        <Box px={{ base: 2, sm: 4 }}>
          <ReferralDocumentView ref={documentRef} document={referralDocument} />
        </Box>

        <Stack
          className="referral-no-print"
          as="section"
          aria-labelledby="referral-actions-heading"
          spacing={4}
          bg="white"
          borderRadius="xl"
          m={4}
          p={{ base: 4, md: 6 }}
        >
          <Heading id="referral-actions-heading" as="h2" size="md">
            保存・次の行動
          </Heading>

          {storageError ? (
            <Alert status="warning">
              <AlertIcon />
              {storageError}
            </Alert>
          ) : null}
          {exportError ? (
            <Alert status="error" data-testid="referral-export-error">
              <AlertIcon />
              {exportError}
            </Alert>
          ) : null}

          <Text fontWeight="bold">
            氏名・メールアドレス等を含む場合があります。保存先や共有相手をご確認ください。
          </Text>

          <Button
            type="button"
            colorScheme="cyan"
            bg="cyan.800"
            color="white"
            _hover={{ bg: 'cyan.900' }}
            minH="3.25em"
            onClick={() => void downloadPng()}
            isDisabled={isExporting}
          >
            {isExporting ? <Spinner size="sm" mr={2} /> : null}
            スクリーンショットで保存
          </Button>
          <Button
            type="button"
            colorScheme="blue"
            bg="blue.700"
            color="white"
            _hover={{ bg: 'blue.800' }}
            minH="3.25em"
            onClick={printDocument}
          >
            印刷（PC向け）
          </Button>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            <Button type="button" variant="outline" onClick={onEdit}>
              回答を編集
            </Button>
            <Button
              as={RouterLink}
              to="/calculate"
              bg="cyan.800"
              color="white"
              _hover={{ bg: 'cyan.900' }}
            >
              くわしく計算
            </Button>
            <Button
              as="a"
              href={configData.URL.questionnaire_form}
              target="_blank"
              rel="noopener noreferrer"
              bg="teal.700"
              color="white"
              _hover={{ bg: 'teal.800' }}
            >
              アンケートに答える
            </Button>
            <Button type="button" variant="ghost" onClick={onReset}>
              最初からやり直す
            </Button>
          </SimpleGrid>
        </Stack>
      </Box>
    </NarrowWidth>
  );
};
