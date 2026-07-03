export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
  avatarColor: string;
}

export interface ScriptPreset {
  id: string;
  title: string;
  text: string;
  category: string;
}

export interface GenerationConfig {
  voice: string;
  voiceStyle: string;
  pace: string;
  emphasis: string;
  pauses: string;
}

export interface GeneratedAudio {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  voice: string;
  timestamp: string;
  config: GenerationConfig;
}
