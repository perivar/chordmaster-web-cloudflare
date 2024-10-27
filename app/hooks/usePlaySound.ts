import { useCallback, useEffect, useState } from "react";
import { Soundfont } from "smplr";

import { getAudioContext } from "./audio-context";

type SoundType = "piano" | "guitar";

/**
 * Configurable options for a sample
 * Note! Had to copy this from the smplr types since it's not exported
 */
type SampleOptions = {
  decayTime?: number;
  detune?: number;
  duration?: number | null;
  velocity?: number;
  lpfCutoffHz?: number;
  loop?: boolean;
  loopStart?: number;
  loopEnd?: number;
  gainOffset?: number;
};

/**
 * Start a sample with a specific options
 * Note! Had to copy this from the smplr types since it's not exported
 */
export type SampleStart = {
  name?: string;
  note: string | number;
  stopId?: string | number;
  time?: number;
} & SampleOptions;

type UsePlaySoundReturn = {
  playMidiNote: (
    midiNote: number,
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  playNote: (
    note: string,
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  playChord: (
    midiNotes: number[],
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  playChordAndArp: (
    midiNotes: number[],
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  playArpFastAndArp: (
    midiNotes: number[],
    onStart?: (sample: SampleStart) => void,
    onEnded?: (sample: SampleStart) => void
  ) => void;
  setInstrumentName: (name: SoundType) => void;
};

const usePlaySound = (): UsePlaySoundReturn => {
  const [instrument, setInstrument] = useState<Soundfont | undefined>(
    undefined
  );
  const [instrumentName, setInstrumentName] = useState<SoundType>("piano");

  useEffect(() => {
    if (instrument) instrument.disconnect();

    const context = getAudioContext();

    const newInstrument = new Soundfont(context, {
      instrument:
        instrumentName === "piano"
          ? "acoustic_grand_piano"
          : "acoustic_guitar_nylon", // acoustic_grand_piano, acoustic_guitar_nylon
      kit: "FluidR3_GM", // MusyngKite (default), FluidR3_GM, FatBoy
    });

    newInstrument.load.then(() => {
      setInstrument(newInstrument);
    });
  }, [instrumentName]);

  const playMidiNote = useCallback(
    (
      midiNote: number,
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        instrument.start({
          note: midiNote,
          velocity: 100,
          time: now,
          duration: 1.0,
          onStart: onStart,
          onEnded: onEnded,
        });
      }
    },
    [instrument]
  );

  const playNote = useCallback(
    (
      note: string,
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        instrument.start({
          note,
          velocity: 100,
          time: now,
          duration: 1.0,
          onStart: onStart,
          onEnded: onEnded,
        });
      }
    },
    [instrument]
  );

  const playChord = useCallback(
    (
      midiNotes: number[],
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach(note => {
          instrument.start({
            note,
            time: now,
            duration: 1.0,
            onStart: onStart,
            onEnded: onEnded,
          });
        });
      }
    },
    [instrument]
  );

  const playChordAndArp = useCallback(
    (
      midiNotes: number[],
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach(note => {
          instrument.start({
            note,
            time: now,
            duration: 1.0,
            onStart: onStart,
            onEnded: onEnded,
          });
        });

        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + 1 + i * 0.8,
            duration: 1.0,
            onStart: onStart,
            onEnded: onEnded,
          });
        });
      }
    },
    [instrument]
  );

  const playArpFastAndArp = useCallback(
    (
      midiNotes: number[],
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + i * 0.05,
            duration: 1.0,
            onStart: onStart,
            onEnded: onEnded,
          });
        });

        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + 1 + i * 0.8,
            duration: 1.0,
            onStart: onStart,
            onEnded: onEnded,
          });
        });
      }
    },
    [instrument]
  );

  return {
    playMidiNote,
    playNote,
    playChord,
    playChordAndArp,
    playArpFastAndArp,
    setInstrumentName,
  };
};

export default usePlaySound;
