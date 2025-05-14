import axios from "axios";

const GET_PATH = "http://localhost:8080/path";

async function getPath({ startPoint, targetPoint }) {
    try {
        const response = await axios.get(GET_PATH, {
            params: { startPoint, targetPoint }
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Error fetching path:", error);
        throw error;
    }
}



export { getPath };