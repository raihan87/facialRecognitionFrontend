import React, { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";

function Tensorflow() {
  const webcamRef = useRef(null);

  async function classifyImage(imageData) {
    const model = await tf.loadLayersModel(
      "https://teachablemachine.withgoogle.com/models/i1bDARL_o/"
    );
    const img = tf.browser.fromPixels(imageData);
    const resized = tf.image.resizeBilinear(img, [224, 224]);
    const expanded = resized.expandDims(0);
    const prediction = await model.predict(expanded).data();
    return prediction;
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    classifyImage(imageSrc).then((prediction) => console.log(prediction));
  }, [webcamRef]);

  return (
    <div>
      <Webcam audio={false} ref={webcamRef} />
      <button onClick={capture}>Capture</button>
    </div>
  );
}

export default Tensorflow;
