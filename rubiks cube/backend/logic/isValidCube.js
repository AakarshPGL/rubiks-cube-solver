export function isValidCubeString(str){
    if(str.length !== 54){return false;}
    const count={};
    for(const c of str){
        count[c]=(count[c] ||0)+1;
    }
    return(
        count.U === 9 &&
    count.R === 9 &&
    count.F === 9 &&
    count.D === 9 &&
    count.L === 9 &&
    count.B === 9
    );
}