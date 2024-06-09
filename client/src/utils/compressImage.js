import pica from "pica";

const compressImage = async (file, stateSetterFunc) => {
  const img = document.createElement("img");
  const reader = new FileReader();

  reader.onload = event => {
    img.src = event.target.result;
  };

  reader.onloadend = () => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const picaInstance = pica();

      canvas.width = 600; // Set desired width
      canvas.height = (img.height / img.width) * 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      picaInstance
        .resize(img, canvas)
        .then(result => picaInstance.toBlob(result, "image/png", 0.9)) //  quality for compression
        .then(blob => {
          stateSetterFunc(URL.createObjectURL(blob));
        });
    };
  };

  reader.readAsDataURL(file);
};

export default compressImage;
