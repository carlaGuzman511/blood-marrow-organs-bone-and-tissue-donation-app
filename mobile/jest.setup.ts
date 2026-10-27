/// <reference types="@testing-library/react-native/extend-expect" />
// Icon fonts don't load under Jest (expo-font has no native side here): render icons as their name.
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const icon = (family: string) => {
    const Icon = ({ name }: { name: string }) =>
      React.createElement(Text, { testID: `icon-${name}`, accessibilityElementsHidden: true }, name);
    Icon.displayName = family;
    return Icon;
  };
  return new Proxy({}, { get: (_target, family: string) => icon(family) });
});
