import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "./styles";

const Button = (props) => {
  const {
    title,
    style,
    textStyle,
    color,
    onPress,
    disabled,
    activityIndicatorStatus,
  } = props;

  const background =
    color === "primary"
      ? "#3A3745"
      : color === "success"
      ? "#4caf50"
      : color === "warning"
      ? "#ff9800"
      : color === "light"
      ? "white"
      : color === "green"
      ? "#2DD47F"
      : color === "error"
      ? "#f44336"
      : color;

  return (
    <>
      {activityIndicatorStatus ? (
        <View style={[styles.container, style]}>
          <ActivityIndicator size={"large"} color={background} />
        </View>
      ) : (
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <View
            style={[styles.container, style, { backgroundColor: background }]}
          >
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Button;
