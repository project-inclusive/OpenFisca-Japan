import { createActor } from 'xstate';
import { HouseholdRelationship } from './household';
import {
  QuestionHistory,
  QuestionStateContext,
  questionStateMachine,
} from './questionState';
import { QuestionKey } from '../question';

// 世帯員ごとに進捗をどれくらいの割合で表示するかを定義
const progressRatio: Record<HouseholdRelationship, number> = {
  あなた: 0.6,
  配偶者: 0.2,
  子ども: 0.1,
  親: 0.1,
};

export interface MaxProgress {
  あなた: number;
  配偶者: number;
  子ども: number;
  親: number;
}

// モードごとの総質問数を事前に計算
export const maxProgressOf = (
  mode:
    | 'かんたん見積もり'
    | 'くわしく見積もり'
    | '能登半島地震被災者支援制度見積もり'
): MaxProgress => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: mode,
    },
  });
  actor.send({ type: 'next' });

  const progress = {
    あなた: 0,
    配偶者: 0,
    子ども: 0,
    親: 0,
  };

  while (
    actor.getSnapshot().value !== '配偶者はいますか？' &&
    actor.getSnapshot().value !== 'result'
  ) {
    actor.send({ type: 'next' });
    progress['あなた']++;
  }

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  while (
    actor.getSnapshot().value !== '子どもの人数' &&
    actor.getSnapshot().value !== 'result'
  ) {
    actor.send({ type: 'next' });
    progress['配偶者']++;
  }

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  while (
    actor.getSnapshot().value !== '親の人数' &&
    actor.getSnapshot().value !== 'result'
  ) {
    actor.send({ type: 'next' });
    progress['子ども']++;
  }

  actor.send({ type: '親の人数', value: { type: 'PersonNum', selection: 1 } });
  actor.send({ type: 'next' });

  while (actor.getSnapshot().value !== 'result') {
    actor.send({ type: 'next' });
    progress['親']++;
  }

  return progress;
};

// 質問の状態から回答進捗（0~1）を算出
export const calculateProgress = (
  context: QuestionStateContext,
  currentQuestion: string,
  maxProgress: MaxProgress
): number => {
  // NOTE: 特殊処理: 子どもの人数は「あなた」の質問だが、この回答の時点であなた、配偶者の回答が完了している
  if (currentQuestion === '子どもの人数') {
    return progressRatio['あなた'] + progressRatio['配偶者'];
  }
  // 親の人数も同様
  if (currentQuestion === '親の人数') {
    return (
      progressRatio['あなた'] +
      progressRatio['配偶者'] +
      progressRatio['子ども']
    );
  }

  switch (context.currentMember.relationship) {
    case 'あなた':
      return selfProgress(context, maxProgress);
    case '配偶者':
      return spouseProgress(context, maxProgress);
    case '子ども':
      return childProgress(context, maxProgress);
    case '親':
      return parentProgress(context, maxProgress);
  }
};

const selfProgress = (
  context: QuestionStateContext,
  maxProgress: MaxProgress
) => {
  return progressOf({
    context,
    baseProgress: 0,
    offsetHistory: {
      key: '寝泊まりしている地域',
      member: { relationship: 'あなた', index: 0 },
    },
    relationshipMaxProgress: maxProgress['あなた'],
    maxPersonNum: 1,
  });
};

const spouseProgress = (
  context: QuestionStateContext,
  maxProgress: MaxProgress
) => {
  return progressOf({
    context,
    baseProgress: progressRatio['あなた'],
    offsetHistory: {
      key: '配偶者はいますか？',
      member: { relationship: 'あなた', index: 0 },
    },
    relationshipMaxProgress: maxProgress['配偶者'],
    maxPersonNum: 1,
  });
};

const childProgress = (
  context: QuestionStateContext,
  maxProgress: MaxProgress
) => {
  return progressOf({
    context,
    baseProgress: progressRatio['あなた'] + progressRatio['配偶者'],
    offsetHistory: {
      key: '子どもの人数',
      member: { relationship: 'あなた', index: 0 },
    },
    relationshipMaxProgress: maxProgress['子ども'],
    maxPersonNum: context.子どもの人数.あなた[0].selection ?? 1,
  });
};

const parentProgress = (
  context: QuestionStateContext,
  maxProgress: MaxProgress
) => {
  return progressOf({
    context,
    baseProgress:
      progressRatio['あなた'] +
      progressRatio['配偶者'] +
      progressRatio['子ども'],
    offsetHistory: {
      key: '親の人数',
      member: { relationship: 'あなた', index: 0 },
    },
    relationshipMaxProgress: maxProgress['親'],
    maxPersonNum: context.親の人数.あなた[0].selection ?? 1,
  });
};

const progressOf = ({
  context,
  baseProgress,
  offsetHistory,
  relationshipMaxProgress,
  maxPersonNum,
}: {
  context: QuestionStateContext;
  baseProgress: number;
  offsetHistory: QuestionHistory;
  relationshipMaxProgress: number;
  maxPersonNum: number;
}) => {
  // 現在回答している続柄に関する質問の回答数
  const currentProgress = context.histories.length;
  // どの質問からこの続柄が始まるか
  // HACK: findIndexは要素が見つからない場合-1を返すため0に補正
  const progressOffset = offsetHistory
    ? Math.max(
        0,
        context.histories.findIndex(
          (h) =>
            h.key === offsetHistory.key &&
            h.member.relationship === offsetHistory.member.relationship &&
            h.member.index === offsetHistory.member.index
        )
      )
    : 0;
  const relationshipProgress = currentProgress - progressOffset;

  // 続柄ごとの進捗比率
  const ratio = progressRatio[context.currentMember.relationship];

  const progress = Math.min(
    relationshipProgress / (maxPersonNum * relationshipMaxProgress),
    1
  );

  // 別の続柄の世帯員の回答割合 + 回答中の続柄の進捗比率 * 回答中の続柄の回答割合
  return baseProgress + ratio * progress;
};
