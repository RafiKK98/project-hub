export interface LabelDto {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
}

export interface CreateLabelPayload {
  name: string;
  color: string;
}

export interface UpdateLabelPayload extends Partial<CreateLabelPayload> {}

export const LABEL_COLORS = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#a855f7", name: "Purple" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#64748b", name: "Slate" },
  { hex: "#78716c", name: "Stone" },
  { hex: "#171717", name: "Black" },
] as const;
