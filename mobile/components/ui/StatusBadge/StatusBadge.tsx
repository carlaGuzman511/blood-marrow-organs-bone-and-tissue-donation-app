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
                backgroundColor="#DCFCE7"
                textColor="#166534"
            />
        );
    }

    return (
        <Badge
            label="Closed"
            backgroundColor="#FEE2E2"
            textColor="#991B1B"
        />
    );
}

export default memo(StatusBadge);