import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const Loader = ({ text }) => {
  return (
    <View style={styles.container} >
      <View style={styles.loaderView}>
        <ActivityIndicator size={'large'} />
        {text && <Text>{text}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderView: {
    backgroundColor: 'white',
    height: 100,
    width: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});