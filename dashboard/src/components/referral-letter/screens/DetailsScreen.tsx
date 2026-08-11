import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';

import { FlowNavigation, FlowShell } from '../../layout/flowShell';
import { ReferralHeader } from '../components/ReferralHeader';
import { isValidReferralEmail } from '../logic';
import { REFERRAL_INPUT_LIMITS } from '../state';
import type { ReferralInputs } from '../types';

type DetailsScreenProps = {
  inputs: ReferralInputs;
  onInput: (field: keyof ReferralInputs, value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export const DetailsScreen = ({
  inputs,
  onInput,
  onBack,
  onNext,
}: DetailsScreenProps) => {
  const emailIsInvalid = !isValidReferralEmail(inputs.email);

  return (
    <FlowShell
      header={<ReferralHeader />}
      title={
        <span id="referral-page-heading" tabIndex={-1}>
          伝えたいこと
        </span>
      }
      navigation={
        <FlowNavigation
          onBack={onBack}
          onNext={onNext}
          nextDisabled={emailIsInvalid}
          nextLabel="完了"
          highContrast
        />
      }
    >
      <Stack spacing={5} w="100%" textAlign="left">
        <Text>
          すべて任意です。入力されていない項目は紹介状に表示しません。
        </Text>

        <FormControl>
          <FormLabel htmlFor="referral-name">氏名（任意）</FormLabel>
          <Input
            id="referral-name"
            name="name"
            value={inputs.name}
            onChange={(event) => onInput('name', event.target.value)}
            maxLength={REFERRAL_INPUT_LIMITS.name}
            minH="44px"
            bg="white"
          />
          <FormHelperText textAlign="right">
            {inputs.name.length} / {REFERRAL_INPUT_LIMITS.name}文字
          </FormHelperText>
        </FormControl>

        <FormControl isInvalid={emailIsInvalid}>
          <FormLabel htmlFor="referral-email">メールアドレス（任意）</FormLabel>
          <Input
            id="referral-email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={(event) => onInput('email', event.target.value)}
            maxLength={REFERRAL_INPUT_LIMITS.email}
            minH="44px"
            aria-describedby={
              emailIsInvalid ? 'referral-email-error' : undefined
            }
            bg="white"
          />
          {emailIsInvalid ? (
            <FormErrorMessage id="referral-email-error" color="red.700">
              メールアドレスの形式で入力してください。
            </FormErrorMessage>
          ) : (
            <FormHelperText textAlign="right">
              {inputs.email.length} / {REFERRAL_INPUT_LIMITS.email}文字
            </FormHelperText>
          )}
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="referral-message">
            他に伝えたいこと（任意）
          </FormLabel>
          <Textarea
            id="referral-message"
            name="message"
            value={inputs.message}
            onChange={(event) => onInput('message', event.target.value)}
            maxLength={REFERRAL_INPUT_LIMITS.message}
            rows={5}
            bg="white"
            aria-describedby="referral-message-count"
          />
          <FormHelperText id="referral-message-count" textAlign="right">
            {inputs.message.length} / {REFERRAL_INPUT_LIMITS.message}文字
          </FormHelperText>
        </FormControl>
      </Stack>
    </FlowShell>
  );
};
