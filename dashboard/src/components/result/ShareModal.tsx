import {
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import configData from '../../config/app_config.json';
import { QRCodeCanvas } from 'qrcode.react';

export default function ShareModal({
  isOpen,
  onClose,
  url,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => onClose()}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxW={500}>
          <ModalHeader>
            <Center
              fontSize={configData.style.subTitleFontSize}
              fontWeight="semibold"
              color="blue.800"
            >
              シェアする
            </Center>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody overflowY="scroll" maxHeight="50vh">
            {/* QRコード表示部分 */}
            <Center>
              <QRCodeCanvas value={url} size={200} />
            </Center>
          </ModalBody>

          <Center>
            <ModalFooter>
              <Button
                onClick={onClose}
                fontSize={configData.style.subTitleFontSize}
                bg="cyan.600"
                color="white"
                p="1em"
                borderRadius="xl"
                width="100%"
              >
                閉じる
              </Button>
            </ModalFooter>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}
