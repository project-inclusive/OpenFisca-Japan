import { useEffect, useState } from 'react';
import { Box, Center, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import { data as SocialWelfareData } from '../../config/社会福祉協議会';
import { baseHospitalData } from '../../config/拠点病院';
import configData from '../../config/app_config.json';
import { currentDateAtom, householdAtom } from '../../state';
import { useRecoilValue } from 'recoil';
import { blockOfPrefecture } from '../../config/拠点病院';
import { HelpDeskData } from '../../config/窓口情報形式';
import {
  helloWorkData,
  injuryAndIllnessAllowanceData,
} from '../../config/仕事';
import { publicAssistanceData } from '../../config/生活保護';
import { nationalPensionSystemData } from '../../config/国民年金';
import { nationalHealthInsuranceData } from '../../config/国民健康保険';
import {
  fujimiChildBirthData,
  midwiferyData,
  prenatalCheckUpData,
} from '../../config/妊娠';
import {
  childbirthLumpSumAllowanceData,
  fujimiPostNatalCareData,
  prematureBabyMedicalExpensesData,
} from '../../config/出産';
import {
  childAllowanceData,
  childrenDiseaseMedicalExpensesData,
  childSupportData,
  fujimiChildrenMedicalExpensesData,
  saitamaPrivateSchoolData,
  saitamaSingleParentLoanData,
  singleParentMedicalExpensesData,
} from '../../config/子育て';
import { taxOfficeData } from '../../config/税';
import {
  disabilityAllowanceData,
  disabilityCertificateData,
  disabilityPensionData,
  disabledPersonEmploymentData,
  independenceSupportMedicalData,
  intractableDiseaseData,
  severeDisabilityMedialExpensesData,
} from '../../config/障害';
import {
  longTermCareAllowanceData,
  longTermCareData,
  longTermCarePremiumData,
  longTermCareServiceData,
} from '../../config/介護';

// 社会福祉協議会の窓口
export const SocialWelfareCouncilHelpDesk = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    setPrefecture(household.世帯一覧.世帯1.居住都道府県[currentDate]);
    setCity(household.世帯一覧.世帯1.居住市区町村[currentDate]);
  }, [household]);

  const getSocialWelfareCouncilData = () => {
    if (
      SocialWelfareData[prefecture] &&
      SocialWelfareData[prefecture].hasOwnProperty(city)
    ) {
      const {
        施設名,
        郵便番号,
        所在地,
        経度,
        緯度,
        座標系,
        電話番号,
        WebサイトURL,
      } = SocialWelfareData[prefecture][city];

      return {
        施設名,
        郵便番号,
        所在地,
        経度,
        緯度,
        座標系,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    }

    return {
      施設名: null,
      郵便番号: null,
      所在地: null,
      経度: null,
      緯度: null,
      座標系: null,
      電話番号: null,
      WebサイトURL: '',
      googleMapsURL: '',
    };
  };

  const aboutLink = {
    link: 'https://www.zcwvc.net/about/list.html',
    title: '全国の社会福祉協議会一覧',
  };

  return (
    <Box
      bg="white"
      borderRadius="xl"
      pt={1}
      pb={1}
      pr={2}
      pl={2}
      m={2}
      border="1px solid black"
    >
      {getSocialWelfareCouncilData().施設名 ? (
        <Box>
          {getSocialWelfareCouncilData().WebサイトURL ? (
            <Link
              href={getSocialWelfareCouncilData().WebサイトURL}
              color="blue.500"
              fontWeight={'semibold'}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getSocialWelfareCouncilData().施設名}
            </Link>
          ) : (
            <Text fontWeight={'semibold'}>
              {getSocialWelfareCouncilData().施設名}
            </Text>
          )}
          <Box pl={4}>
            <Text>{getSocialWelfareCouncilData().所在地}</Text>
            <Link
              href={getSocialWelfareCouncilData().googleMapsURL}
              color="blue.500"
              fontWeight={'semibold'}
              target="_blank"
              rel="noopener noreferrer"
            >
              地図を開く
              <ExternalLinkIcon ml={1} />
            </Link>
            <br />
            <Text>
              TEL:
              <Link
                href={`tel:${getSocialWelfareCouncilData().電話番号}`}
                color="blue.500"
                fontWeight={'semibold'}
              >
                {getSocialWelfareCouncilData().電話番号}
              </Link>
            </Text>
          </Box>
        </Box>
      ) : (
        <Box>
          <Text fontWeight={'semibold'}>社会福祉協議会の調べ方</Text>
          <Text>
            下記のページからお住まいの社会福祉協議会を選択してください
          </Text>
          <Link
            href={aboutLink.link}
            color="blue.500"
            fontWeight={'semibold'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {aboutLink.title}
            <ExternalLinkIcon ml={1} />
          </Link>
        </Box>
      )}
    </Box>
  );
};

