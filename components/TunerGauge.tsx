import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
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
  const activeColor = invertColors ? "black" : "white";

  const animTick = useRef(new Animated.Value((N_TICKS - 1) / 2)).current;
  const [displayTick, setDisplayTick] = useState((N_TICKS - 1) / 2);

  useEffect(() => {
    const target = cents === null
      ? (N_TICKS - 1) / 2
      : (cents + 50) / 100 * (N_TICKS - 1);

    Animated.spring(animTick, {
      toValue: target,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();

    const id = animTick.addListener(({ value }) => setDisplayTick(value));
    return () => animTick.removeListener(id);
  }, [cents]);

  const activeTick = cents === null ? null : displayTick;

  const ticks = Array.from({ length: N_TICKS }, (_, i) => {
    const center = (N_TICKS - 1) / 2;
    const isCenter = i === center;
    const height = isCenter ? MAX_TICK_HEIGHT : MIN_TICK_HEIGHT;
    const x = (i / (N_TICKS - 1)) * GAUGE_WIDTH;
    let opacity = 0.15;
    if (activeTick !== null) {
      if (i < activeTick) opacity = 1;
      else if (i < activeTick + 1) opacity = activeTick - Math.floor(activeTick);
    }
    return { height, x, opacity };
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
              backgroundColor: activeColor,
              opacity: tick.opacity,
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
