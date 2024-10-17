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
  const [isChecked, setIsChecked] = useState(false);
  const [isRestrictionsChecked, setIsRestrictionsChecked] = useState(false);

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
              ・見積もり対象となるのは
              <Link color="cyan.600" onClick={programListModalChange}>
                一覧
              </Link>
              の制度のみです。各制度をタップ・クリックして表示される公式サイトの情報をもとに見積もりを行います。
              <br />
              ・最新かつ正確な情報が本サイトに反映されていない場合があり、必ずしも見積もり結果の通り支援が受けられることを保証するものではありません。
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
              colorScheme="cyan"
              mt="1em"
              mb="1em"
              data-testid="restrictions-checkbox"
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
              colorScheme="cyan"
              mt="1em"
              mb="1em"
              data-testid="terms-checkbox"
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
                p="1em"
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
