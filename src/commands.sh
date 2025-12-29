# for starting the metro server
npm start
# for running the android build and dumping on to test
npx react-native run-android
# to build the release apk
cd android
npx react-native run-android

adb reverse tcp:8081 tcp:8081