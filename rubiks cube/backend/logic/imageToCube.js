// function ML(image, faceLetter){
//     const color="red";
//     return Array(9).fill(U);  /* dummy input till we finish the ml function*/
// }
// function tellAlphabet(color){
//     if (color === "white") return "U";
//     if (color === "red")   return "R";
//     if (color === "green") return "F";
//     if (color === "yellow")return "D";
//     if (color === "orange")return "L";
//     if (color === "blue")  return "B";
// }
// export function imageToCube(images){
//   const ans=[];
//   const faceOrder=["Up","Right","Front","Down","Left","Back"];
//   faceOrder.forEach(face=>{
//     const faceColors=ML(images[face]);
//     ans.push(...faceColors);
//   });
//   return ans.join();
// } 
export function imageToCube(images){
    return "DRLUUBFBRBLURRLRUBLRDDFDLFUFUFFDBRDUBRUFLLFDDBFLUBLRBD";
}