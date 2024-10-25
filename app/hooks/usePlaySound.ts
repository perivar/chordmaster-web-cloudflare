import { useCallback, useEffect, useState } from "react";
import { Soundfont } from "smplr";

import { getAudioContext } from "./audio-context";

type SoundType = "piano" | "guitar";

type UsePlaySoundReturn = {
  playMidiNote: (midiNote: number) => void;
  playNote: (note: string) => void;
  playChord: (midiNotes: number[]) => void;
  playChordAndArp: (midiNotes: number[]) => void;
  playArpFastAndArp: (midiNotes: number[]) => void;
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
    (midiNote: number) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        instrument.start({
          note: midiNote,
          velocity: 80,
          time: now,
          duration: 0.5,
        });
      }
    },
    [instrument]
  );

  const playNote = useCallback(
    (note: string) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        instrument.start({ note, velocity: 80, time: now, duration: 0.5 });
      }
    },
    [instrument]
  );

  const playChord = useCallback(
    (midiNotes: number[]) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach(note => {
          instrument.start({ note, time: now, duration: 0.5 });
        });
      }
    },
    [instrument]
  );

  const playChordAndArp = useCallback(
    (midiNotes: number[]) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach(note => {
          instrument.start({ note, time: now, duration: 0.5 });
        });

        midiNotes.forEach((note, i) => {
          instrument.start({ note, time: now + 1 + i * 0.8, duration: 0.5 });
        });
      }
    },
    [instrument]
  );

  const playArpFastAndArp = useCallback(
    (midiNotes: number[]) => {
      if (instrument) {
        instrument.stop();

        const now = getAudioContext().currentTime;
        midiNotes.forEach((note, i) => {
          instrument.start({ note, time: now + i * 0.05, duration: 0.5 });
        });

        midiNotes.forEach((note, i) => {
          instrument.start({ note, time: now + 1 + i * 0.8, duration: 0.5 });
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
