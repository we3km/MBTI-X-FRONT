export type MbtiInfo = {
    type: string;
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
};

export const mbtiData: Record<string, MbtiInfo> = {
     ISTJ: {
        type: "ISTJ",
        name: "청렴결백한 논리주의자",
        description: "책임감 있고 신뢰할 수 있으며 체계적인 사람들입니다.",
        strengths: ["책임감 강함", "체계적이고 논리적", "신뢰성 높음", "꾸준함과 인내심"],
        weaknesses: ["융통성 부족", "변화에 둔감", "지나치게 규칙 집착", "감정 표현 서툼"],
    },
    ISFJ: {
        type: "ISFJ",
        name: "용감한 수호자",
        description: "헌신적이며 따뜻하고 성실한 사람들입니다.",
        strengths: ["성실하고 헌신적", "세심한 배려", "신뢰성 높음", "협력적이고 안정 지향"],
        weaknesses: ["자기 주장 부족", "변화에 소극적", "타인에게 지나치게 헌신", "스트레스 누적"],
    },
    INFJ: {
        type: "INFJ",
        name: "선의의 옹호자",
        description: "이상주의적이고 통찰력 있으며 공감능력이 뛰어납니다.",
        strengths: ["통찰력 뛰어남", "깊은 공감과 배려", "의미와 가치를 추구", "헌신적이고 책임감 있음"],
        weaknesses: ["완벽주의", "자기희생적 성향", "현실보다 이상에 치우침", "스트레스에 취약"],
    },
    INTJ: {
        type: "INTJ",
        name: "전략적인 사색가",
        description: "계획적이고 독립적이며 목표지향적인 사람들입니다.",
        strengths: ["목표 지향적", "전략적이고 체계적 사고", "자기 주도적", "효율성 중시"],
        weaknesses: ["감정 표현 부족", "타인과의 정서적 교류 어려움", "융통성 부족", "고집이 강함"],
    },
    ISTP: {
        type: "ISTP",
        name: "만능 재주꾼",
        description: "실용적이고 분석적이며 모험을 즐깁니다.",
        strengths: ["문제 해결 능력 뛰어남", "손재주와 기술적 능력", "현실적이고 실용적", "위기 상황에서 침착"],
        weaknesses: ["감정 표현 부족", "충동적일 수 있음", "장기 계획에 약함", "관계 유지에 소홀"],
    },
    ISFP: {
        type: "ISFP",
        name: "호기심 많은 예술가",
        description: "온화하고 감성적이며 자유로운 사람들입니다.",
        strengths: ["온화하고 친절", "창의적이고 감각적", "유연하고 적응력 강함", "다른 사람의 감정 존중"],
        weaknesses: ["우유부단", "갈등을 피함", "장기적 계획 부족", "비판에 민감"],
    },
    INFP: {
        type: "INFP",
        name: "열정적인 중재자",
        description: "이상주의적이며 창의적이고 깊은 신념을 가진 사람들입니다.",
        strengths: ["깊은 공감 능력", "창의적이고 상상력 풍부", "가치 중심적", "친절하고 배려심 깊음"],
        weaknesses: ["지나치게 이상주의적", "현실 회피", "실행력 부족", "감정 기복 심함"],
    },
    INTP: {
        type: "INTP",
        name: "논리적인 사색가",
        description: "분석적이고 독립적이며 지적 호기심이 강합니다.",
        strengths: ["분석력 뛰어남", "독창적이고 창의적인 문제 해결", "새로운 아이디어 탐구", "객관적 사고"],
        weaknesses: ["실행력이 부족", "감정 표현 서툼", "지나치게 이론적", "타인과 소통에 어려움"],
    },
    ESTP: {
        type: "ESTP",
        name: "모험을 즐기는 사업가",
        description: "에너지 넘치고 현실적이며 행동 중심적입니다.",
        strengths: ["현실적이고 실행력 빠름", "위기 대처 능력 탁월", "도전 정신 강함", "사교성 뛰어남"],
        weaknesses: ["충동적", "위험 감수 과다", "계획성 부족", "타인 감정 배려 부족"],
    },
    ESFP: {
        type: "ESFP",
        name: "자유로운 영혼의 연예인",
        description: "외향적이고 낙천적이며 사람들과 어울리기를 좋아합니다.",
        strengths: ["사교성", "낙천성", "적응력", "분위기 메이커"],
        weaknesses: ["계획성 부족", "충동적", "집중력 부족", "책임 회피 가능성"],
    },
    ENFP: {
        type: "ENFP",
        name: "재기발랄한 활동가",
        description: "열정적이고 창의적이며 활발한 사람들입니다.",
        strengths: ["창의력", "사교성", "적응력", "에너지 넘침"],
        weaknesses: ["집중력 부족", "과잉 열정", "꾸준함 부족", "현실 감각 부족"],
    },
    ENTP: {
        type: "ENTP",
        name: "뜨거운 논쟁을 즐기는 변론가",
        description: "재치 있고 창의적이며 도전적인 사람들입니다.",
        strengths: ["창의력", "재치", "도전 정신", "문제 해결 능력"],
        weaknesses: ["지속력 부족", "논쟁적", "규칙·제약 싫어함", "실행력 부족"],
    },
    ESTJ: {
        type: "ESTJ",
        name: "엄격한 관리자",
        description: "체계적이고 결단력 있으며 실용적입니다.",
        strengths: ["조직력", "결단력", "책임감", "실용적"],
        weaknesses: ["융통성 부족", "고집", "감정 배려 부족", "통제적 성향"],
    },
    ESFJ: {
        type: "ESFJ",
        name: "사교적인 외교관",
        description: "따뜻하고 배려심 많으며 사교적입니다.",
        strengths: ["사교성", "협동심", "책임감", "성실함"],
        weaknesses: ["비판에 민감", "과도한 자기희생", "자기 주장 부족", "타인 의식 과다"],
    },
    ENFJ: {
        type: "ENFJ",
        name: "정의로운 사회운동가",
        description: "카리스마 있고 사교적이며 타인을 돕기를 좋아합니다.",
        strengths: ["공감능력", "리더십", "사교성", "동기부여 능력"],
        weaknesses: ["과도한 이상주의", "감정 기복", "타인 눈치", "자기 희생적 성향"],
    },
    ENTJ: {
        type: "ENTJ",
        name: "대담한 통솔자",
        description: "결단력 있고 전략적이며 목표지향적입니다.",
        strengths: ["리더십", "계획력", "결단력", "목표 지향성"],
        weaknesses: ["완고함", "감정표현 부족", "권위적 태도", "융통성 부족"],
    },
};
