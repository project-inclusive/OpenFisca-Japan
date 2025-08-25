import { AddressQuestion } from './questions/addressQuestion';
import { SpouseAgeQuestion } from './questions/spouseAgeQuestion';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { ParentAgeQuestion } from './questions/parentAgeQuestion';
import { SpouseExistsQuestion } from './questions/spouseExistsQuestion';
import { SelfIncomeQuestion } from './questions/selfIncomeQuestion';
import { ChildrenNumQuestion } from './questions/childrenNumQuestion';
import { ParentNumQuestion } from './questions/parentNumQuestion';
import { SelfWorkQuestion } from './questions/SelfWorkQuestion';
import { SelfOccupationQuestion } from './questions/selfOccupationQuestion';
import { QuestionList } from './questionList';
import { SelfAgeQuestion } from './questions/selfAgeQuestion';
import { DummyQuestion } from './questions/dummyQuestion';
import { SelfHealthConditionQuestion } from './questions/selfHealthConditionQuestion';
import { SelfPhysicalDisability } from './questions/selfPhysicalDisability';
import { SpousePhysicalDisability } from './questions/spousePhysicalDisability';
import { ChildPhysicalDisability } from './questions/childPhysicalDisability';
import { ParentPhysicalDisability } from './questions/parentPhysicalDisability';
import { SelfIntellectualDisability } from './questions/selfIntellectualDisability';
import { SpouseIntellectualDisability } from './questions/spouseIntellectualDisability';
import { ChildIntellectualDisability } from './questions/childIntellectualDisability';
import { ParentIntellectualDisability } from './questions/parentIntellectualDisability';
import { SelfMentalDisability } from './questions/selfMentalDisability';
import { SpouseMentalDisability } from './questions/spouseMentalDisability';
import { ChildMentalDisability } from './questions/childMentalDisability';
import { ParentMentalDisability } from './questions/parentMentalDisability';
import { SelfInternalDisability } from './questions/selfInternalDisability';
import { SpouseInternalDisability } from './questions/spouseInternalDisability';
import { ChildInternalDisability } from './questions/childInternalDisability';
import { ParentInternalDisability } from './questions/parentInternalDisability';
import { SelfRadiationDamage } from './questions/selfRadiationDamage';
import { SpouseRadiationDamage } from './questions/spouseRadiationDamage';
import { ChildRadiationDamage } from './questions/childRadiationDamage';
import { ParentRadiationDamage } from './questions/parentRadiationDamage';
import { SelfCerebralParalysis } from './questions/selfCerebralParalysis';
import { SpouseCerebralParalysis } from './questions/spouseCerebralParalysis';
import { ChildCerebralParalysis } from './questions/childCerebralParalysis';
import { ParentCerebralParalysis } from './questions/parentCerebralParalysis';
import { SelfRentingHouse } from './questions/selfRentingHouse';
import { SelfNursingHome } from './questions/selfNursingHome';
import { SpouseNursingHome } from './questions/spouseNursingHome';
import { ChildNursingHome } from './questions/childNursingHome';
import { ParentNursingHome } from './questions/parentNursingHome';
import { SelfPregnancy } from './questions/selfPregnancy';
import { SpousePregnancy } from './questions/spousePregnancy';
import { SelfStudent } from './questions/selfStudent';

