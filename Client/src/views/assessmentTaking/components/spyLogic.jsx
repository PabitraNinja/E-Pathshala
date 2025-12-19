import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { uploadFile } from 'react-s3';
import { useSelector } from 'react-redux';
import './../styles.css';
import cheatingService from '../../../services/cheatingService';
import ReactCountdownClock from 'react-countdown-clock';
import { useHistory } from 'react-router-dom';

const SpyLogic = ({ examId, timeRemaining }) => {
  const history = useHistory();
  const webcamRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [cnt, setCnt] = useState(1);
  const [frst, setFrst] = useState(true);

  // audio controls
  const recorderControls = useAudioRecorder();

  // S3 credentials
  const S3_BUCKET = '';
  const REGION = '';
  const ACCESS_KEY = '';
  const SECRET_ACCESS_KEY = '';

  // Memoize config
  const config = useMemo(
    () => ({
      bucketName: S3_BUCKET,
      region: REGION,
      dirName: `${user.name}:${user._id}`,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
    }),
    [user]
  );

  // Upload function
  const handleUpload = useCallback(
    async (file) => {
      try {
        const data = await uploadFile(file, config);
        console.log('Upload successful:', data);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    },
    [config]
  );

  // Event handler when tab is hidden
  const eventHandler = useCallback(() => {
    document.title = document.hidden ? window.close() : "DON'T go away";
  }, []);

  // Initial setup
  useEffect(() => {
    document.addEventListener('visibilitychange', eventHandler);
    try {
      cheatingService.clear();
    } catch {
      console.log('No pre-counter found');
    }
    return () =>
      document.removeEventListener('visibilitychange', eventHandler);
  }, [eventHandler]);

  // Cleanup
  useEffect(() => {
    return () => {
      recorderControls.stopRecording();
      history.goBack();
    };
  }, [history, recorderControls]);

  // Handle audio complete
  const onRecordingComplete = useCallback(
    async (blob) => {
      blob.name = 'recording.mp3';
      handleUpload(blob);
    },
    [handleUpload]
  );

  // Capture webcam + manage audio cycles
  const capture = useCallback(async () => {
    if (frst) {
      setFrst(false);
      return;
    }

    if (cnt === 1) {
      recorderControls.startRecording();
    }

    setCnt((prev) => prev + 1);

    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());
    blob.name = `${cnt}.jpeg`;

    if (cnt === 7) {
      setCnt(1);
      recorderControls.stopRecording();
    }

    handleUpload(blob);
    cheatingService.batchInc(examId);
  }, [frst, cnt, handleUpload, examId, recorderControls]);

  // Capture interval
  useEffect(() => {
    const intervalId = setInterval(capture, 1500);
    return () => clearInterval(intervalId);
  }, [capture]);

  return (
    <div className="container">
      <Webcam
        audio={false}
        width={240}
        height={240}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 240, height: 240, facingMode: 'user' }}
      />

      <AudioRecorder
        onRecordingComplete={onRecordingComplete}
        recorderControls={recorderControls}
        downloadOnSavePress={false}
        downloadFileExtension="mp3"
      />

      <ReactCountdownClock
        seconds={timeRemaining}
        color="#000"
        alpha={0.9}
        size={240}
        onComplete={() => {
          recorderControls.stopRecording();
          cheatingService.clear();
          document.removeEventListener('visibilitychange', eventHandler);
          window.close();
        }}
      />
    </div>
  );
};

export default SpyLogic;
