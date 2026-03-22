import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useInvertColors } from "@/contexts/InvertColorsContext";
import { n } from "@/utils/scaling";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAUGE_PADDING = n(40);
const GAUGE_WIDTH = SCREEN_WIDTH - GAUGE_PADDING * 2;

const N_TICKS = 25;
const TICK_WIDTH = n(2);
const MAX_TICK_HEIGHT = n(40);
const MIN_TICK_HEIGHT = n(16);

interface TunerGaugeProps {
  cents: number | null;
}

export function TunerGauge({ cents }: TunerGaugeProps) {
  const { invertColors } = useInvertColors();
  const dimColor = invertColors ? "#ccc" : "#3a3a3a";
  const activeColor = invertColors ? "black" : "white";
  const inTune = cents !== null && Math.abs(cents) <= 5;

  const activeTick = cents === null
    ? null
    : Math.round((cents + 50) / 100 * (N_TICKS - 1));

  const ticks = Array.from({ length: N_TICKS }, (_, i) => {
    const center = (N_TICKS - 1) / 2;
    const isCenter = i === center;
    const height = isCenter ? MAX_TICK_HEIGHT : MIN_TICK_HEIGHT;
    const x = (i / (N_TICKS - 1)) * GAUGE_WIDTH;
    const filled = activeTick !== null && i <= activeTick;
    const color = filled ? (inTune ? "#4CAF50" : activeColor) : dimColor;
    return { height, x, color };
  });

  return (
    <View style={[styles.container, { width: GAUGE_WIDTH }]}>
      {ticks.map((tick, i) => (
        <View
          key={i}
          style={[
            styles.tick,
            {
              left: tick.x - TICK_WIDTH / 2,
              height: tick.height,
              top: (MAX_TICK_HEIGHT - tick.height) / 2,
              backgroundColor: tick.color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MAX_TICK_HEIGHT,
    position: "relative",
  },
  tick: {
    position: "absolute",
    width: TICK_WIDTH,
  },
});