// NOTE: プログレスバーの計算のために設問に順序関係を定義する必要があるため、objectではなくarrayを使用
// HACK: componentをarray内に定義する際にkeyが必要なため定義している
const questions = {
  あなた: [
    {
      title: '住んでいる場所',
      component: <AddressQuestion key={0} />,
    },
    {
      title: '年齢',
      component: <SelfAgeQuestion key={1} />,
    },
    {
      title: '年収',
      component: <SelfIncomeQuestion key={2} />,
    },
    {
      title: '預金',
      component: <DummyQuestion key={3} />,
    },
    {
      title: '仕事の有無',
      component: <SelfWorkQuestion key={4} />,
    },
    {
      title: '仕事の種類',
      component: <SelfOccupationQuestion key={5} />,
    },
    {
      title: '新しい仕事',
      component: <DummyQuestion key={6} />,
    },
    {
      title: '休業中',
      component: <DummyQuestion key={7} />,
    },
    {
      title: '病気、けが、障害',
      component: <SelfHealthConditionQuestion key={8} />,
    },
    {
      title: '業務による病気、けが',
      component: <DummyQuestion key={9} />,
    },
    {
      title: '3日以上休業',
      component: <DummyQuestion key={10} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={11} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={12} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={13} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={14} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={15} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={16} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={17} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={18} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={19} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={25} />,
    },
    {
      title: '身体障害者手帳',
      component: <SelfPhysicalDisability key={26} />,
    },
    {
      title: '精神障害者手帳',
      component: <SelfMentalDisability key={27} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <SelfIntellectualDisability key={28} />,
    },
    {
      title: '放射線障害',
      component: <SelfRadiationDamage key={29} />,
    },
    {
      title: '内部障害',
      component: <SelfInternalDisability key={30} />,
    },
    {
      title: '脳性まひ',
      component: <SelfCerebralParalysis key={31} />,
    },
    {
      title: '介護施設',
      component: <SelfNursingHome key={32} />,
    },
    {
      title: '学生かどうか',
      component: <SelfStudent key={33} />,
    },
    {
      title: '家を借りたい',
      component: <SelfRentingHouse key={34} />,
    },
    {
      title: '妊娠',
      component: <SelfPregnancy key={35} />, // TODO: 「あなた」「配偶者」いずれか一方のみ妊産婦を選択できるようにしたい
    },
    {
      title: '配偶者の有無',
      component: <SpouseExistsQuestion key={36} />,
    },
    {
      title: '子どもの人数',
      component: <ChildrenNumQuestion key={37} />,
    },
    {
      title: '親の人数',
      component: <ParentNumQuestion key={38} />,
    },
  ],
  配偶者: [
    {
      title: '年齢',
      component: <SpouseAgeQuestion key={0} />,
    },
    {
      title: '年収',
      component: <DummyQuestion key={1} />,
    },
    {
      title: '預金',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '仕事の有無',
      component: <DummyQuestion key={3} />,
    },
    {
      title: '仕事の種類',
      component: <DummyQuestion key={4} />,
    },
    {
      title: '新しい仕事',
      component: <DummyQuestion key={5} />,
    },
    {
      title: '休業中',
      component: <DummyQuestion key={6} />,
    },
    {
      title: '病気、けが、障害',
      component: <DummyQuestion key={7} />,
    },
    {
      title: '業務による病気、けが',
      component: <DummyQuestion key={8} />,
    },
    {
      title: '3日以上休業',
      component: <DummyQuestion key={9} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={10} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={11} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={12} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={13} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={14} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={15} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={16} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={17} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={18} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={19} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '身体障害者手帳',
      component: <SpousePhysicalDisability key={25} />,
    },
    {
      title: '精神障害者手帳',
      component: <SpouseMentalDisability key={26} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <SpouseIntellectualDisability key={27} />,
    },
    {
      title: '放射線障害',
      component: <SpouseRadiationDamage key={28} />,
    },
    {
      title: '内部障害',
      component: <SpouseInternalDisability key={29} />,
    },
    {
      title: '脳性まひ',
      component: <SpouseCerebralParalysis key={30} />,
    },
    {
      title: '介護施設',
      component: <SpouseNursingHome key={31} />,
    },
    {
      title: '妊娠',
      component: <SpousePregnancy key={32} />, // TODO: 「あなた」「配偶者」いずれか一方のみ妊産婦を選択できるようにしたい
    },
    {
      title: '配偶者がいるがひとり親に該当',
      component: <DummyQuestion key={33} />,
    },
  ],
  子ども: [
    {
      title: '年齢',
      component: <ChildAgeQuestion key={0} />,
    },
    {
      title: '高校に通っているかどうか',
      component: <DummyQuestion key={1} />,
    },
    {
      title: '高校履修種別',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '高校運営種別',
      component: <DummyQuestion key={3} />,
    },
    {
      title: '仕事の有無',
      component: <DummyQuestion key={4} />,
    },
    {
      title: '仕事の種類',
      component: <DummyQuestion key={5} />,
    },
    {
      title: '新しい仕事',
      component: <DummyQuestion key={6} />,
    },
    {
      title: '休業中',
      component: <DummyQuestion key={7} />,
    },
    {
      title: '病気、けが、障害',
      component: <DummyQuestion key={8} />,
    },
    {
      title: '業務による病気、けが',
      component: <DummyQuestion key={9} />,
    },
    {
      title: '3日以上休業',
      component: <DummyQuestion key={10} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={11} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={12} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={13} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={14} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={15} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={16} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={17} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={18} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={19} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={25} />,
    },
    {
      title: '身体障害者手帳',
      component: <ChildPhysicalDisability key={26} />,
    },
    {
      title: '精神障害者手帳',
      component: <ChildMentalDisability key={27} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <ChildIntellectualDisability key={28} />,
    },
    {
      title: '放射線障害',
      component: <ChildRadiationDamage key={29} />,
    },
    {
      title: '内部障害',
      component: <ChildInternalDisability key={30} />,
    },
    {
      title: '脳性まひ',
      component: <ChildCerebralParalysis key={31} />,
    },
    {
      title: '介護施設',
      component: <ChildNursingHome key={32} />,
    },
  ],
  親: [
    {
      title: '年齢',
      component: <ParentAgeQuestion key={0} />,
    },
    {
      title: '年収',
      component: <DummyQuestion key={1} />,
    },
    {
      title: '預金',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '仕事の有無',
      component: <DummyQuestion key={3} />,
    },
    {
      title: '仕事の種類',
      component: <DummyQuestion key={4} />,
    },
    {
      title: '新しい仕事',
      component: <DummyQuestion key={5} />,
    },
    {
      title: '休業中',
      component: <DummyQuestion key={6} />,
    },
    {
      title: '病気、けが、障害',
      component: <DummyQuestion key={7} />,
    },
    {
      title: '業務による病気、けが',
      component: <DummyQuestion key={8} />,
    },
    {
      title: '3日以上休業',
      component: <DummyQuestion key={9} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={10} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={11} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={12} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={13} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={14} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={15} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={16} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={17} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={18} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={19} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '身体障害者手帳',
      component: <ParentPhysicalDisability key={25} />,
    },
    {
      title: '精神障害者手帳',
      component: <ParentMentalDisability key={26} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <ParentIntellectualDisability key={27} />,
    },
    {
      title: '放射線障害',
      component: <ParentRadiationDamage key={28} />,
    },
    {
      title: '内部障害',
      component: <ParentInternalDisability key={29} />,
    },
    {
      title: '脳性まひ',
      component: <ParentCerebralParalysis key={30} />,
    },
    {
      title: '介護施設',
      component: <ParentNursingHome key={31} />,
    },
  ],
};

export const DetailedQuestionList = () => {
  return (
    <QuestionList
      questions={questions}
      isSimpleCalculation={false}
      isDisasterCalculation={false}
    />
  );
};