// 拠点病院の窓口
// TODO: 社協の窓口と共通のcomponentにする
export const BaseHospitalHelpDesk = () => {
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [prefecture, setPrefecture] = useState('');
  const [block, setBlock] = useState('');

  useEffect(() => {
    setPrefecture(household.世帯一覧.世帯1.居住都道府県[currentDate]);
    setBlock(
      blockOfPrefecture[household.世帯一覧.世帯1.居住都道府県[currentDate]]
    );
  }, [household]);

  const getBlockBaseHospitalData = () => {
    const hospitals = baseHospitalData.ブロック拠点病院[block];
    if (hospitals === undefined) {
      return [];
    }

    return Object.values(hospitals).map((hospital, _index) => {
      const { 施設名, 郵便番号, 所在地, 電話番号, WebサイトURL } = hospital;

      return {
        施設名,
        郵便番号,
        所在地,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    });
  };

  const getCentralBaseHospitalData = () => {
    const hospitals = baseHospitalData.中核拠点病院[prefecture];
    if (hospitals === undefined) {
      return [];
    }

    return Object.values(hospitals).map((hospital, _index) => {
      const { 施設名, 郵便番号, 所在地, 電話番号, WebサイトURL } = hospital;

      return {
        施設名,
        郵便番号,
        所在地,
        電話番号,
        WebサイトURL,
        googleMapsURL: encodeURI(
          `https://www.google.com/maps/search/${施設名}+${所在地}`
        ),
      };
    });
  };

  // ブロック拠点病院と中核拠点病院の重複を取り除く
  const hospitals = [
    ...getCentralBaseHospitalData(),
    ...getBlockBaseHospitalData(),
  ].filter((elem, index, arr) => {
    const sameNameIndex = arr.findIndex((e) => e.施設名 === elem.施設名);
    return sameNameIndex === index;
  });

  return (
    <>
      <Center pt={2}>
        {configData.result.helpDeskDescription.拠点病院.description1}
      </Center>
      <Box
        bg="white"
        borderRadius="xl"
        pt={1}
        pb={1}
        pr={2}
        pl={2}
        m={2}
        border="1px solid black"
      >
        {/* NOTE: ブロック拠点病院と中核拠点病院の重複を防ぐため unique() で重複削除 */}
        {hospitals.map((hospital, index) => (
          <Box key={index} pt={1} pb={2}>
            {hospital.WebサイトURL ? (
              <Link
                href={hospital.WebサイトURL}
                color="blue.500"
                fontWeight={'semibold'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hospital.施設名}
              </Link>
            ) : (
              <Text fontWeight={'semibold'}>{hospital.施設名}</Text>
            )}
            <Box pl={4}>
              <Text>{hospital.所在地}</Text>
              <Link
                href={hospital.googleMapsURL}
                color="blue.500"
                fontWeight={'semibold'}
                target="_blank"
                rel="noopener noreferrer"
              >
                地図を開く
                <ExternalLinkIcon ml={1} />
              </Link>
              <br />
              <Text>
                TEL:
                <Link
                  href={`tel:${hospital.電話番号}`}
                  color="blue.500"
                  fontWeight={'semibold'}
                >
                  {hospital.電話番号}
                </Link>
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

// 汎用的な窓口表示のテンプレート
const HelpDeskTemplate = ({ helpDeskData }: { helpDeskData: HelpDeskData }) => {
  const currentDate = useRecoilValue(currentDateAtom);
  const household = useRecoilValue(householdAtom);
  const [prefecture, setPrefecture] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    setPrefecture(household.世帯一覧.世帯1.居住都道府県[currentDate]);
    setCity(household.世帯一覧.世帯1.居住市区町村[currentDate]);
  }, [household]);

  const getHelpDesk = () => {
    if (
      helloWorkData[prefecture] &&
      helloWorkData[prefecture].hasOwnProperty(city)
    ) {
      return helpDeskData[prefecture][city];
    }

    return null;
  };
  const helpDesk = getHelpDesk();
  const googleMapsURL = helpDesk
    ? encodeURI(
        `https://www.google.com/maps/search/${helpDesk.施設名}+${helpDesk.所在地}`
      )
    : '';

  return (
    <>
      {helpDesk && (
        <Box
          bg="white"
          borderRadius="xl"
          pt={1}
          pb={1}
          pr={2}
          pl={2}
          m={2}
          border="1px solid black"
        >
          <Box pt={1} pb={2}>
            {helpDesk.WebサイトURL ? (
              <Link
                href={helpDesk.WebサイトURL}
                color="blue.500"
                fontWeight={'semibold'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {helpDesk.施設名}
              </Link>
            ) : (
              <Text fontWeight={'semibold'}>{helpDesk.施設名}</Text>
            )}
            <Box pl={4}>
              <Text>{helpDesk.所在地}</Text>
              <Link
                href={googleMapsURL}
                color="blue.500"
                fontWeight={'semibold'}
                target="_blank"
                rel="noopener noreferrer"
              >
                地図を開く
                <ExternalLinkIcon ml={1} />
              </Link>
              <br />
              <Text>
                TEL:
                <Link
                  href={`tel:${helpDesk.電話番号}`}
                  color="blue.500"
                  fontWeight={'semibold'}
                >
                  {helpDesk.電話番号}
                </Link>
              </Text>
            </Box>
            <Box pt={1}>
              {helpDesk.補足事項 && <Text>{helpDesk.補足事項}</Text>}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export const HelloworkHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={helloWorkData} />;
};

export const PublicAssistanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={publicAssistanceData} />;
};

export const NationalHealthInsuranceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={nationalHealthInsuranceData} />;
};

export const NationalPensionSystemHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={nationalPensionSystemData} />;
};

export const PrenatalCheckUpHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={prenatalCheckUpData} />;
};

export const FujimiChildBirthHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={fujimiChildBirthData} />;
};

export const MidwiferyHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={midwiferyData} />;
};

export const ChildbirthLumpSumAllowanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={childbirthLumpSumAllowanceData} />;
};

export const FujimiPostNatalCareHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={fujimiPostNatalCareData} />;
};

export const FujimiChildrenMedicalExpensesHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={fujimiChildrenMedicalExpensesData} />;
};

export const SingleParentMedicalExpensesHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={singleParentMedicalExpensesData} />;
};

export const PrematureBabyMedicalExpensesHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={prematureBabyMedicalExpensesData} />;
};

export const ChildrenDiseaseMedicalExpensesHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={childrenDiseaseMedicalExpensesData} />;
};

export const TaxOfficeHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={taxOfficeData} />;
};

export const ChildSupportHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={childSupportData} />;
};

export const DisabilityCertificateHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={disabilityCertificateData} />;
};

export const DisabilityAllowanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={disabilityAllowanceData} />;
};

export const DisabilityPensionHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={disabilityPensionData} />;
};

export const IndependenceSupportMedicalHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={independenceSupportMedicalData} />;
};

export const SevereDisabilityMedialExpensesHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={severeDisabilityMedialExpensesData} />;
};

export const IntractableDiseaseHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={intractableDiseaseData} />;
};

export const DisabledPersonEmploymentHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={disabledPersonEmploymentData} />;
};

export const LongTermCareHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={longTermCareData} />;
};

export const LongTermCarePremiumHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={longTermCarePremiumData} />;
};

export const LongTermCareAllowanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={longTermCareAllowanceData} />;
};

