import React, { useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

const URL = "https://teachablemachine.withgoogle.com/models/kBHln8tnk/";

function Tensorflow() {
  const [model, setModel] = useState(null);
  const [maxPredictions, setMaxPredictions] = useState(0);
  const [maxUser, setMaxUser] = useState("");

  async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const tmModel = await tmImage.load(modelURL, metadataURL);
    setModel(tmModel);
    setMaxPredictions(tmModel.getTotalClasses());
  }

  async function predict(webcamRef, labelContainer) {
    if (model && webcamRef && webcamRef.current && labelContainer) {
      const prediction = await model.predict(webcamRef.current.video);
      let maxProbablity  = prediction[0].probability;
      let maxclassName = prediction[0].className;

      for (let i = 0; i < maxPredictions; i++) {
        if(prediction[i].probability>maxProbablity){
          maxProbablity = prediction[i].probability;
          maxclassName = prediction[i].className;
          setMaxUser(maxclassName);
        }
        const classPrediction =
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
      }
    }
  }

  useEffect(() => {
    init();
  }, []);

  const webcamRef = React.useRef(null);

  const loop = async () => {
    await predict(webcamRef, document.getElementById("label-container"));
    window.requestAnimationFrame(loop);
  };

  const handleMarkAttendance = async () => {
    // Make Axios request to backend with the username (maxUser)
    try {
      const response = await axios.post("YOUR_BACKEND_ENDPOINT", {
        username: maxUser,
      });
      console.log(response.data); // Log response from the backend
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center flex-col gap-10 text white">
      <h1 className="text-blcak font-bold text-3xl">Facial Attendance System</h1>
      <button type="button" className="px-3 bg-blue-500 py-2 rounded "onClick={loop}>
        Start
      </button>
      <div className="flex justify-center items-center h-1/2 w-1/2 rounded-2xl bg-gray-200 overflow-clip">

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full scale-125 rounded-2xl"
        />
        </div>
      <div id="label-container" className="hidden">
        {Array.from(Array(maxPredictions).keys()).map((index) => (
          <div key={index}></div>
        ))}
      </div>
      <button type="button" className="px-3 bg-blue-500 py-2 rounded "onClick={loop}>
        Mark Attendance for {maxUser}
      </button>
    </div>
  );
}

export default Tensorflow;
