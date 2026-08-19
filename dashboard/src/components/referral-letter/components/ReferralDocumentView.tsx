import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { ReferralDocument, ReferralDocumentConcern } from '../types';

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
    <Text mt={1}>（{concern.answer}）</Text>
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
