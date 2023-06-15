
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';



const socket = io('https://69e3-103-145-18-122.ngrok-free.app/'); 


const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [processedFrame, setProcessedFrame] = useState<string>('');

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      socket.emit('start_capture');
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCapture = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);
      socket.emit('stop_capture');
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    socket.on('processed_frame', (frame: string) => {
      setProcessedFrame(frame);
    });

    return () => {
      stopCapture();
      socket.disconnect();
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
      <div>
        {processedFrame && <img src={`data:image/jpeg;base64,${processedFrame}`} alt="Processed Frame" />}
      </div>
    </div>
  );
};

export default App;

