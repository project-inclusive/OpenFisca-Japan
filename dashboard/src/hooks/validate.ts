import { useEffect, useState } from 'react';

export const useValidate = () => {
  const [validated, setValidated] = useState<boolean>(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // HACK: バリデーションエラーを起こしたクラスの数を数えることで不正な入力を検知
      setValidated(document.getElementsByClassName('invalid').length === 0);
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return validated;
};
