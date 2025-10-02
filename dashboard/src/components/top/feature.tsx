import { Center, Image, Text, VStack } from '@chakra-ui/react';
import configData from '../../config/app_config.json';

export const Feature = ({
  image,
  title,
  titleColor,
  descriptions,
}: {
  image: string;
  title: string;
  titleColor: string;
  descriptions: string[];
}) => {
  return (
    <VStack marginTop={4} width="auto">
      <Image src={image} background="white" rounded="100%" width="70%" />
      <Text
        fontSize={configData.style.titleFontSize}
        textAlign="center"
        marginTop="0.5em"
        marginBottom="0.5em"
        color={titleColor}
      >
        {title}
      </Text>
      <Center>
        <VStack align="flex-start" minH="12em">
          {descriptions.map((desc, index) => (
            <Text key={index} fontSize={configData.style.featureFontSize}>
              {desc}
            </Text>
          ))}
        </VStack>
      </Center>
    </VStack>
  );
};
