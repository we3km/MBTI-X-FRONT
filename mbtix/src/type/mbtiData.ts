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
        strengths: ["성실함", "신뢰성", "현실적 판단력"],
        weaknesses: ["융통성 부족", "변화에 대한 저항"],
    },
    ISFJ: {
        type: "ISFJ",
        name: "용감한 수호자",
        description: "헌신적이며 따뜻하고 성실한 사람들입니다.",
        strengths: ["배려심", "헌신", "책임감"],
        weaknesses: ["자기표현 부족", "스트레스에 취약"],
    },
    INFJ: {
        type: "INFJ",
        name: "선의의 옹호자",
        description: "이상주의적이고 통찰력 있으며 공감능력이 뛰어납니다.",
        strengths: ["통찰력", "공감능력", "결단력"],
        weaknesses: ["고집", "과도한 이상주의"],
    },
    INTJ: {
        type: "INTJ",
        name: "전략적인 사색가",
        description: "계획적이고 독립적이며 목표지향적인 사람들입니다.",
        strengths: ["분석력", "계획성", "결단력"],
        weaknesses: ["감정표현 부족", "완고함"],
    },
    ISTP: {
        type: "ISTP",
        name: "만능 재주꾼",
        description: "실용적이고 분석적이며 모험을 즐깁니다.",
        strengths: ["문제해결력", "적응력", "관찰력"],
        weaknesses: ["충동적", "감정표현 부족"],
    },
    ISFP: {
        type: "ISFP",
        name: "호기심 많은 예술가",
        description: "온화하고 감성적이며 자유로운 사람들입니다.",
        strengths: ["미적 감각", "공감능력", "유연성"],
        weaknesses: ["우유부단", "비판 회피"],
    },
    INFP: {
        type: "INFP",
        name: "열정적인 중재자",
        description: "이상주의적이며 창의적이고 깊은 신념을 가진 사람들입니다.",
        strengths: ["창의력", "공감능력", "헌신"],
        weaknesses: ["현실도피 경향", "우유부단"],
    },
    INTP: {
        type: "INTP",
        name: "논리적인 사색가",
        description: "분석적이고 독립적이며 지적 호기심이 강합니다.",
        strengths: ["논리적 사고", "창의력", "객관성"],
        weaknesses: ["실행력 부족", "고립 경향"],
    },
    ESTP: {
        type: "ESTP",
        name: "모험을 즐기는 사업가",
        description: "에너지 넘치고 현실적이며 행동 중심적입니다.",
        strengths: ["적응력", "사교성", "문제 해결력"],
        weaknesses: ["충동적", "인내심 부족"],
    },
    ESFP: {
        type: "ESFP",
        name: "자유로운 영혼의 연예인",
        description: "외향적이고 낙천적이며 사람들과 어울리기를 좋아합니다.",
        strengths: ["사교성", "낙천성", "적응력"],
        weaknesses: ["계획성 부족", "충동적"],
    },
    ENFP: {
        type: "ENFP",
        name: "재기발랄한 활동가",
        description: "열정적이고 창의적이며 활발한 사람들입니다.",
        strengths: ["창의력", "사교성", "적응력"],
        weaknesses: ["집중력 부족", "과잉 열정"],
    },
    ENTP: {
        type: "ENTP",
        name: "뜨거운 논쟁을 즐기는 변론가",
        description: "재치 있고 창의적이며 도전적인 사람들입니다.",
        strengths: ["창의력", "재치", "적응력"],
        weaknesses: ["지속력 부족", "논쟁적"],
    },
    ESTJ: {
        type: "ESTJ",
        name: "엄격한 관리자",
        description: "체계적이고 결단력 있으며 실용적입니다.",
        strengths: ["조직력", "결단력", "책임감"],
        weaknesses: ["융통성 부족", "고집"],
    },
    ESFJ: {
        type: "ESFJ",
        name: "사교적인 외교관",
        description: "따뜻하고 배려심 많으며 사교적입니다.",
        strengths: ["사교성", "협동심", "책임감"],
        weaknesses: ["비판에 민감", "과도한 자기희생"],
    },
    ENFJ: {
        type: "ENFJ",
        name: "정의로운 사회운동가",
        description: "카리스마 있고 사교적이며 타인을 돕기를 좋아합니다.",
        strengths: ["공감능력", "리더십", "사교성"],
        weaknesses: ["과도한 이상주의", "감정 기복"],
    },
    ENTJ: {
        type: "ENTJ",
        name: "대담한 통솔자",
        description: "결단력 있고 전략적이며 목표지향적입니다.",
        strengths: ["리더십", "계획력", "결단력"],
        weaknesses: ["완고함", "감정표현 부족"],
    },
};
