

// MBTI 색상 팔레트
export const MBTI_COLORS: Record<string, string> = {
  ENFP: "#FF6B6B",
  ENTP: "#FF922B",
  ENFJ: "#F59F00",
  ENTJ: "#FFD43B",
  INFP: "#51CF66",
  INTP: "#2F9E44",
  INFJ: "#228BE6",
  INTJ: "#4263EB",
  ESFP: "#D6336C",
  ESTP: "#E8590C",
  ESFJ: "#FAB005",
  ESTJ: "#82C91E",
  ISFP: "#15AABF",
  ISTP: "#1098AD",
  ISFJ: "#6741D9",
  ISTJ: "#1864AB",
};

export type PieDatum = { label: string; value: number };

export function Donut({
  data,
  size = 120,
  stroke = 24,
}: {
  data: PieDatum[];
  size?: number;
  stroke?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${size / 2}, ${size / 2}) rotate(-90)`}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * C;
          const color = MBTI_COLORS[d.label] || "#ADB5BD"; // fallback 회색
          const circle = (
            <circle
              key={i}
              r={r}
              cx={0}
              cy={0}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += dash;
          return circle;
        })}
        <circle r={r - stroke / 2} fill="white" />
      </g>
    </svg>
  );
}
