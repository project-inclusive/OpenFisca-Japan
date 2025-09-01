import { AddressQuestion } from './questions/addressQuestion';
import { SpouseAgeQuestion } from './questions/spouseAgeQuestion';
import { ChildAgeQuestion } from './questions/childAgeQuestion';
import { ParentAgeQuestion } from './questions/parentAgeQuestion';
import { SpouseExistsQuestion } from './questions/spouseExistsQuestion';
import { SelfIncomeQuestion } from './questions/selfIncomeQuestion';
import { ChildrenNumQuestion } from './questions/childrenNumQuestion';
import { ParentNumQuestion } from './questions/parentNumQuestion';
import { SelfWorkQuestion } from './questions/selfWorkQuestion';
import { SelfOccupationQuestion } from './questions/selfOccupationQuestion';
import { QuestionList } from './questionList';
import { SelfAgeQuestion } from './questions/selfAgeQuestion';
import { DummyQuestion } from './questions/dummyQuestion';
import { SelfHealthCondition } from './questions/selfHealthCondition';
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
import { SpouseStudent } from './questions/spouseStudent';
import { ParentStudent } from './questions/parentStudent';
import { SelfNewJob } from './questions/selfNewJob';
import { SpouseNewJob } from './questions/spouseNewJob';
import { ChildNewJob } from './questions/childNewJob';
import { ParentNewJob } from './questions/parentNewJob';
import { Problems } from './questions/problems';
import { SpouseHealthCondition } from './questions/spouseHealthCondition';
import { ParentHealthCondition } from './questions/parentHealthCondition';
import { ChildHealthCondition } from './questions/childHealthCondition';
import { SelfIndustrialAccident } from './questions/selfIndustrialAccident';
import { SpouseIndustrialAccident } from './questions/spouseIndustrialAccidentDisease';
import { ChildIndustrialAccident } from './questions/childIndustrialAccidentDisease';
import { ParentIndustrialAccident } from './questions/parentIndustrialAccidentDisease';
import { SelfLeaveOfAbsenseByAccident } from './questions/selfLeaveOfAbsenseByAccident';
import { SpouseLeaveOfAbsenseByAccident } from './questions/spouseLeaveOfAbsenseByAccident';
import { ParentLeaveOfAbsenseByAccident } from './questions/parentLeaveOfAbsenseByAccident';
import { ParentLeaveOfAbsenseWithoutIncome } from './questions/parentLeaveOfAbsenseWithoutIncome';
import { ChildLeaveOfAbsenseWithoutIncome } from './questions/childLeaveOfAbsenseWithoutIncome';
import { SpouseLeaveOfAbsenseWithoutIncome } from './questions/spouseLeaveOfAbsenseWithoutIncome';
import { SelfLeaveOfAbsenseWithoutIncome } from './questions/selfLeaveOfAbsenseWithoutIncome';
import { SelfLeaveOfAbsense } from './questions/SelfLeaveOfAbsense';
import { SpouseLeaveOfAbsense } from './questions/spouseLeaveOfAbsense';
import { ChildLeaveOfAbsense } from './questions/childLeaveOfAbsense';
import { ParentLeaveOfAbsense } from './questions/parentLeaveOfAbsense';
import { ChildLeaveOfAbsenseByAccident } from './questions/childLeaveOfAbsenseByAccident';
import { SpouseIncomeQuestion } from './questions/spouseIncomeQuestion';
import { ChildIncomeQuestion } from './questions/childIncomeQuestion';
import { ParentIncomeQuestion } from './questions/parentIncomeQuestion';
import { SpouseWorkQuestion } from './questions/spouseWorkQuestion';
import { SpouseOccupationQuestion } from './questions/spouseOccupationQuestion';
import { ChildWorkQuestion } from './questions/childWorkQuestion';
import { ChildOccupationQuestion } from './questions/childOccupationQuestion';
import { ParentWorkQuestion } from './questions/parentWorkQuestion';
import { ParentOccupationQuestion } from './questions/parentOccupationQuestion';

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
      component: <SelfNewJob key={6} />,
    },
    {
      title: '休業中',
      component: <SelfLeaveOfAbsense key={7} />,
    },
    {
      title: '休業中の給与の支払い',
      component: <SelfLeaveOfAbsenseWithoutIncome key={8} />,
    },
    {
      title: '病気、けが、障害',
      component: <SelfHealthCondition key={9} />,
    },
    {
      title: '業務による病気、けが',
      component: <SelfIndustrialAccident key={10} />,
    },
    {
      title: '病気、けがにより3日以上休業',
      component: <SelfLeaveOfAbsenseByAccident key={11} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={12} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={13} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={14} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={15} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={16} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={17} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={18} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={19} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={25} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={26} />,
    },
    {
      title: '身体障害者手帳',
      component: <SelfPhysicalDisability key={27} />,
    },
    {
      title: '精神障害者手帳',
      component: <SelfMentalDisability key={28} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <SelfIntellectualDisability key={29} />,
    },
    {
      title: '放射線障害',
      component: <SelfRadiationDamage key={30} />,
    },
    {
      title: '内部障害',
      component: <SelfInternalDisability key={31} />,
    },
    {
      title: '脳性まひ',
      component: <SelfCerebralParalysis key={32} />,
    },
    {
      title: '介護施設',
      component: <SelfNursingHome key={33} />,
    },
    {
      title: '学生かどうか',
      component: <SelfStudent key={34} />,
    },
    {
      title: '家を借りたい',
      component: <SelfRentingHouse key={35} />,
    },
    {
      title: '妊娠',
      component: <SelfPregnancy key={36} />, // TODO: 「あなた」「配偶者」いずれか一方のみ妊産婦を選択できるようにしたい
    },
    {
      title: '困りごと',
      component: <Problems key={37} />,
    },
    {
      title: '配偶者の有無',
      component: <SpouseExistsQuestion key={38} />,
    },
    {
      title: '子どもの人数',
      component: <ChildrenNumQuestion key={39} />,
    },
    {
      title: '親の人数',
      component: <ParentNumQuestion key={40} />,
    },
  ],
  配偶者: [
    {
      title: '年齢',
      component: <SpouseAgeQuestion key={0} />,
    },
    {
      title: '年収',
      component: <SpouseIncomeQuestion key={1} />,
    },
    {
      title: '預金',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '仕事の有無',
      component: <SpouseWorkQuestion key={3} />,
    },
    {
      title: '仕事の種類',
      component: <SpouseOccupationQuestion key={4} />,
    },
    {
      title: '新しい仕事',
      component: <SpouseNewJob key={5} />,
    },
    {
      title: '休業中',
      component: <SpouseLeaveOfAbsense key={6} />,
    },
    {
      title: '休業中の給与の支払い',
      component: <SpouseLeaveOfAbsenseWithoutIncome key={7} />,
    },
    {
      title: '病気、けが、障害',
      component: <SpouseHealthCondition key={8} />,
    },
    {
      title: '業務による病気、けが',
      component: <SpouseIndustrialAccident key={9} />,
    },
    {
      title: '病気、けがにより3日以上休業',
      component: <SpouseLeaveOfAbsenseByAccident key={10} />,
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
      component: <SpousePhysicalDisability key={26} />,
    },
    {
      title: '精神障害者手帳',
      component: <SpouseMentalDisability key={27} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <SpouseIntellectualDisability key={28} />,
    },
    {
      title: '放射線障害',
      component: <SpouseRadiationDamage key={29} />,
    },
    {
      title: '内部障害',
      component: <SpouseInternalDisability key={30} />,
    },
    {
      title: '脳性まひ',
      component: <SpouseCerebralParalysis key={31} />,
    },
    {
      title: '介護施設',
      component: <SpouseNursingHome key={32} />,
    },
    {
      title: '学生かどうか',
      component: <SpouseStudent key={33} />,
    },
    {
      title: '妊娠',
      component: <SpousePregnancy key={34} />, // TODO: 「あなた」「配偶者」いずれか一方のみ妊産婦を選択できるようにしたい
    },
    {
      title: '配偶者がいるがひとり親に該当',
      component: <DummyQuestion key={35} />,
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
      component: <ChildWorkQuestion key={4} />,
    },
    {
      title: '年収',
      component: <ChildIncomeQuestion key={5} />,
    },
    {
      title: '仕事の種類',
      component: <ChildOccupationQuestion key={6} />,
    },
    {
      title: '新しい仕事',
      component: <ChildNewJob key={7} />,
    },
    {
      title: '休業中',
      component: <ChildLeaveOfAbsense key={8} />,
    },
    {
      title: '休業中の給与の支払い',
      component: <ChildLeaveOfAbsenseWithoutIncome key={9} />,
    },
    {
      title: '病気、けが、障害',
      component: <ChildHealthCondition key={10} />,
    },
    {
      title: '業務による病気、けが',
      component: <ChildIndustrialAccident key={11} />,
    },
    {
      title: '病気、けがにより3日以上休業',
      component: <ChildLeaveOfAbsenseByAccident key={12} />,
    },
    {
      title: '入院中',
      component: <DummyQuestion key={13} />,
    },
    {
      title: '在宅療養中',
      component: <DummyQuestion key={14} />,
    },
    {
      title: '感染症',
      component: <DummyQuestion key={15} />,
    },
    {
      title: 'HIV',
      component: <DummyQuestion key={16} />,
    },
    {
      title: 'エイズ発症',
      component: <DummyQuestion key={17} />,
    },
    {
      title: '血液製剤による感染者',
      component: <DummyQuestion key={18} />,
    },
    {
      title: '血液製剤投与によるHIV感染',
      component: <DummyQuestion key={19} />,
    },
    {
      title: 'C型肝炎',
      component: <DummyQuestion key={20} />,
    },
    {
      title: '血液製剤投与によるC型肝炎感染',
      component: <DummyQuestion key={21} />,
    },
    {
      title: '肝硬変、肝がん、肝移植',
      component: <DummyQuestion key={22} />,
    },
    {
      title: '腎不全',
      component: <DummyQuestion key={23} />,
    },
    {
      title: '慢性腎不全',
      component: <DummyQuestion key={24} />,
    },
    {
      title: '人工透析',
      component: <DummyQuestion key={25} />,
    },
    {
      title: '血液凝固因子異常症の有無',
      component: <DummyQuestion key={26} />,
    },
    {
      title: '血液凝固因子異常症',
      component: <DummyQuestion key={27} />,
    },
    {
      title: '身体障害者手帳',
      component: <ChildPhysicalDisability key={28} />,
    },
    {
      title: '精神障害者手帳',
      component: <ChildMentalDisability key={29} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <ChildIntellectualDisability key={30} />,
    },
    {
      title: '放射線障害',
      component: <ChildRadiationDamage key={31} />,
    },
    {
      title: '内部障害',
      component: <ChildInternalDisability key={32} />,
    },
    {
      title: '脳性まひ',
      component: <ChildCerebralParalysis key={33} />,
    },
    {
      title: '介護施設',
      component: <ChildNursingHome key={34} />,
    },
  ],
  親: [
    {
      title: '年齢',
      component: <ParentAgeQuestion key={0} />,
    },
    {
      title: '年収',
      component: <ParentIncomeQuestion key={1} />,
    },
    {
      title: '預金',
      component: <DummyQuestion key={2} />,
    },
    {
      title: '仕事の有無',
      component: <ParentWorkQuestion key={3} />,
    },
    {
      title: '仕事の種類',
      component: <ParentOccupationQuestion key={4} />,
    },
    {
      title: '新しい仕事',
      component: <ParentNewJob key={5} />,
    },
    {
      title: '休業中',
      component: <ParentLeaveOfAbsense key={6} />,
    },
    {
      title: '休業中の給与の支払い',
      component: <ParentLeaveOfAbsenseWithoutIncome key={7} />,
    },
    {
      title: '病気、けが、障害',
      component: <ParentHealthCondition key={8} />,
    },
    {
      title: '業務による病気、けが',
      component: <ParentIndustrialAccident key={9} />,
    },
    {
      title: '病気、けがにより3日以上休業',
      component: <ParentLeaveOfAbsenseByAccident key={10} />,
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
      component: <ParentPhysicalDisability key={26} />,
    },
    {
      title: '精神障害者手帳',
      component: <ParentMentalDisability key={27} />,
    },
    {
      title: '療育手帳、愛の手帳',
      component: <ParentIntellectualDisability key={28} />,
    },
    {
      title: '放射線障害',
      component: <ParentRadiationDamage key={29} />,
    },
    {
      title: '内部障害',
      component: <ParentInternalDisability key={30} />,
    },
    {
      title: '脳性まひ',
      component: <ParentCerebralParalysis key={31} />,
    },
    {
      title: '介護施設',
      component: <ParentNursingHome key={32} />,
    },
    {
      title: '学生かどうか',
      component: <ParentStudent key={33} />,
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
