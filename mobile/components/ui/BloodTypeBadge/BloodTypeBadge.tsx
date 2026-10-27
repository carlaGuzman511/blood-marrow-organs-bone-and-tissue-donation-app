import React from "react";
import { BloodType } from "@/models/App.types";
import BloodTypeChip from "../BloodTypeChip";

type Props = {
    bloodType: BloodType | undefined;
    size?: "sm" | "md";
};

/** Blood group of an API entity; nothing when the group is unknown. */
export default function BloodTypeBadge({ bloodType, size }: Props) {
    if (!bloodType?.name) return null;
    return <BloodTypeChip label={bloodType.name} size={size} />;
}
