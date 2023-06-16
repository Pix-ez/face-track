
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://cc63-103-145-18-127.ngrok-free.app'); 


const App: React.FC = () => {
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // const [processedFrame, setProcessedFrame] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const [processedFrames, setProcessedFrames] = useState<string[]>([]);


  
  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);

      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('processed_frame', (processed_frame_bytes: string) => {
        setProcessedFrames((prevFrames) => [...prevFrames, processed_frame_bytes]);
      });

      socket.emit('start_capture');

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;

        const videoTrack = stream.getVideoTracks()[0];
        const videoSettings = videoTrack.getSettings();
        const videoWidth = videoSettings.width || 640;
        const videoHeight = videoSettings.height || 480;

        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d');

        const captureFrame = () => {
          canvas.width = videoWidth;
          canvas.height = videoHeight;

          canvasContext?.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
          const frame_data = canvas.toDataURL('image/jpeg', 0.8);

          socket.emit('video_frame', frame_data);

          requestAnimationFrame(captureFrame);
        };

        requestAnimationFrame(captureFrame);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  
  const stopCapture = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);

      
      if (socket) {
        socket.emit('stop_capture');
        socket.disconnect();
      }
    }
  };

  useEffect(() => {
    return stopCapture;
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button className="p-2 m-3 bg-black text-white" onClick={startCapture}>
        Start
      </button>
      <button className="p-2 bg-black text-white" onClick={stopCapture}>
        Stop
      </button>
      {/* <div className="h-96 w-96 bg-pink-400">
        {videoStream && <video ref={videoRef} autoPlay muted playsInline></video>}
      </div> */}
      <div className="h-96 w-96 bg-blue-600" >
        {processedFrames.map((frame, index) => (
          <img key={index} src={`data:image/jpeg;base64,${frame}`} alt={`Processed Frame ${index}`} />
        ))}
      </div>
    </div>
  );
};


  // const startCapture = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     setVideoStream(stream);
  //     socket.emit('start_capture');
  //     startProcessingFrames(stream);
  //   } catch (error) {
  //     console.error('Error accessing camera:', error);
  //   }
  // };

  // const stopCapture = () => {
  //   if (videoStream) {
  //     const tracks = videoStream.getTracks();
  //     tracks.forEach((track) => track.stop());
  //     setVideoStream(null);
  //     socket.emit('stop_capture');
  //   }
  // };

  // useEffect(() => {
  //   if (videoRef.current && videoStream) {
  //     videoRef.current.srcObject = videoStream;
  //   }
  // }, [videoStream]);

  // useEffect(() => {
  //   socket.on('processed_frame', (frame: string) => {
  //     setProcessedFrame(frame);
  //   });

  //   return () => {
  //     stopCapture();
  //     socket.disconnect();
  //   };
  // }, []);

//   return (
//     <div>
//        <h1 className="text-3xl font-bold underline">
//       Hello world!
//     </h1>
//       <button 
//       className="p-2 m-3 bg-black text-white"
//       onClick={startCapture}>Start</button>
//       <button 
//       className="p-2 bg-black text-white"
//       onClick={stopCapture}>Stop</button>
//       <div  className='h-96 w-96 bg-pink-400'>
//       {videoStream && <video ref={videoRef} autoPlay></video>}
//       </div>
//       <div>
//         {processedFrame && <img src={`data:image/jpeg;base64,${processedFrame}`} alt="Processed Frame" />}
//       </div>
//     </div>
//   );
// };

export default App;

