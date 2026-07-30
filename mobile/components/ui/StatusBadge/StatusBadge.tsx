import React, { memo } from "react";
import Badge from "../Badge";
import { COLORS } from "@/constants";

type Props = {
    label: string;
    isOpen: boolean;
};

function StatusBadge({
    label,
    isOpen,
}: Props) {
    if (isOpen) {
        return (
            <Badge
                label={label}
                backgroundColor={COLORS.lightGreen}
                textColor={COLORS.green}
            />
        );
    }

    return (
        <Badge
            label={label}
            backgroundColor={COLORS.lightRed}
            textColor={COLORS.danger}
        />
    );
}

export default memo(StatusBadge);