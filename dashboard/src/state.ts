import { atom } from 'recoil';

export const currentDateAtom = atom<string>({
  key: 'currentDateAtom',
  default: `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`,
});
