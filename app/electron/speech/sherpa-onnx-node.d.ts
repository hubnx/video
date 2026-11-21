// The calls transcribe.ts makes into sherpa-onnx's Node add-on (sherpa-onnx-node 2.0.1, whose JavaScript carries no
// types of its own): only these, so a change in the add-on shows here first.
declare module "sherpa-onnx-node" {
  export class Vad {
    constructor(config: object, bufferSeconds: number);
    acceptWaveform(samples: Float32Array): void;
    isEmpty(): boolean;
    front(external: boolean): { start: number; samples: Float32Array };
    pop(): void;
    flush(): void;
  }

  export interface OfflineStream {
    acceptWaveform(wave: { samples: Float32Array; sampleRate: number }): void;
  }

  export class OfflineRecognizer {
    constructor(config: object);
    createStream(): OfflineStream;
    decode(stream: OfflineStream): void;
    getResult(stream: OfflineStream): { tokens: string[]; timestamps: number[]; durations?: number[] };
  }
}
