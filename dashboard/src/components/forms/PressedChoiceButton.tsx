import { Button, ButtonProps } from '@chakra-ui/react';

export type PressedChoiceButtonProps = Omit<ButtonProps, 'aria-pressed'> & {
  isPressed: boolean;
  highContrast?: boolean;
};

export const PressedChoiceButton = ({
  isPressed,
  highContrast = false,
  isDisabled = false,
  style,
  children,
  ...buttonProps
}: PressedChoiceButtonProps) => {
  const activeColor = highContrast ? 'cyan.900' : 'cyan.600';
  const resolvedStyle =
    highContrast && isDisabled
      ? {
          ...style,
          opacity: 1,
          background: '#e2e8f0',
          color: '#1a202c',
          borderColor: '#718096',
          cursor: 'not-allowed',
        }
      : style;

  return (
    <Button
      type="button"
      mb={2}
      variant="outline"
      borderRadius="xl"
      height="3.5em"
      width="100%"
      bg={isPressed ? activeColor : 'white'}
      borderColor={isPressed ? 'cyan.900' : 'black'}
      color={isPressed ? 'white' : 'black'}
      _hover={{ bg: activeColor, borderColor: 'cyan.900', color: 'white' }}
      _disabled={
        highContrast
          ? {
              opacity: '1 !important',
              bg: 'gray.200 !important',
              color: 'gray.800 !important',
              borderColor: 'gray.600 !important',
              cursor: 'not-allowed',
              _hover: {
                bg: 'gray.200 !important',
                color: 'gray.800 !important',
                borderColor: 'gray.600 !important',
              },
            }
          : undefined
      }
      _focusVisible={{ boxShadow: 'outline' }}
      {...buttonProps}
      isDisabled={isDisabled}
      style={resolvedStyle}
      aria-pressed={isPressed}
    >
      {children}
    </Button>
  );
};
