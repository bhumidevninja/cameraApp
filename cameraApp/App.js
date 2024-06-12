import React from "react";
import {
	View,
} from "react-native";
import { CameraScreen } from "./src/CameraScreen";


export default function App() {
	return (
		<View style={{ flex: 1 }}>
			<CameraScreen />
		</View>
	);
}