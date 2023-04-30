import { Birthday } from "./attributes/Birthday";
import { ChildrenNum } from "./attributes/ChildrenNum";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";

export const FormYou = () => {
  const yourName = "あなた";
  return (
    <>
      <h3>あなたについて</h3>
      <Birthday personName={yourName} />
      <Income personName={yourName} />
      <ChildrenNum />
      <Disability personName={yourName} />
    </>
  );
};
