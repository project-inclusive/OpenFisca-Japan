import React from 'react';
import {
  Box,
  Center,
  Heading,
  OrderedList,
  ListItem,
  Text,
  Button,
  UnorderedList,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import configData from '../config/app_config.json';

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box bg="white" borderRadius="xl" p={4} m={4}>
      <Center
        fontSize={configData.style.titleFontSize}
        fontWeight="semibold"
        color="blue.800"
        mb="0.5em"
      >
        プライバシーポリシー
      </Center>
      {/* 序文 */}
      <Text mt="0.5em">
        本プライバシーポリシー（以下、「本ポリシー」といいます。）は、一般社団法人防窮研究所（以下、「弊団体」といいます。）が提供する「支援みつもりヤドカリくん」Web支援制度シミュレーター及びチャットボット（以下、総称して「当サービス」といいます。）のユーザーに対するユーザー情報の取り扱いについて説明します。
      </Text>
      {/* 第1条 */}
      <Heading size="md" mt="0.5em">
        1. 基本的な考え方
      </Heading>
      <OrderedList>
        <ListItem>
          当サービスは、ユーザーのプライバシー保護を最優先に考え、最大限の注意を払っております。収集した情報は、利用目的の範囲内で適切に取り扱われます。
        </ListItem>
      </OrderedList>
      {/* 第2条 */}
      <Heading size="md" mt="0.5em">
        2. ユーザー情報の取得と利用
      </Heading>
      <OrderedList>
        <ListItem>
          当サービスでは、チャット履歴の内容を自動的に取得します。そのためユーザー情報などの重要な情報を入力することは避けてください。
        </ListItem>
        <ListItem>
          取得した情報は、当サービスの円滑な運営、サービス改善、統計データ作成のために利用します。
        </ListItem>
      </OrderedList>
      {/* 第3条 */}
      <Heading size="md" mt="0.5em">
        3. ユーザー情報の第三者提供と外部サービスの利用
      </Heading>
      <OrderedList>
        <ListItem>
          弊団体は、法令に基づく開示要請があった場合を除き、収集した情報を第三者に提供しません。また、ユーザーの同意がある場合に限り、情報の提供が行われることがあります。
        </ListItem>
        <ListItem>
          当サービスでは、サイトの利用状況を把握するためにGoogle
          Analyticsを利用しています。これにより収集される情報は、Google社のプライバシーポリシーに基づいて管理されます。ユーザーはブラウザのアドオン設定でGoogle
          Analyticsを無効にすることができます。詳細はこちらのリンクをご参照ください。
        </ListItem>
        <UnorderedList>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://www.google.com/intl/ja/policies/privacy/"
              isExternal
            >
              Google プライバシーポリシー
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://tools.google.com/dlpage/gaoptout?hl=ja"
              isExternal
            >
              Google Analyticsの無効化
            </ChakraLink>
          </ListItem>
        </UnorderedList>
        <ListItem>
          当サービスでは、LINE、ChatGPT、miibo、Google Custom Search
          APIなどの外部サービスを利用しています。これらのサービスにおけるユーザー情報の取り扱いについては、各サービスのプライバシーポリシーをご確認ください。
        </ListItem>
        <UnorderedList>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://line.me/ja/terms/policy/"
              isExternal
            >
              LINE プライバシーポリシー
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://openai.com/ja/policies/privacy-policy"
              isExternal
            >
              ChatGPT プライバシーポリシー
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://chill-shoemaker-341.notion.site/081c3eac8832442a929c973b2624e42c"
              isExternal
            >
              miibo プライバシーポリシー
            </ChakraLink>
          </ListItem>
          <ListItem>
            <ChakraLink
              color="blue"
              href="https://www.google.com/intl/ja/policies/privacy/"
              isExternal
            >
              Google プライバシーポリシー
            </ChakraLink>
          </ListItem>
        </UnorderedList>
      </OrderedList>
      {/* 第4条 */}
      <Heading size="md" mt="0.5em">
        4. プライバシーポリシーの変更
      </Heading>
      <OrderedList>
        <ListItem>
          本ポリシーの内容は、適宜見直しや改善を行うことがあります。変更後に当サービスを利用された場合は、変更後の本ポリシーに同意いただいたものとみなします。
        </ListItem>
      </OrderedList>
      {/* 第5条 */}
      <Heading size="md" mt="0.5em">
        5. お問い合わせ
      </Heading>
      <OrderedList>
        <ListItem>
          本ポリシーに関するお問い合わせは、以下の連絡先までご連絡ください。
        </ListItem>
      </OrderedList>
      <Text mt="0.5em">
        E-mail：inst.poverty.prevention@gmail.com
      </Text>
      <br />
      <Text>制定日：2024年2月8日</Text>
      {/* 戻るボタン */}
      <Center mt={2}>
        <Button
          onClick={() => {
            navigate(-1);
          }}
        >
          戻る
        </Button>
      </Center>
    </Box>
  );
};

export default App;
