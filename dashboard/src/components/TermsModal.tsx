import {
  Button,
  Center,
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  Link,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import configData from '../config/app_config.json';
import { agreedToTermsAtom } from '../state';
import Terms from './Terms';
import { List } from './Description';

function TermsModal({
  isOpen,
  onOpen,
  onClose,
  to,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  to: string;
}) {
  const [agreedToTerms, setAgreedToTerms] = useRecoilState(agreedToTermsAtom);
  const [isChecked, setIsChecked] = useState(agreedToTerms);
  const [isRestrictionsChecked, setIsRestrictionsChecked] =
    useState(agreedToTerms);

  // 見積もり対象制度一覧モーダルの開閉
  const [isprogramListModalOpen, setProgramListModalOpen] = useState(false);

  useEffect(() => {
    if (isChecked && isRestrictionsChecked) {
      setAgreedToTerms(true);
    } else {
      setAgreedToTerms(false);
    }
  }, [isChecked, isRestrictionsChecked, setAgreedToTerms]);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  }, []);

  const onChangeRestrictions = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsRestrictionsChecked(event.target.checked);
    },
    []
  );

  function programListModalChange() {
    setProgramListModalOpen(!isprogramListModalOpen);
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          // HACK: ×ボタンで閉じた場合は規約の同意をリセット
          setAgreedToTerms(false);
          setIsChecked(false);
        }}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxW={900} bg="cyan.100">
          <ModalCloseButton />

          <ModalHeader color="teal.500" fontWeight="semibold">
            <h2>制限事項</h2>
          </ModalHeader>

          <ModalBody overflowY="scroll" maxHeight="40vh">
            <Box bg="white" borderRadius="xl" p={4}>
              このアプリでは、
              <Link color="cyan.600" onClick={programListModalChange}>
                一覧
              </Link>
              に掲載されている制度をもとに見積もりを行っています。
              各制度の詳細は、リンク先の公式サイトでもあわせてご確認ください。
              <br />
              <br />
              できる限り正確な情報を掲載していますが、内容が最新でない場合があります。
              そのため、見積もりの結果が実際の支援内容と異なることがあります。
              <br />
              結果の通り支援が受けられることは保証できませんのであらかじめご了承ください。
              <br />
              詳細や最新情報については、各制度の公式サイトや窓口でご確認ください。
            </Box>
          </ModalBody>

          {/* List of systems eligible for quotation */}
          <Modal
            isOpen={isprogramListModalOpen}
            onClose={programListModalChange}
            closeOnOverlayClick={false}
          >
            <ModalOverlay />
            <ModalContent maxW={900} bg="cyan.100" pb="5">
              {/* Close Button */}
              <ModalCloseButton />

              <ModalHeader color="teal.500" fontWeight="semibold">
                <h2>見積もり対象制度一覧</h2>
              </ModalHeader>

              <ModalBody overflowY="scroll">
                <Box bg="white" borderRadius="xl" p={4}>
                  <List />
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>

          <Center>
            <Checkbox
              isChecked={isRestrictionsChecked}
              onChange={onChangeRestrictions}
              colorScheme="blue"
              mt="1em"
              mb="1em"
              data-testid="restrictions-checkbox"
              bg="teal.300"
              padding="0.5em"
              borderRadius="10%"
            >
              了解しました
            </Checkbox>
          </Center>

          <ModalHeader color="teal.500" fontWeight="semibold">
            <h2>利用規約</h2>
          </ModalHeader>

          <ModalBody overflowY="scroll" maxHeight="40vh">
            <Terms />
          </ModalBody>

          <Center>
            <Checkbox
              isChecked={isChecked}
              onChange={onChange}
              colorScheme="blue"
              mt="1em"
              mb="1em"
              data-testid="terms-checkbox"
              bg="teal.300"
              padding="0.5em"
              borderRadius="10%"
            >
              了解しました
            </Checkbox>
          </Center>

          <Center>
            <ModalFooter>
              <Button
                as={RouterLink}
                // HACK: RouterLinkはisDisabledで遷移を防げないため、規約に同意するまで同じページに遷移するようにする
                to={agreedToTerms ? to : '/'}
                fontSize={configData.style.subTitleFontSize}
                bg="cyan.600"
                color="white"
                p="1.5em"
                borderRadius="xl"
                width="100%"
                isDisabled={!agreedToTerms}
                data-testid="start-button"
              >
                利用開始する
              </Button>
            </ModalFooter>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}

export default TermsModal;
