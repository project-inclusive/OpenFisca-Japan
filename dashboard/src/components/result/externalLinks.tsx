import { Button, Center, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import configData from '../../config/app_config.json';

export const ExternalLinks = ({
  conditions,
}: {
  conditions: { カタリバ: boolean };
}) => {
  return (
    <>
      {conditions.カタリバ && (
        <>
          <Center pr={4} pl={4} pb={2}>
            <Text color="blue.900">
              {configData.result.externalLinks.カタリバ.description}
            </Text>
          </Center>
          <Center pr={4} pl={4} pb={4}>
            <Button
              as={RouterLink}
              to={configData.result.externalLinks.カタリバ.url}
              fontSize={configData.style.externalLinkFontSize}
              borderRadius="xl"
              height="2em"
              width="100%"
              bg={configData.result.externalLinks.カタリバ.color}
              color="white"
              // hover時に元の色を薄くする
              _hover={{
                bg: `color-mix(in srgb, ${configData.result.externalLinks.カタリバ.color} 60%, #ffffff);`,
              }}
              // 新しいタブで開く
              target="_blank"
              rel="noopener noreferrer"
            >
              {configData.result.externalLinks.カタリバ.buttonText}
            </Button>
          </Center>
        </>
      )}
    </>
  );
};
