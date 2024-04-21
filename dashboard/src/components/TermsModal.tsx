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
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import configData from '../config/app_config.json';
import { agreedToTermsAtom } from '../state';
import Terms from './Terms';

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

  // チェックボックスの値が変更された時
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreedToTerms(event.target.checked);
    setIsChecked(event.target.checked);
  }, []);

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
              利用規約に同意します。
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
