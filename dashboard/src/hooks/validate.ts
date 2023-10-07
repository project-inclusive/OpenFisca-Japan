import { useEffect, useState } from 'react';

export const useValidate = () => {
  const [validated, setValidated] = useState<boolean>(false);

  // フォームに不正な入力（未記入等）があるかどうかを確認
  useEffect(() => {
    // HACK: バリデーションエラーを起こしたクラスの数を数えることで不正な入力を検知
    setValidated(document.getElementsByClassName('invalid').length === 0);
  });

  return validated;
};
