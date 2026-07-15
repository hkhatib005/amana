import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type PrayerRingProps = {
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  knobColor?: string;
  children?: ReactNode;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

const GAP_DEGREES = 42;

export function PrayerRing({
  size = 260,
  strokeWidth = 14,
  trackColor = '#16264A',
  knobColor = '#F2A93B',
  children,
}: PrayerRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * r;

  const gapStart = -90 - GAP_DEGREES / 2;
  const gapEnd = -90 + GAP_DEGREES / 2;
  const visibleDegrees = 360 - GAP_DEGREES;

  const knob = polarToCartesian(cx, cy, r, gapEnd);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(visibleDegrees / 360) * circumference}, ${circumference}`}
          rotation={gapEnd}
          origin={`${cx}, ${cy}`}
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={knobColor}
          strokeWidth={strokeWidth * 0.6}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${(GAP_DEGREES / 360) * circumference}, ${circumference}`}
          rotation={gapStart}
          origin={`${cx}, ${cy}`}
        />
        <Circle cx={knob.x} cy={knob.y} r={strokeWidth * 0.7} fill={knobColor} />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.center}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
