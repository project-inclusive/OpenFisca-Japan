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
  useDisclosure,
} from '@chakra-ui/react';

import configData from '../config/app_config.json';
import Terms from './Terms';
import { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { agreedToTermsAtom } from '../state';

function TermsModal() {
  const [agreedToTerms, setAgreedToTerms] = useRecoilState(agreedToTermsAtom);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isChecked, setIsChecked] = useState(false);

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreedToTerms(event.target.checked);
    setIsChecked(event.target.checked);
  }, []);

  return (
    <>
      <Center pr={4} pl={4} pb={4} style={{ textAlign: 'center' }}>
        {!agreedToTerms && (
          <Button
            onClick={onOpen}
            fontSize={configData.style.subTitleFontSize}
            borderRadius="xl"
            height="4em"
            width="100%"
            bg="blue.500"
            color="white"
            _hover={{ bg: 'blue.600' }}
          >
            はじめる
          </Button>
        )}
      </Center>

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
        <ModalContent maxW={900}>
          <ModalHeader>
            <Center
              fontSize={configData.style.subTitleFontSize}
              fontWeight="semibold"
              color="blue.800"
            >
              利用規約
            </Center>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Terms />
          </ModalBody>

          <Center>
            <Checkbox
              isChecked={isChecked}
              onChange={onChange}
              colorScheme="cyan"
              mb={2}
            >
              利用規約に同意します。
            </Checkbox>
          </Center>

          <Center>
            <ModalFooter>
              <Button
                fontSize={configData.style.subTitleFontSize}
                bg="blue.500"
                color="white"
                p="1.5em"
                borderRadius="xl"
                height="2em"
                width="100%"
                isDisabled={!agreedToTerms}
                onClick={onClose}
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
