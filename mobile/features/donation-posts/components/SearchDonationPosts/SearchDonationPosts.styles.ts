import { StyleSheet } from "react-native";
import { COLORS } from "@/constants";

export default StyleSheet.create({
     list: {
        paddingBottom: 36,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        color: COLORS.secondaryGray,
        fontSize: 15,
    },
        card: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        marginVertical: 10,
        padding: 18,
        shadowColor: COLORS.black,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.gray,
        overflow: "hidden",
    },
        body: {
        flexDirection: "row",
        marginTop: 16,
    },
    info: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.black,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondaryGray,
        marginTop: 6,
    },
    location: {
        marginTop: 8,
        fontSize: 13,
        color: COLORS.secondaryBlack,
    },
    description: {
        marginTop: 10,
        lineHeight: 20,
        color: COLORS.secondaryBlack,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 18,
    },
});