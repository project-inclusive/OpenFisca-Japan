import React, { useEffect, useState } from 'react';
import {
  Box,
  Center,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Text,
  Flex,
  Button,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import configData from '../config/app_config.json';
import questionExamples from '../config/question_examples.json';

type Question = {
  title: string;
  example: string;
};

type Section = {
  heading: string;
  question: Question[];
};

const App: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    setSections(questionExamples);
  }, []);

  return (
    <Box bg="white" borderRadius="xl" p={4} m={4}>
      <Center
        fontSize={configData.style.titleFontSize}
        fontWeight="semibold"
        color="blue.800"
        mb="0.5em"
      >
        {configData.question_examples.title}
      </Center>
      {sections.map((section, i) => (
        <Card mt={2} key={i}>
          <CardHeader>
            <Heading size="md" color="blue.800">
              {section.heading}
            </Heading>
          </CardHeader>
          {section.questions.map((question, j) => (
            <CardBody ml={2} key={j}>
              <Heading size="sm" color="blue.800">
                {question.title}
              </Heading>
              <Flex mt={3}>
                <Center>
                  <Text>（例）</Text>
                </Center>
                <Text fontSize="sm">{question.example}</Text>
              </Flex>
            </CardBody>
          ))}
        </Card>
      ))}
      <Center mt={2}>
        <Button leftIcon={<CloseIcon />} onClick={() => window.close()}>
          <Text>{configData.question_examples.closeButtonText}</Text>
        </Button>
      </Center>
    </Box>
  );
};

export default App;
