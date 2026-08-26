import { Flex, Icon, Link } from '@chakra-ui/react';
import { MouseEventHandler } from 'react';
import { FaHome } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

export type HomeLinkProps = {
  to?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  ariaLabel?: string;
};

export const HomeLink = ({
  to = '/',
  onClick,
  ariaLabel = 'ホームに戻る',
}: HomeLinkProps) => {
  return (
    <Flex w="90%" justifyContent="left" marginTop="0.5em">
      <Link
        as={RouterLink}
        to={to}
        aria-label={ariaLabel}
        onClick={onClick}
        display="inline-flex"
        alignItems="center"
        borderRadius="md"
        _focusVisible={{ boxShadow: 'outline' }}
      >
        <Icon
          as={FaHome}
          aria-hidden="true"
          paddingLeft="1.5em"
          justifyContent="left"
          boxSize="4em"
          color="cyan.900"
        />
      </Link>
    </Flex>
  );
};
