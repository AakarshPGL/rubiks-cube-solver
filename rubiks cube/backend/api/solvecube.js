import { solveCube } from "../logic/cubeSolver.js";
import { formatSolution } from "../logic/formatSolution.js";

import {imageToCube} from "../logic/imageToCube.js";
import { isValidCubeString } from "../logic/isValidCube.js";


export  async function solveCubeAPI(req,res){

    const images=req.files;

    let cubeData;
    try{
        cubeData = await imageToCube(images);
    }catch(err){
        res.json({
            error: err.message || "Could not read the cube from the uploaded images. Please upload clear images."
        });
        return;
    }

    if(!isValidCubeString(cubeData)){
        res.json({
            error:"Invalid cube configuration.Please upload clear images."
        });
        return;
    }

    const rawSolution= solveCube(cubeData);
    
    
    const formattedSolution=formatSolution(rawSolution);
    
    res.json({
        solution:formattedSolution
    })
   
}
