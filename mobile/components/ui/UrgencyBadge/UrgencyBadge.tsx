import React from "react";
import { ClinicalTone } from "@/theme";
import StatusBadge from "../StatusBadge";

export type Urgency = "Critical" | "High" | "Normal";

/** Urgency of a request: tone and Spanish label. */
export const URGENCY: Record<Urgency, { tone: ClinicalTone; label: string }> = {
    Critical: { tone: "urgent", label: "Urgente" },
    High: { tone: "observation", label: "Prioridad alta" },
    Normal: { tone: "info", label: "Programada" },
};

type Props = {
    urgency: Urgency;
};

export default function UrgencyBadge({ urgency }: Props) {
    const { tone, label } = URGENCY[urgency];
    return <StatusBadge tone={tone} label={label} />;
}
