import React, { useState } from "react";

const Train = () => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleTrain = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/train", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error during training:", error);
      alert("An error occurred during training. Please try again.");
    }
  };
};

export default Train;
