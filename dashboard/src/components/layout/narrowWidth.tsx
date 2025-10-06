import { AbsoluteCenter } from '@chakra-ui/react';
import { ReactNode } from 'react';

// PCの場合に左右に余白を作り、縦長の画面にしたい場合に使用
export const NarrowWidth = ({ children }: { children?: ReactNode }) => {
  return (
    <AbsoluteCenter
      width={{
        base: '100%', // 0-48em
        sm: '100%', // 480px
        md: '80%', // 768px
        lg: '60%', // 992px
        xl: '50%', // 1280px
      }}
      axis="horizontal"
    >
      {children}
    </AbsoluteCenter>
  );
};
