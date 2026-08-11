import { RefObject, useCallback, useState } from 'react';
import * as htmlToImage from 'html-to-image';

const createTimestamp = (date = new Date()): string => {
  const twoDigits = (value: number) => value.toString().padStart(2, '0');

  return [
    date.getFullYear(),
    twoDigits(date.getMonth() + 1),
    twoDigits(date.getDate()),
    '_',
    twoDigits(date.getHours()),
    twoDigits(date.getMinutes()),
    twoDigits(date.getSeconds()),
  ].join('');
};

export const useReferralExport = (documentRef: RefObject<HTMLDivElement>) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const downloadPng = useCallback(async (): Promise<void> => {
    if (!documentRef.current || isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const dataUri = await htmlToImage.toPng(documentRef.current, {
        backgroundColor: '#C4F1F9',
        cacheBust: true,
        pixelRatio: 2,
      });
      const anchor = document.createElement('a');
      anchor.href = dataUri;
      anchor.download = `紹介状_${createTimestamp()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (error) {
      console.error('Failed to export referral letter as PNG:', error);
      setExportError(
        '画像を保存できませんでした。時間をおいて、もう一度お試しください。'
      );
    } finally {
      setIsExporting(false);
    }
  }, [documentRef, isExporting]);

  const printDocument = useCallback((): void => {
    setExportError(null);
    window.print();
  }, []);

  return {
    downloadPng,
    printDocument,
    isExporting,
    exportError,
    clearExportError: () => setExportError(null),
  };
};

export { createTimestamp };
