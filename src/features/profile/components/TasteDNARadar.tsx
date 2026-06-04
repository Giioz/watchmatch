import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface RadarAxis {
  label: string;
  value: number;
}

interface TasteDNARadarProps {
  data: RadarAxis[]; // expects 6 axes
  size?: number;
  accent?: string;
}

/**
 * A 6-axis radar / "spider" chart drawn entirely with plain Views + transforms
 * (no react-native-svg dependency). Renders guide hexagon, value spokes, the
 * value outline, tip dots, and axis labels.
 */
export default function TasteDNARadar({ data, size = 230, accent = '#a78bfa' }: TasteDNARadarProps) {
  const C = size / 2;
  const R = size / 2 - 30;
  const angles = [-90, -30, 30, 90, 150, 210].map((d) => (d * Math.PI) / 180);

  const max = Math.max(1, ...data.map((d) => d.value));
  const norm = data.map((d) => 0.16 + 0.84 * (d.value / max));

  const point = (i: number, radius: number) => ({
    x: C + Math.cos(angles[i]) * radius,
    y: C + Math.sin(angles[i]) * radius,
  });

  const tips = norm.map((n, i) => point(i, R * n));
  const guide = angles.map((_, i) => point(i, R));

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      {/* Guide hexagon (outer) + half ring */}
      {guide.map((p, i) => {
        const next = guide[(i + 1) % guide.length];
        return <Edge key={`g${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} color="#27272a" thickness={1} />;
      })}
      {angles.map((_, i) => {
        const p = point(i, R * 0.5);
        const next = point((i + 1) % angles.length, R * 0.5);
        return <Edge key={`h${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} color="#1d1d24" thickness={1} />;
      })}

      {/* Value spokes from center */}
      {tips.map((t, i) => (
        <Edge key={`s${i}`} x1={C} y1={C} x2={t.x} y2={t.y} color="rgba(167,139,250,0.35)" thickness={2} />
      ))}

      {/* Value outline */}
      {tips.map((t, i) => {
        const next = tips[(i + 1) % tips.length];
        return <Edge key={`v${i}`} x1={t.x} y1={t.y} x2={next.x} y2={next.y} color={accent} thickness={2.5} />;
      })}

      {/* Tip dots */}
      {tips.map((t, i) => (
        <View
          key={`d${i}`}
          style={[styles.dot, { left: t.x - 4, top: t.y - 4, backgroundColor: accent }]}
        />
      ))}

      {/* Axis labels */}
      {data.map((axis, i) => {
        const p = point(i, R + 18);
        return (
          <Text
            key={`l${i}`}
            numberOfLines={1}
            style={[styles.axisLabel, { left: p.x - 34, top: p.y - 7 }]}
          >
            {axis.label}
          </Text>
        );
      })}
    </View>
  );
}

function Edge({
  x1,
  y1,
  x2,
  y2,
  color,
  thickness,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  thickness: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        width: thickness,
        height: len,
        left: midX - thickness / 2,
        top: midY - len / 2,
        backgroundColor: color,
        borderRadius: thickness / 2,
        transform: [{ rotate: `${angle + 90}deg` }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  axisLabel: {
    position: 'absolute',
    width: 68,
    textAlign: 'center',
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
