import {
  Box,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

import { ReferralDocument, ReferralDocumentConcern } from '../types';
import { UrgencyBadge } from './UrgencyBadge';

const ConcernDetails = ({
  concern,
  title,
}: {
  concern: ReferralDocumentConcern;
  title: string;
}) => (
  <Box>
    <Text fontWeight="bold">
      {title}：{concern.label}
    </Text>
    <Stack direction={{ base: 'column', sm: 'row' }} mt={1} spacing={2}>
      <UrgencyBadge urgency={concern.urgency} />
      <Text>（{concern.answer}）</Text>
    </Stack>
    <Text mt={1} overflowWrap="anywhere">
      <Text as="span" fontWeight="bold">
        相談先：
      </Text>
      {concern.destination}
    </Text>
  </Box>
);

export const ReferralDocumentView = forwardRef<
  HTMLDivElement,
  { document: ReferralDocument }
>(({ document }, ref) => {
  return (
    <Box
      ref={ref}
      className="referral-print-document"
      data-testid="referral-document"
    >
      <Stack spacing={5}>
        <Box
          as="section"
          data-testid="referral-guide"
          className="referral-print-card"
          bg="white"
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
          aria-labelledby="referral-guide-heading"
        >
          <Heading id="referral-guide-heading" as="h2" size="md" mb={4}>
            説明書
          </Heading>

          <Stack spacing={4}>
            <Text>{document.guide.introduction}</Text>
            <Box>
              <Text fontWeight="bold">
                「{document.guide.concernLabel}」のあなたの緊急度は（
                {document.guide.urgencyLabel}）です。
              </Text>
              <Box mt={2}>
                <UrgencyBadge urgency={document.guide.urgency} />
              </Box>
              <UnorderedList mt={2} ml={6} spacing={1}>
                <ListItem>高：ぜひ窓口に相談することを薦めます。</ListItem>
                <ListItem>中：窓口に相談してみてはどうですか</ListItem>
                <ListItem>低：自分の身を守るため知ってください</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>
                選択した困りごとの相談先
              </Text>
              <Stack spacing={2}>
                {document.guide.concerns.map((concern, index) => (
                  <Box key={concern.id}>
                    <Text fontWeight="semibold">
                      {index === 0
                        ? '主な困りごと'
                        : `他の困りごと${['①', '②', '③'][index - 1]}`}
                      ：{concern.label}
                    </Text>
                    <Text overflowWrap="anywhere">
                      相談先：{concern.destination}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                主な困りごとの窓口の検索方法
              </Text>
              <Stack as="ol" pl={5} spacing={1}>
                {document.guide.searchMethods.map((method) => (
                  <Text as="li" key={method}>
                    {method}
                  </Text>
                ))}
              </Stack>
            </Box>

            <Text>{document.guide.contactInstruction}</Text>
            <Text>{document.guide.letterInstruction}</Text>
          </Stack>
        </Box>

        <Box
          as="section"
          data-testid="referral-letter"
          className="referral-print-card"
          bg="white"
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
          aria-labelledby="referral-letter-heading"
        >
          <Heading id="referral-letter-heading" as="h2" size="md" mb={4}>
            紹介状
          </Heading>

          <Stack spacing={4}>
            <Text whiteSpace="pre-line">{document.letter.introduction}</Text>

            {document.letter.name ? (
              <Text overflowWrap="anywhere">
                <Text as="span" fontWeight="bold">
                  氏名（任意）：
                </Text>
                {document.letter.name}
              </Text>
            ) : null}
            {document.letter.email ? (
              <Text overflowWrap="anywhere">
                <Text as="span" fontWeight="bold">
                  メールアドレス（任意）：
                </Text>
                {document.letter.email}
              </Text>
            ) : null}

            <ConcernDetails
              concern={document.letter.mainConcern}
              title="主な困りごと"
            />

            {document.letter.otherConcerns.map((concern, index) => (
              <ConcernDetails
                key={concern.id}
                concern={concern}
                title={`他の困りごと${['①', '②', '③'][index]}`}
              />
            ))}

            {document.letter.message ? (
              <Text whiteSpace="pre-wrap" overflowWrap="anywhere">
                <Text as="span" fontWeight="bold">
                  他に伝えたいこと（任意）：
                </Text>
                {document.letter.message}
              </Text>
            ) : null}

            <Text textAlign="right">作成：{document.letter.creator}</Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
});

ReferralDocumentView.displayName = 'ReferralDocumentView';
