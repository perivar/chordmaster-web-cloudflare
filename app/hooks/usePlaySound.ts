import { useCallback, useEffect, useState } from "react";
import { Reverb, Soundfont } from "smplr";

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
  setVolume: (volume: number) => void;
  setReverbMix: (mix: number) => void;
  isLoading: boolean;
};

const usePlaySound = (
  initialVolume: number = 100,
  initialReverbMix: number = 0.0
): UsePlaySoundReturn => {
  const [instrument, setInstrument] = useState<Soundfont | undefined>(
    undefined
  );
  const [instrumentName, setInstrumentName] = useState<SoundType>("piano");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (instrument) instrument.disconnect();

    const context = new AudioContext();

    const newInstrument = new Soundfont(context, {
      instrument:
        instrumentName === "piano"
          ? "acoustic_grand_piano"
          : "acoustic_guitar_nylon", // acoustic_grand_piano, acoustic_guitar_nylon
      kit: "FluidR3_GM", // MusyngKite (default), FluidR3_GM, FatBoy
      volume: initialVolume, // volume: A number from 0 to 127 representing the instrument global volume. 100 by default
    });

    const reverb = new Reverb(context);
    newInstrument.output.addEffect("reverb", reverb, initialReverbMix); // mix: A number from 0.0 to 1.0 representing the reverb mix

    setIsLoading(true);
    newInstrument.load.then(() => {
      setInstrument(newInstrument);
      setIsLoading(false);
    });

    return () => {
      if (instrument) instrument.disconnect();
    };
  }, [instrumentName]);

  const playMidiNote = useCallback(
    (
      midiNote: number,
      onStart?: (sample: SampleStart) => void,
      onEnded?: (sample: SampleStart) => void
    ) => {
      if (instrument) {
        if (instrument.context.state === "suspended") {
          instrument.context.resume();
        }
        instrument.stop();

        const now = instrument.context.currentTime;
        instrument.start({
          note: midiNote,
          velocity: 100,
          time: now,
          duration: 0.6,
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
        if (instrument.context.state === "suspended") {
          instrument.context.resume();
        }
        instrument.stop();

        const now = instrument.context.currentTime;
        instrument.start({
          note,
          velocity: 100,
          time: now,
          duration: 0.6,
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
        if (instrument.context.state === "suspended") {
          instrument.context.resume();
        }
        instrument.stop();

        const now = instrument.context.currentTime;
        midiNotes.forEach(note => {
          instrument.start({
            note,
            time: now,
            duration: 0.6,
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
        if (instrument.context.state === "suspended") {
          instrument.context.resume();
        }
        instrument.stop();

        const now = instrument.context.currentTime;
        midiNotes.forEach(note => {
          instrument.start({
            note,
            time: now,
            duration: 0.6,
            onStart: onStart,
            onEnded: onEnded,
          });
        });

        // allow enough time for the previous notes to dye out
        // i.e. add 1.25 ms
        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + 2.0 + i * 0.8,
            duration: 0.6,
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
        if (instrument.context.state === "suspended") {
          instrument.context.resume();
        }
        instrument.stop();

        const now = instrument.context.currentTime;
        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + i * 0.05,
            duration: 0.6,
            onStart: onStart,
            onEnded: onEnded,
          });
        });

        // allow enough time for the previous notes to dye out
        // i.e. add 1.25 ms
        midiNotes.forEach((note, i) => {
          instrument.start({
            note,
            time: now + 2.0 + i * 0.8,
            duration: 0.6,
            onStart: onStart,
            onEnded: onEnded,
          });
        });
      }
    },
    [instrument]
  );

  const setVolume = (volume: number) => {
    instrument?.output.setVolume(volume);
  };

  const setReverbMix = (mix: number) => {
    instrument?.output.sendEffect("reverb", mix);
  };

  return {
    playMidiNote,
    playNote,
    playChord,
    playChordAndArp,
    playArpFastAndArp,
    setInstrumentName,
    setVolume,
    setReverbMix,
    isLoading,
  };
};

export default usePlaySound;
