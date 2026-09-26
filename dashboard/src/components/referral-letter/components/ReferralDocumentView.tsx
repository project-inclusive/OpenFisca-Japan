import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { ReferralDocument, ReferralDocumentConcern } from '../types';
import { ReferralUrgencyBadge } from './ReferralUrgencyBadge';

const ConcernDetails = ({
  concern,
  title,
}: {
  concern: ReferralDocumentConcern;
  title: string;
}) => (
  <Box>
    <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
      <Text overflowWrap="anywhere">
        <Text as="span" fontWeight="bold">
          {title}：{concern.label}
        </Text>
        <Text as="span">（{concern.answer}）</Text>
      </Text>
    </Flex>
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
          <Heading
            id="referral-guide-heading"
            as="h2"
            size="md"
            mb={4}
            textAlign="center"
          >
            説明書
            <Text as="span" display="block" fontSize="sm" mt={1}>
              （あなたに読んでいただく用）
            </Text>
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
                    <Flex
                      align="center"
                      justify="flex-start"
                      gap={2}
                      flexWrap="wrap"
                    >
                      <Text fontWeight="semibold">
                        {index === 0
                          ? '主な困りごと'
                          : `他の困りごと${['①', '②', '③'][index - 1]}`}
                        ：{concern.label}
                      </Text>
                      {index === 0 ? (
                        <ReferralUrgencyBadge level={concern.urgencyLevel} />
                      ) : null}
                    </Flex>
                    {concern.destinations.map(
                      (destination, destinationIndex) => (
                        <Box
                          key={`${destinationIndex}-${destination.name}`}
                          mt={1}
                          overflowWrap="anywhere"
                          data-testid="referral-destination"
                        >
                          <Text>
                            相談先
                            {concern.destinations.length > 1
                              ? ['①', '②'][destinationIndex]
                              : ''}
                            ：{destination.name}
                          </Text>
                          {destination.url ? (
                            <Box fontSize="sm">
                              <Link
                                href={destination.url}
                                isExternal
                                color="cyan.800"
                                textDecoration="underline"
                                aria-label={`${destination.name}の案内ページを開く`}
                              >
                                案内ページを開く
                              </Link>
                              <Text className="referral-destination-url">
                                {destination.url}
                              </Text>
                            </Box>
                          ) : (
                            <Text fontSize="sm">案内ページのリンクなし</Text>
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                主な困りごとの窓口の検索方法
              </Text>
              <Stack as="ol" pl={5} spacing={1}>
                {document.guide.searchMethods.map((method, index) => (
                  <Text
                    as="li"
                    key={`${index}-${method.destination.name}`}
                    overflowWrap="anywhere"
                  >
                    <Text as="span" fontWeight="semibold">
                      {method.destination.name}：
                    </Text>
                    {method.instruction}
                  </Text>
                ))}
              </Stack>
            </Box>

            <Text>{document.guide.contactInstruction}</Text>
            <Text>{document.guide.letterInstruction}</Text>
            <Text fontSize="sm">{document.guide.disclaimer}</Text>
          </Stack>
        </Box>

        <Box className="referral-letter-print-group">
          <Box className="referral-print-cutline" aria-hidden="true">
            切り取り線
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
            <Heading
              id="referral-letter-heading"
              as="h2"
              size="md"
              mb={4}
              textAlign="center"
            >
              紹介状
              <Text as="span" display="block" fontSize="sm" mt={1}>
                （相談窓口にお渡しする用）
              </Text>
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

              <Text fontSize="sm">{document.letter.disclaimer}</Text>
              <Text textAlign="right">作成：{document.letter.creator}</Text>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
});

ReferralDocumentView.displayName = 'ReferralDocumentView';
