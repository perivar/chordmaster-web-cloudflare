import { useCallback, useEffect, useState } from "react";
import { Midi } from "tonal";
import * as Tone from "tone";

type SoundType = "piano" | "guitar";

type UsePlaySoundReturn = {
  playMidiNote: (midiNote: number) => void;
  playNote: (note: string) => void;
  playChord: () => void;
  playChordAndArp: () => void;
  playChordAndArpFast: () => void;
};

const usePlaySound = (
  soundType: SoundType,
  chordFreqs: number[]
): UsePlaySoundReturn => {
  const [sampler, setSampler] = useState<Tone.Sampler>();

  useEffect(() => {
    const newSampler = new Tone.Sampler({
      urls:
        soundType === "piano"
          ? {
              // Piano samples
              C4: "C4.mp3",
              "D#4": "Ds4.mp3",
              "F#4": "Fs4.mp3",
              A4: "A4.mp3",
            }
          : {
              // Guitar samples
              // E2: "guitar_LowEstring1.mp3",
              A2: "guitar_Astring.mp3",
              D3: "guitar_Dstring.mp3",
              G3: "guitar_Gstring.mp3",
              B3: "guitar_Bstring.mp3",
              // E4: "guitar_highEstring.mp3",
            },
      baseUrl:
        soundType === "piano"
          ? "https://tonejs.github.io/audio/salamander/"
          : "https://tonejs.github.io/audio/berklee/",
    }).toDestination();

    Tone.loaded().then(() => {
      setSampler(newSampler);
    });

    return () => {
      newSampler.dispose();
    };
  }, [soundType]);

  const playMidiNote = useCallback(
    (midiNote: number) => {
      if (sampler) {
        const now = Tone.now();
        const noteFreq = Midi.midiToFreq(midiNote);
        sampler.triggerAttackRelease(noteFreq, "6n", now, 0.5);
      }
    },
    [sampler]
  );

  const playNote = useCallback(
    (note: string) => {
      if (sampler) {
        const now = Tone.now();
        sampler.triggerAttackRelease(note, "6n", now, 0.5);
      }
    },
    [sampler]
  );

  const playChord = useCallback(() => {
    if (sampler && chordFreqs.length > 0) {
      const now = Tone.now();
      sampler.triggerAttackRelease(chordFreqs, "4n", now, 0.5);
    }
  }, [chordFreqs, sampler]);

  const playChordAndArp = useCallback(() => {
    if (sampler && chordFreqs.length > 0) {
      const now = Tone.now();

      sampler.triggerAttackRelease(chordFreqs, "4n", now, 0.5);

      chordFreqs.forEach((freq, index) => {
        sampler.triggerAttackRelease(freq, "6n", now + 1 + 0.5 * index, 0.5);
      });
    }
  }, [chordFreqs, sampler]);

  const playChordAndArpFast = useCallback(() => {
    if (sampler && chordFreqs.length > 0) {
      const now = Tone.now();

      chordFreqs.forEach((freq, index) => {
        sampler.triggerAttackRelease(freq, "4n", now + 0.1 * index, 0.5);
      });

      chordFreqs.forEach((freq, index) => {
        sampler.triggerAttackRelease(freq, "6n", now + 1 + 0.5 * index, 0.5);
      });
    }
  }, [chordFreqs, sampler]);

  return {
    playMidiNote,
    playNote,
    playChord,
    playChordAndArp,
    playChordAndArpFast,
  };
};

export default usePlaySound;
