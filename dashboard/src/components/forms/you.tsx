import { Birthday } from "./attributes/Birthday";
import { Student } from "./attributes/Student";
import { ChildrenNum } from "./attributes/ChildrenNum";
import { SpouseExists } from "./attributes/SpouseExists";
import { Income } from "./attributes/Income";
import { Disability } from "./attributes/Disability";

export const FormYou = () => {
  const yourName = "あなた";
  return (
    <>
      <h3>あなたについて</h3>
      <Birthday personName={yourName} />
      <Disability personName={yourName} />
      <Student personName={yourName} />
      <Income personName={yourName} />
      <SpouseExists />
      <ChildrenNum />
    </>
  );
};
