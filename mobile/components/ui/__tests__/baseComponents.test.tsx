import React from "react";
import { AccessibilityInfo, StyleSheet, ViewStyle } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactTestInstance } from "react-test-renderer";

import AppButton from "@/components/ui/AppButton";
import BloodTypeChip from "@/components/ui/BloodTypeChip";
import DonationStepper from "@/components/ui/DonationStepper";
import IconButton from "@/components/ui/IconButton";
import LivePulseBanner from "@/components/ui/LivePulseBanner";
import RequestCard, { RequestCardProps } from "@/components/ui/RequestCard";
import StatusBadge from "@/components/ui/StatusBadge";
import TextField from "@/components/ui/TextField";
import UrgencyBadge from "@/components/ui/UrgencyBadge";
import { lightColors, MIN_TOUCH_TARGET } from "@/theme";
import { spokenBloodType } from "@/utils/spokenBloodType";

const request: RequestCardProps = {
  title: "Sofía Navarro, 7 años",
  subtitle: "Plaquetas",
  bloodTypes: ["A+", "O-"],
  urgency: { tone: "urgent", label: "Urgente" },
  centerName: "Hospital Central",
  distance: "3,2 km",
  description: "Requiere 4 unidades para quimioterapia.",
  progress: { current: 2, goal: 4, unit: "unidades" },
  onDonate: jest.fn(),
  onShare: jest.fn(),
  onCall: jest.fn(),
};

/** Touch area of a pressable: drawn size plus hitSlop. Text buttons are at least their side padding wide. */
function touchArea(element: ReactTestInstance) {
  const style = StyleSheet.flatten(element.props.style) as ViewStyle;
  const slop = element.props.hitSlop ?? {};
  const height = Number(style.height ?? style.minHeight ?? 0);
  const width = Number(style.width ?? style.minWidth ?? 2 * Number(style.paddingHorizontal ?? 0));
  return {
    width: width + (slop.left ?? 0) + (slop.right ?? 0),
    height: height + (slop.top ?? 0) + (slop.bottom ?? 0),
  };
}

