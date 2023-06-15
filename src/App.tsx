


import React, { useState, useEffect, useRef } from 'react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCapture = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return (
    <div>
       <h1 className="text-3xl font-bold underline">
      Hello world!
    </h1>
      <button 
      className="p-2 m-3 bg-black text-white"
      onClick={startCapture}>Start</button>
      <button 
      className="p-2 bg-black text-white"
      onClick={stopCapture}>Stop</button>
      <div  className='h-96 w-96 bg-pink-400'>
      {videoStream && <video ref={videoRef} autoPlay></video>}
      </div>
    </div>
  );
};

export default App;

