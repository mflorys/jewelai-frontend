export type DesignProcessStatus =
  | "INTAKE_IN_PROGRESS"
  | "READY_FOR_GENERATION"
  | "GENERATION_REQUESTED"
  | "GENERATING"
  | "VISUAL_READY"
  | "GENERATED"
  | "CLIENT_ACCEPTED"
  | "SENT_TO_REVIEW"
  | "APPROVED_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "CRAFTED"
  | "SHIPPING"
  | "IN_DELIVERY"
  | "COMPLETED"
  | "RETURN_IN_PROGRESS";

export type DesignProcess = {
  id: number;
  title: string;
  status: DesignProcessStatus;
  type?: string | null;
  createdAt: string;
  updatedAt: string;
  visualizationUrl?: string | null;
  imageUrl?: string | null;
  externalJobId?: string | null;
};

export type DesignProcessDetails = DesignProcess & {
  additionalComment?: string | null;
  answers?: UserAnswer[];
};

export type ProcessStatusResponse = {
  id: number;
  status: DesignProcessStatus;
  updatedAt: string;
  type?: string | null;
  title: string;
};

export type QuizQuestion = {
  id: number;
  code: string;
  questionJson: Record<string, unknown>;
  active?: boolean;
};

export type UserAnswer = {
  questionId: number;
  questionCode: string;
  answerJson: unknown;
  answeredAt: string;
};
