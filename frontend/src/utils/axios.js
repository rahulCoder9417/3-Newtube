import axios from "axios";

export const onSubmitAxios = async (type, url, data = {}, headers = {}, param = {}) => {
  try {
    const baseUrl = `http://localhost:8000/api/v1/${url}`;
    let response;

    switch (type.toLowerCase()) {
      case "post":
        response = await axios.post(baseUrl, data, { headers, withCredentials: true });
        break;
      case "get":
        response = await axios.get(baseUrl, { params: param, headers, withCredentials: true });
        break;
      case "patch":
        response = await axios.patch(baseUrl, data, { headers, withCredentials: true });
        break;
      case "put":
        response = await axios.put(baseUrl, data, { headers, withCredentials: true });
        break;
      case "delete":
        response = await axios.delete(baseUrl, { data, headers, withCredentials: true });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${type}`);
    }

    return response; // Return the resolved data
  } catch (error) {
    console.error("Axios Request Error:", error.response || error.message);
    throw error; // Propagate error for handling in the calling function
  }
};
