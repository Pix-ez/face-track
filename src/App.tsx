
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
  // const [text, setText] = useState('')
  // // const [text2, setText2] = useState('')

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


  useEffect(() => {
    // Access the user's camera when the component mounts
    const getVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
      } catch (error) {
        console.log('Error accessing camera:', error);
      }
    };

    getVideoStream();

    // Clean up the video stream and socket when the component unmounts
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    
    };
  }, []);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    
      // Send video frames to the server
      const sendVideoFrames = () => {
        const canvas = document.createElement('canvas');
        const frameRate = 1000 / 30; // Approximate frame rate of 30 fps
    
        const sendFrame = () => {
          if (!videoStream.active || !videoRef.current) return;
    
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
    
          const context = canvas.getContext('2d');
          if (!context) return;
    
          context.drawImage(videoRef.current, 0, 0);
    
          // Convert the frame to Blob object
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                // Send the frame as binary data to the server
                socket.emit('video_frame', reader.result);
              };
              reader.readAsArrayBuffer(blob);
            }
          }, 'image/jpeg');
    
          setTimeout(sendFrame, frameRate);
        };
    
        sendFrame();
      };
    
      sendVideoFrames();
    }
    
    
    }
  , [videoStream]);


  const stopCapture = () => {
    if (videoStream) {
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setVideoStream(null);

    }
  };

  useEffect(() => {
    socket.on('processed_frame', (processed_frame_bytes: string) => {
      // setText('recived')
      setProcessedFrames((prevFrames) => [...prevFrames, processed_frame_bytes]);
    });
    return () => {
      socket.off('processed_frame')
    }
  }, []);

  return (
    <div>
      {/* <h1 className="text-3xl text-black font-bold underline">{text}</h1>
      <h1 className="text-3xl text-black font-bold underline">{text2}</h1> */}
      {/* <button className="p-2 m-3 bg-black text-white" onClick={startCapture}>
        Start
      </button> */}
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

