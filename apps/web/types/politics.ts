export interface Stance {
  seats: number;
  parties: string[];
}

export interface QuestionData {
  motion: string;
  yes: Stance;
  no: Stance;
  neutral: Stance;
}