describe("AppButton", () => {
  it("is a button named by its title and runs onPress", () => {
    const onPress = jest.fn();
    render(<AppButton title="Quiero donar" onPress={onPress} />);
    fireEvent.press(screen.getByRole("button", { name: "Quiero donar" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disabled: announced as disabled and does nothing", () => {
    const onPress = jest.fn();
    render(<AppButton title="Enviar" onPress={onPress} disabled />);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("loading: announced as busy and can't be pressed twice", () => {
    const onPress = jest.fn();
    render(<AppButton title="Enviar" onPress={onPress} loading />);
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeBusy();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("primary uses the brand crimson with 12px radius", () => {
    render(<AppButton title="Donar" />);
    expect(screen.getByRole("button")).toHaveStyle({ backgroundColor: lightColors.primary, borderRadius: 12, minHeight: 48 });
  });
});

describe("touch targets are at least 48x48", () => {
  it.each([
    ["primary button", <AppButton key="a" title="Ok" />],
    ["ghost button", <AppButton key="b" title="Ok" variant="ghost" />],
    ["40px icon button", <IconButton key="c" icon="share" accessibilityLabel="Compartir" />],
    ["32px icon button", <IconButton key="d" icon="close" size={32} accessibilityLabel="Cerrar" />],
    ["request card actions", <RequestCard key="e" {...request} />],
  ])("%s", (_name, element) => {
    render(element);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const area = touchArea(button);
      expect(area.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(area.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    }
  });
});

describe("IconButton", () => {
  it("is named for screen readers even though it only shows an icon", () => {
    render(<IconButton icon="call" accessibilityLabel="Llamar al centro" onPress={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Llamar al centro" })).toBeOnTheScreen();
  });
});

describe("TextField", () => {
  it("the input is labelled, 52px tall, and the error is announced", () => {
    render(<TextField label="Teléfono" error="Ingresa un teléfono válido" />);
    expect(screen.getByLabelText("Teléfono")).toHaveProp("accessibilityHint", "Ingresa un teléfono válido");
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un teléfono válido");
    expect(screen.getByTestId("text-field-box")).toHaveStyle({ minHeight: 52, borderRadius: 12, borderColor: lightColors.error });
  });

  it("focus shows the 2px blue outline", () => {
    render(<TextField label="Nombre" />);
    fireEvent(screen.getByLabelText("Nombre"), "focus");
    expect(screen.getByTestId("text-field-box")).toHaveStyle({ borderWidth: 2, borderColor: lightColors.focus });
    fireEvent(screen.getByLabelText("Nombre"), "blur");
    expect(screen.getByTestId("text-field-box")).toHaveStyle({ borderWidth: 1 });
  });
});

describe("clinical badges", () => {
  it.each([
    ["urgent", lightColors.tones.urgent],
    ["observation", lightColors.tones.observation],
    ["viable", lightColors.tones.viable],
  ] as const)("%s uses its tone colors and is read by its text", (tone, colors) => {
    render(<StatusBadge tone={tone} label="Estado" />);
    expect(screen.getByLabelText("Estado")).toHaveStyle({ backgroundColor: colors.background });
  });

  it("the urgency badge says the urgency in Spanish", () => {
    render(<UrgencyBadge urgency="Critical" />);
    expect(screen.getByLabelText("Urgente")).toBeOnTheScreen();
  });

  it("the blood chip is read as a group, not as a symbol", () => {
    render(<BloodTypeChip label="O-" />);
    expect(screen.getByLabelText("Grupo sanguíneo O negativo")).toHaveStyle({ backgroundColor: lightColors.bloodBadge.background });
  });
});

describe("RequestCard", () => {
  it("screen readers hear urgency, required group and center", () => {
    render(<RequestCard {...request} />);
    expect(
      screen.getByLabelText("Urgente. Se necesita A positivo o O negativo. Hospital Central, a 3,2 km. Sofía Navarro, 7 años"),
    ).toBeOnTheScreen();
  });

  it("actions stay separate, named buttons", () => {
    render(<RequestCard {...request} />);
    fireEvent.press(screen.getByRole("button", { name: "Quiero donar" }));
    expect(request.onDonate).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Compartir solicitud" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Llamar a Hospital Central" })).toBeOnTheScreen();
  });

  it("without actions it renders no buttons", () => {
    render(<RequestCard {...request} onDonate={undefined} onShare={undefined} onCall={undefined} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("DonationStepper", () => {
  it("announces the current step", () => {
    render(<DonationStepper current={1} />);
    expect(screen.getByRole("progressbar")).toHaveAccessibilityValue({ min: 1, max: 4, now: 2, text: "Analizada" });
    expect(screen.getByLabelText("Paso 2 de 4: Analizada")).toBeOnTheScreen();
  });
});

describe("LivePulseBanner", () => {
  afterEach(() => jest.restoreAllMocks());

  it("pulses by default", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(false);
    render(<LivePulseBanner message="3 solicitudes urgentes cerca" detail="En vivo" />);
    expect(screen.getByLabelText("En vivo: 3 solicitudes urgentes cerca")).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByTestId("pulse-halo")).toBeOnTheScreen());
  });

  it("stops the pulse when the user asked to reduce motion", async () => {
    jest.spyOn(AccessibilityInfo, "isReduceMotionEnabled").mockResolvedValue(true);
    render(<LivePulseBanner message="3 solicitudes urgentes cerca" />);
    await waitFor(() => expect(screen.queryByTestId("pulse-halo")).toBeNull());
  });
});

describe("spokenBloodType", () => {
  it.each([
    ["O-", "O negativo"],
    ["AB+", "AB positivo"],
    ["o−", "O negativo"],
    ["A POS", "A positivo"],
    ["Plaquetas", "Plaquetas"],
  ])("%s -> %s", (input, spoken) => {
    expect(spokenBloodType(input)).toBe(spoken);
  });
});
