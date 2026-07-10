import React, { memo } from "react";

import Badge from "../Badge";

import { COLORS } from "@/constants";

type Props = {
    isOpen: boolean;
};

function StatusBadge({
    isOpen,
}: Props) {
    if (isOpen) {
        return (
            <Badge
                label="Open"
                backgroundColor={COLORS.lightGreen}
                textColor={COLORS.green}
            />
        );
    }

    return (
        <Badge
            label="Closed"
            backgroundColor={COLORS.lightRed}
            textColor={COLORS.danger}
        />
    );
}

export default memo(StatusBadge);