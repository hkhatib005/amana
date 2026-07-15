import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { UtilityColors } from '@/constants/utility-theme';

type QiblaCompassProps = {
  size?: number;
  /** Qibla bearing, clockwise degrees from true north. */
  qiblaBearing: number;
  /** Device compass heading, clockwise degrees from true north; null when unavailable. */
  heading: number | null;
};

const RING_WIDTH = 18;
const TICK_STEP = 10;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

export function QiblaCompass({ size = 300, qiblaBearing, heading }: QiblaCompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const faceRadius = size / 2 - RING_WIDTH;
  const needleRotation = qiblaBearing - (heading ?? 0);

  const ticks = [];
  for (let deg = 0; deg < 360; deg += TICK_STEP) {
    const isMajor = deg % 90 === 0;
    const outer = polarToCartesian(cx, cy, faceRadius - 4, deg);
    const inner = polarToCartesian(cx, cy, faceRadius - (isMajor ? 18 : 12), deg);
    const label = polarToCartesian(cx, cy, faceRadius - 28, deg);
    ticks.push(
      <Line
        key={`tick-${deg}`}
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        stroke={isMajor ? UtilityColors.navy : UtilityColors.textMuted}
        strokeWidth={isMajor ? 2 : 1.2}
      />,
      <SvgText
        key={`label-${deg}`}
        x={label.x}
        y={label.y + 4}
        fontSize={11}
        fontWeight={isMajor ? '700' : '500'}
        fill={isMajor ? UtilityColors.navy : UtilityColors.textMuted}
        textAnchor="middle">
        {deg}
      </SvgText>,
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.kaabaBadge, { left: cx - 22 }]}>
        <Text style={styles.kaabaEmoji}>🕋</Text>
      </View>

      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={size / 2 - RING_WIDTH / 2} stroke={UtilityColors.navy} strokeWidth={RING_WIDTH} fill={UtilityColors.card} />
        {ticks}
        <Circle cx={cx} cy={cy} r={5} fill={UtilityColors.navy} />
      </Svg>

      <View style={StyleSheet.absoluteFill}>
        <View style={styles.center}>
          <View style={[styles.needle, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
            <Text style={styles.needleTip}>🕋</Text>
            <View style={styles.needleLine} />
            <View style={styles.needleTail} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kaabaBadge: {
    position: 'absolute',
    top: -6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UtilityColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: UtilityColors.navy,
  },
  kaabaEmoji: {
    fontSize: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleTip: {
    fontSize: 26,
  },
  needleLine: {
    width: 3,
    height: 96,
    backgroundColor: UtilityColors.orange,
    borderRadius: 2,
  },
  needleTail: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: UtilityColors.navy,
    marginTop: -6,
  },
});
