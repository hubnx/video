// The calls the speech workers make into sherpa-onnx's Node add-on (sherpa-onnx-node 2.0.1, whose JavaScript carries no
// types of its own): only these, so a change in the add-on shows here first. A CommonJS module, so it's imported whole
// (its default): Node's own loader can't see its exports by name, though the bundled build can.
declare module "sherpa-onnx-node" {
  class Vad {
    constructor(config: object, bufferSeconds: number);
    acceptWaveform(samples: Float32Array): void;
    isEmpty(): boolean;
    front(external: boolean): { start: number; samples: Float32Array };
    pop(): void;
    flush(): void;
  }

  interface OfflineStream {
    acceptWaveform(wave: { samples: Float32Array; sampleRate: number }): void;
  }

  class OfflineRecognizer {
    constructor(config: object);
    createStream(): OfflineStream;
    decode(stream: OfflineStream): void;
    getResult(stream: OfflineStream): { tokens: string[]; timestamps: number[]; durations?: number[] };
  }

  class OnlineSpeechDenoiser {
    constructor(config: object);
    readonly sampleRate: number;
    run(request: { samples: Float32Array; sampleRate: number; enableExternalBuffer: boolean }): { samples: Float32Array; sampleRate: number };
    flush(enableExternalBuffer: boolean): { samples: Float32Array; sampleRate: number };
  }

  const sherpa: { Vad: typeof Vad; OfflineRecognizer: typeof OfflineRecognizer; OnlineSpeechDenoiser: typeof OnlineSpeechDenoiser };
  export default sherpa;
}
