import { solveCube } from "../logic/cubeSolver.js";
import { formatSolution } from "../logic/formatSolution.js";

import {imageToCube} from "../logic/imageToCube.js";
import { isValidCubeString } from "../logic/isValidCube.js";


export  function solveCubeAPI(req,res){
    
    const images=req.files;

    const cubeData = imageToCube(images);
    
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

