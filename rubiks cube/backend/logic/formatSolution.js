export function formatSolution(rawSolution){
    if (rawSolution.length === 0) {
        return ["Cube is already solved"];
    }

    return rawSolution.map((move,index)=>{
        const faceMap={
            "R":"Right",
            "U":"Up",
            "L":"Left",
            "F":"Front",
            "B":"Back",
            "D":"Down",
        };
        const face=move[0];
        const direction=move.slice(1);
        let action="";
        if(direction===""){
            action="clockwise";
        }else if(direction==="2"){
            action="clockwise for twice";
        }else if(direction==="'"){
            action=" counterclockwise";
        }
        return `step ${index+1}: Turn ${faceMap[face]} face ${action}`;
    }); 
}
