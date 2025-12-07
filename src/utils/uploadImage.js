import axios from 'axios';

export const uploadImage = async (file) => {
  
  const imageFile = file;
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);

  try {
    const imgUploadUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`;

    const res = await axios.post(imgUploadUrl, formData);
    return res.data.secure_url
  } catch (error) {
    console.log(error);
  }
};