export const LongTermCareServiceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={longTermCareServiceData} />;
};

export const SaitamaSingleParentLoanHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={saitamaSingleParentLoanData} />;
};

export const SaitamaPrivateSchoolHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={saitamaPrivateSchoolData} />;
};

export const ChildAllowanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={childAllowanceData} />;
};

export const InjuryAndIllnessAllowanceHelpDesk = () => {
  return <HelpDeskTemplate helpDeskData={injuryAndIllnessAllowanceData} />;
};

// 窓口名と窓口の対応
export const HelpDesk = ({ name }: { name: string }) => {
  const helpDesks: { [name: string]: JSX.Element } = {
    baseHospital: <BaseHospitalHelpDesk />,
    socialWelfareCouncil: <SocialWelfareCouncilHelpDesk />,
    hellowork: <HelloworkHelpDesk />,
    publicAssistance: <PublicAssistanceHelpDesk />,
    nationalHealthInsurance: <NationalHealthInsuranceHelpDesk />,
    nationalPensionSystem: <NationalPensionSystemHelpDesk />,
    prenatalCheckUp: <PrenatalCheckUpHelpDesk />,
    fujimiChildBirth: <FujimiChildBirthHelpDesk />,
    midwifery: <MidwiferyHelpDesk />,
    childbirthLumpSumAllowance: <ChildbirthLumpSumAllowanceHelpDesk />,
    fujimiPostNatalCare: <FujimiPostNatalCareHelpDesk />,
    fujimiChildrenMedicalExpenses: <FujimiChildrenMedicalExpensesHelpDesk />,
    singleParentMedicalExpenses: <SingleParentMedicalExpensesHelpDesk />,
    prematureBabyMedicalExpenses: <PrematureBabyMedicalExpensesHelpDesk />,
    childrenDiseaseMedicalExpenses: <ChildrenDiseaseMedicalExpensesHelpDesk />,
    taxOffice: <TaxOfficeHelpDesk />,
    childSupport: <ChildSupportHelpDesk />,
    disabilityCertificate: <DisabilityCertificateHelpDesk />,
    disabilityAllowance: <DisabilityAllowanceHelpDesk />,
    disabilityPension: <DisabilityPensionHelpDesk />,
    independenceSupportMedical: <IndependenceSupportMedicalHelpDesk />,
    intractableDisease: <IntractableDiseaseHelpDesk />,
    severeDisabilityMedialExpenses: <SevereDisabilityMedialExpensesHelpDesk />,
    disabledPersonEmployment: <DisabledPersonEmploymentHelpDesk />,
    longTermCare: <LongTermCareHelpDesk />,
    longTermCarePremium: <LongTermCarePremiumHelpDesk />,
    longTermCareAllowance: <LongTermCareAllowanceHelpDesk />,
    longTermCareService: <LongTermCareServiceHelpDesk />,
    saitamaSingleParentLoan: <SaitamaSingleParentLoanHelpDesk />,
    saitamaPrivateSchool: <SaitamaPrivateSchoolHelpDesk />,
    childAllowance: <ChildAllowanceHelpDesk />,
    injuryAndIllnessAllowance: <InjuryAndIllnessAllowanceHelpDesk />,
  };

  return helpDesks[name];
};
