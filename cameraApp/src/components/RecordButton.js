import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const RecordButton = () => {
    return (
        <>
            <View style={[styles.button, { padding: 3 }]}>
                <View style={styles.startVdo} />
            </View>
            <Text style={{ color: 'white' }}>Start Recording</Text>
        </>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        alignSelf: 'center',
        justifyContent: "center",
        alignItems: "center",
    },
    startVdo: {
        height: '100%',
        width: '100%',
        backgroundColor: 'red',
        borderRadius: 100,
        borderColor: 'white',
        borderWidth: 4
    }
});