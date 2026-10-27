import React, { memo } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ClinicalTone, useTheme } from "@/theme";
import { spokenBloodType } from "@/utils/spokenBloodType";
import AppButton, { IconName } from "../AppButton";
import AppCard from "../AppCard";
import AppText from "../AppText";
import BloodTypeChip from "../BloodTypeChip";
import IconButton from "../IconButton";
import StatusBadge from "../StatusBadge";
import { useStyles } from "./RequestCard.styles";

export type RequestCardProps = {
    title: string;
    /** e.g. donation type or diagnosis, shown in red under the title. */
    subtitle?: string;
    /** Blood groups that can donate, e.g. ["A+", "O-"]. */
    bloodTypes: string[];
    urgency: { tone: ClinicalTone; label: string };
    centerName: string;
    /** Already formatted, e.g. "3,2 km". */
    distance?: string;
    description?: string;
    progress?: { current: number; goal: number; unit?: string };
    icon?: IconName;
    donateLabel?: string;
    onDonate?: () => void;
    onShare?: () => void;
    onCall?: () => void;
};

/**
 * What a screen reader says for the card, in order of importance:
 * urgency, required group, center, then the title.
 */
export function requestSummary({ urgency, bloodTypes, centerName, distance, title }: RequestCardProps): string {
    const groups = bloodTypes.map(spokenBloodType).join(" o ");
    return [
        urgency.label,
        groups && `Se necesita ${groups}`,
        distance ? `${centerName}, a ${distance}` : centerName,
        title,
    ].filter(Boolean).join(". ");
}

/** Donation request card, after the Stitch "Solicitudes de donación" screen. */
function RequestCard(props: RequestCardProps) {
    const {
        title, subtitle, bloodTypes, urgency, centerName, distance, description, progress,
        icon = "bloodtype", donateLabel = "Quiero donar", onDonate, onShare, onCall,
    } = props;
    const styles = useStyles();
    const { colors } = useTheme();
    const accent = urgency.tone === "urgent" ? colors.primary : colors.tones[urgency.tone].foreground;
    const percent = progress && progress.goal > 0 ? Math.min(100, Math.round((progress.current / progress.goal) * 100)) : 0;

    return (
        <AppCard flush elevation={urgency.tone === "urgent" ? 2 : 1}>
            <View style={[styles.accent, { backgroundColor: accent }]} />
            <View style={styles.body}>
                {/* One stop for screen readers; the actions below stay separate buttons. */}
                <View accessible accessibilityLabel={requestSummary(props)} style={styles.summary}>
                    <View style={styles.header}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name={icon} size={22} color={colors.primaryText} />
                        </View>
                        <View style={styles.titles}>
                            <AppText variant="titleSm" numberOfLines={2}>{title}</AppText>
                            {subtitle ? (
                                <AppText variant="bodySm" weight="600" color={colors.primaryText} numberOfLines={1}>
                                    {subtitle}
                                </AppText>
                            ) : null}
                            <View style={styles.centerRow}>
                                <MaterialIcons name="domain" size={14} color={colors.secondaryText} />
                                <AppText variant="labelSm" color={colors.textMuted} numberOfLines={1} style={styles.centerText}>
                                    {distance ? `${centerName} · ${distance}` : centerName}
                                </AppText>
                            </View>
                        </View>
                        <View style={styles.side}>
                            <View style={styles.chips}>
                                {bloodTypes.map((type) => (
                                    <BloodTypeChip key={type} label={type} size="md" />
                                ))}
                            </View>
                            <StatusBadge tone={urgency.tone} label={urgency.label} />
                        </View>
                    </View>

                    {description ? (
                        <View style={styles.description}>
                            <AppText variant="bodySm" color={colors.textMuted} numberOfLines={3}>
                                {description}
                            </AppText>
                        </View>
                    ) : null}

                    {progress ? (
                        <View>
                            <View style={styles.progressLabels}>
                                <AppText variant="labelSm">
                                    {`Meta: ${progress.current} de ${progress.goal}${progress.unit ? ` ${progress.unit}` : ""}`}
                                </AppText>
                                <AppText variant="labelSm" color={colors.secondaryText}>{`${percent}%`}</AppText>
                            </View>
                            <View style={styles.track}>
                                <View style={[styles.fill, { width: `${percent}%` }]} />
                            </View>
                        </View>
                    ) : null}
                </View>

                {onDonate || onShare || onCall ? (
                    <View style={styles.actions}>
                        {onDonate ? (
                            <AppButton
                                title={donateLabel}
                                icon="favorite"
                                onPress={onDonate}
                                accessibilityHint={`Donar para: ${title}`}
                                style={styles.donate}
                            />
                        ) : null}
                        {onShare ? (
                            <IconButton icon="share" variant="tonal" size={48} color={colors.secondaryText}
                                accessibilityLabel="Compartir solicitud" onPress={onShare} />
                        ) : null}
                        {onCall ? (
                            <IconButton icon="call" variant="tonal" size={48}
                                accessibilityLabel={`Llamar a ${centerName}`} onPress={onCall} />
                        ) : null}
                    </View>
                ) : null}
            </View>
        </AppCard>
    );
}

export default memo(RequestCard);
