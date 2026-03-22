import { requireNativeModule, EventEmitter, Subscription } from "expo-modules-core";

const PitchDetectorNative = requireNativeModule("PitchDetector");
const emitter = new EventEmitter(PitchDetectorNative);

export interface PitchEvent {
    frequency: number;
    note: string;
    octave: number;
    cents: number;
}

export function startListening(): Promise<void> {
    return PitchDetectorNative.startListening();
}

export function stopListening(): Promise<void> {
    return PitchDetectorNative.stopListening();
}

export function addPitchListener(
    listener: (event: PitchEvent) => void
): Subscription {
    return emitter.addListener("onPitchDetected", listener);
}
