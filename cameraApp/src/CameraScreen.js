import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import { useFaceDetector } from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import axios from "axios";
import { Loader } from "./components/Loader";
import { RecordButton } from "./components/RecordButton";

export const CameraScreen = () => {
  const faceDetectionOptions = useRef({
    landmarkMode: "eyes",
  }).current;

  const device = useCameraDevice("front");
  const { detectFaces } = useFaceDetector(faceDetectionOptions);
  const [detectedFaces, setDetectedFaces] = useState([]);

  const [isRecordingStarted, setIsRecordingStarted] = useState(false);
  const [cameraPermission, setCameraPermission] = useState("");
  const [seconds, setSeconds] = useState(10);
  const [videoUri, setVideoUri] = useState(null);
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const NODE_SERVER_IP = "NODE_SERVER_IP";

  useEffect(() => {
    permisionFunction();
  }, []);

  useEffect(() => {
    if (isRecordingStarted) {
      let interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRecordingStarted]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces) => {
    setDetectedFaces(faces);
  });

  const permisionFunction = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    setCameraPermission(cameraPermission);
    if (cameraPermission !== "granted") {
      alert("Camera Permission needed.");
    }
  };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const faces = detectFaces(frame);
      handleDetectedFaces(faces);
    },
    [handleDetectedFaces]
  );

  const startVideoRecording = async () => {
  if (isRecordingStarted) return;
    try {
      await cameraRef.current.startRecording({
        fileType: Platform.OS === "ios" ? "mov" : "mp4",
        onRecordingError: (error) => {
          console.error("Recording failed!", error);
        },
        onRecordingFinished: async (video) => {
          setVideoUri(video.path);
        },
      });

      setTimeout(async () => {
        await cameraRef.current.stopRecording();
        setIsRecordingStarted(false);
      }, 10000);
    } catch (error) {
      console.error("Error while recording video:", error);
      Alert.alert("Error", "Failed to recording");
    }
  };

  const uploadVideo = async (uri) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("video", {
        uri: `file://${uri}`,
        type: "video/mp4",
        name: "video.mp4",
      });
      await axios.post(NODE_SERVER_IP + "/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          transformRequest: () => formData,
        },
      });
      setIsLoading(false);
      Alert.alert("Success", "Video uploaded.");
      setVideoUri(null);
    } catch (error) {
		setIsLoading(false);
      console.error("Error uploading video:", error);
      Alert.alert("Error", "Failed to upload video");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {!!device && cameraPermission === "granted" ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!videoUri}
		  orientation='portrait'
          frameProcessor={frameProcessor}
          frameProcessorFps={1}
          faceDetectionOptions={{
            performanceMode: "fast",
            classificationMode: "all",
            landmarkMode: "all",
          }}
        />
      ) : (
        <>
          {!device && <Text>No Device</Text>}
          {cameraPermission !== "granted" && (
            <Text>Please Allow Camera Permission From setting</Text>
          )}
        </>
      )}
      {detectedFaces.map((face, index) => (
        <React.Fragment key={index}>
          <View
            style={{
              position: "absolute",
              left: face.bounds.x - 30,
              top: face.bounds.y + 25,
              width: face.bounds.width,
              height: face.bounds.height + face.bounds.height * 0.3,
              borderWidth: 2,
              borderColor: "blue",
            }}
          />
        </React.Fragment>
      ))}
      {cameraPermission === "granted" &&
        (!isLoading ? (
          <View style={styles.controlView}>
            {!videoUri ? (
              <TouchableOpacity
                onPress={() => {
                  setIsRecordingStarted(true);
                  startVideoRecording();
                }}
              >
                <View>
                  {!isRecordingStarted ? (
                    <RecordButton />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        color: "white",
                        alignSelf: "center",
                      }}
                    >
                      {`Recording ${seconds}s`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonView}>
                <TouchableOpacity
                  onPress={() => uploadVideo(videoUri)}
                  style={styles.buttonStyle}
                >
                  <Image
                    tintColor={"white"}
                    style={{
                      width: 25,
                      height: 25,
                    }}
                    source={require("../src/assets/icons/upload.png")}
                  />
                  <Text style={{ color: "white", fontSize: 16 }}>Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVideoUri(null)}
                  style={{ ...styles.buttonStyle, paddingHorizontal: 20 }}
                >
                  <Image
                    tintColor={"white"}
                    style={{
                      width: 25,
                      height: 25,
                    }}
                    source={require("../src/assets/icons/reset.png")}
                  />
                  <Text style={{ color: "white", fontSize: 16 }}>
                    Record Again
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <Loader text={"Uploading..."} />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  controlView: {
    flex: 1,
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    position: "absolute",
    bottom: 2,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 100,
  },
  buttonView: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  buttonStyle: {
    paddingVertical: 4,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    borderRadius: 10,
  },
});
