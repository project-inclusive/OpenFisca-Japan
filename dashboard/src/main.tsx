import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, defineStyleConfig } from '@chakra-ui/react';
import App from './App';
import { extendTheme } from '@chakra-ui/react';

const baseStyle = {
  borderRadius: 'md',
  pt: '2',
  pb: '2',
  pr: '2',
  pl: '3',
};

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        backgroundColor: 'cyan.100',
      },
      html: {
        height: '100%',
      },
    },
  },
  fonts: {
    heading: `'Noto Sans JP', sans-serif`,
    body: `'Noto Sans JP', sans-serif`,
  },
  components: {
    Tooltip: defineStyleConfig({ baseStyle }),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
