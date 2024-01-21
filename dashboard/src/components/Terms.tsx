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
        利用規約
      </Center>
      {/* 第1条 */}
      <Heading size="md" mt="0.5em">第1条（適用）</Heading>
      <OrderedList>
        <ListItem>本規約は、『支援みつもりヤドカリくん』（以下、「本サービス」という）の利用にあたり、すべてのユーザーに適用されます。本サービスは、ユーザーが提供する属性情報（年齢、収入、居住地等）を基に、利用者が受けられる可能性のある支援制度や支援金額を表示するWebアプリケーション、および関連するQ&Aを提供するチャットボットを含みます。</ListItem>
        <ListItem>ユーザーは、本サービスの利用開始時に本規約に同意したものとみなされます。本サービスを利用することは、最新の規約に同意したことを意味します。運営者は、重要な規約変更時にユーザーに通知することを努めますが、ユーザーも定期的に規約を確認する責任があります。</ListItem>
        <ListItem>本規約は、本サービスに関連するすべてのガイドラインやポリシーとともに、利用者と運営者との間の全ての関係を規定します。</ListItem>
      </OrderedList>
      {/* 第2条 */}
      <Heading size="md" mt="0.5em">第2条（禁止事項）</Heading>
      <OrderedList>
        <ListItem>ユーザーは、以下の行為を含む、本サービスの運営を妨げる行為を行ってはなりません。</ListItem>
        <UnorderedList>
          <ListItem>サーバーやネットワークの機能を損なう行為。</ListItem>
          <ListItem>不正アクセス、ウイルスの拡散、なりすまし行為など、他のユーザーや第三者に不利益を与える行為。</ListItem>
          <ListItem>運営者、他のユーザー、または第三者の著作権、プライバシー権、その他の権利を侵害する行為。</ListItem>
          <ListItem>法令に違反する行為や公序良俗に反する行為。</ListItem>
        </UnorderedList>
        <ListItem>上記禁止事項に違反した場合、運営者は利用停止やアクセス禁止などの措置を取ることができます。また、必要に応じて法的措置を講じることがあります。</ListItem>
      </OrderedList>
      {/* 第3条 */}
      <Heading size="md" mt="0.5em">第3条（本サービスの提供の停止等）</Heading>
      <OrderedList>
        <ListItem>運営者は、以下のような場合に本サービスの提供を一時的に中断または停止することがあります。</ListItem>
        <UnorderedList>
          <ListItem>システムの保守、点検、更新を行う場合。</ListItem>
          <ListItem>地震、洪水、火災などの天災や不可抗力によりサービス提供が困難な場合。</ListItem>
          <ListItem>サーバーやネットワークの障害が発生した場合。</ListItem>
          <ListItem>法令の変更や政府の指示によりサービス運営が困難になった場合。</ListItem>
          <ListItem>その他、運営者が必要と判断した場合。</ListItem>
        </UnorderedList>
        <ListItem>提供停止や中断によるユーザーまたは第三者の損害について、運営者は責任を負わないものとします。ユーザーは、本サービスの利用に伴うリスクを理解し、自己責任で利用するものとします。</ListItem>
      </OrderedList>
      {/* 第4条 */}
      <Heading size="md" mt="0.5em">第4条（保証の否認および免責事項）</Heading>
      <OrderedList>
        <ListItem>本サービスで提供される情報（支援制度や支援金額など）は参考情報として提供され、その正確性や有効性については保証しません。</ListItem>
        <ListItem>ユーザーが本サービスを利用して生じた損害について、運営者は責任を負わないものとします。ただし、運営者の故意または重大な過失による損害の場合はこの限りではありません。</ListItem>
        <ListItem>ユーザーが第三者に損害を与えた場合、その賠償責任はユーザーが負うものとします。運営者は、ユーザーの行為による第三者への損害に対して一切の責任を負いません。</ListItem>
        <ListItem>本サービスを介して取得された情報やサービスを利用することによって生じるリスクは、ユーザーが負うものとします。データのダウンロードによる損失やその他の損害について、運営者は責任を負いません。</ListItem>
      </OrderedList>
      {/* 第5条 */}
      <Heading size="md" mt="0.5em">第5条（サービス内容の変更等）</Heading>
      <OrderedList>
        <ListItem>運営者は、ユーザーに対して事前に通知することなく本サービスの内容を変更する権利を有します。これには、サービスの機能の追加や削除、インターフェースの変更、利用可能な支援制度の更新などが含まれます。</ListItem>
        <ListItem>本条に基づく変更によってユーザーに生じた損害について、運営者は責任を負いません。ただし、運営者の故意または重大な過失による損害の場合はこの限りではありません。</ListItem>
        <ListItem>ユーザーが変更後も本サービスを利用し続ける場合、最新のサービス内容に同意したものとみなされます。</ListItem>
      </OrderedList>
      {/* 第6条 */}
      <Heading size="md" mt="0.5em">第6条（利用規約の変更）</Heading>
      <OrderedList>
        <ListItem>運営者は、本規約の内容を随時変更することができます。変更は、法的要件を満たす範囲内で行われます。</ListItem>
        <ListItem>本規約の変更は、本サービスのWebサイト上での掲示をもって効力を発生します。変更後、ユーザーは新しい規約に従うものとします。重要な変更の場合は、ユーザーに直接通知を行います。</ListItem>
        <ListItem>ユーザーは、定期的に本サービスのWebサイトを確認し、最新の利用規約を理解し遵守するものとします。</ListItem>
        <ListItem>本規約の変更後に本サービスを利用した場合、変更された規約に同意したものとみなされます。</ListItem>
        <ListItem>変更内容がユーザーに不利益をもたらす場合、ユーザーは本サービスの利用を停止する権利を有します。</ListItem>
      </OrderedList>
      {/* 第7条 */}
      <Heading size="md" mt="0.5em">第7条（個人情報の取扱い）</Heading>
      <OrderedList>
        <ListItem>個人情報の取扱いについては、別途定めるプライバシーポリシーに従います。このポリシーは、ユーザーの個人情報の収集、使用、保護に関する詳細を記載しています。</ListItem>
      </OrderedList>
      {/* 第8条 */}
      <Heading size="md" mt="0.5em">第8条（準拠法・裁判管轄）</Heading>
      <OrderedList>
        <ListItem>本規約の解釈にあたっては、日本法を準拠法とします。</ListItem>
        <ListItem>本サービスに関して紛争が生じた場合、東京地方裁判所を専属的合意管轄裁判所とします。</ListItem>
      </OrderedList>
      <br />
      <Text>制定日：2024年1月22日</Text>
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
