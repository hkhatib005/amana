import { View, type ViewProps } from 'react-native';

type SealBadgeProps = ViewProps & {
  size?: number;
  color?: string;
  points?: number;
};

/**
 * An 8-pointed scalloped "seal" outline, built by layering rotated
 * rounded-square outlines of the same color — their union reads as one
 * flower-like badge shape without needing SVG.
 */
export function SealBadge({
  size = 190,
  color = 'rgba(255,255,255,0.6)',
  points = 8,
  style,
  children,
  ...rest
}: SealBadgeProps) {
  return (
    <View style={[{ width: size, height: size }, style]} {...rest}>
      {Array.from({ length: points }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: size * 0.26,
            borderWidth: 2,
            borderColor: color,
            transform: [{ rotate: `${(360 / points) * i}deg` }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {children}
      </View>
    </View>
  );
}
