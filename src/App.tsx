//@ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://af78-103-145-18-120.ngrok-free.app'); 
// const socket = io('http://localhost:5001');


const App: React.FC = () => {
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // const [processedFrame, setProcessedFrame] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [text, setText] = useState('')
  const [text2, setText2] = useState('')

  const [processedFrames, setProcessedFrames] = useState<string[]>([]);


  
  // const startCapture = async () => {
  //   // socket.emit('video_frame', "frame_data");

  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });

  //     // setVideoStream(stream);
  //     // const videoElement = videoRef.current;
  //     // if (videoElement) {
  //     //   videoElement.srcObject = stream;

  //     //   const videoTrack = stream.getVideoTracks()[0];
  //     //   const videoSettings = videoTrack.getSettings();
  //     //   const videoWidth = videoSettings.width || 640;
  //     //   const videoHeight = videoSettings.height || 480;

  //     //   const canvas = document.createElement('canvas');
  //     //   const canvasContext = canvas.getContext('2d');

  //     //   const captureFrame = () => {
  //     //     canvas.width = videoWidth;
  //     //     canvas.height = videoHeight;

  //     //     canvasContext?.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  //     //     const frame_data = canvas.toDataURL('image/jpeg', 0.8);

  //     //     socket.emit('video_frame', frame_data);
  //     //     setText2("send")

  //     //     requestAnimationFrame(captureFrame);
  //     //   };

  //     //   requestAnimationFrame(captureFrame);
  //     // }
  //   } catch (error) {
  //     console.error('Error accessing camera:', error);
  //   }
  // };


  useEffect(()=>{
    const capture = async()=>{

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream)
      videoRef.current?.srcObject = videoStream

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const framerate = 1000 /30 

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg');
      socket.emit('video_frame', imageData);

      // setTimeout()

    }

    capture()
    


  },[videoStream])

  const stopCapture = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);

    }
  };

  useEffect(() => {
    socket.on('processed_frame', (processed_frame_bytes: string) => {
      setText('recived')
       setProcessedFrames((prevFrames) => [...prevFrames, processed_frame_bytes]);
     });
     return () => {
      socket.off('processed_frame')
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-black font-bold underline">{text}</h1>
      <h1 className="text-3xl text-black font-bold underline">{text2}</h1>
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

