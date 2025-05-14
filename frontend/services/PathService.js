import {Cache as axios} from "three";

const GET_PATH = "http://localhost:8080/route";

async function getPath(startPoint, targetPoint, ) {
    const path = await axios.get(GET_PATH,{
        params: {startPoint: startPoint,
                 targetPoint: targetPoint
                },
    });
    console.log({members: projectMembers})
    return path.data;
}


export { getPath };