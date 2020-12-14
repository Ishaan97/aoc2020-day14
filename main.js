const readFile = require('fs').readFileSync;

const INPUTS = []

readFile('input.txt', 'utf-8').split("\n").forEach(data => {
    INPUTS.push(data.trim());
})
function preLoad(){
    let operations = [];
    maskRegex = /mask = [X01]{36}/g;
    memRegex = /mem\[[0-9]+\] = [0-9]+/;

    let operation = [];
    for(let i =0; i<INPUTS.length; i++){
        let op = INPUTS[i];
        if(maskRegex.test(op)){
            operations.push(operation);

            operation = [];
            operation.push(op);
        }
        else{
            operation.push(op);
        }
    }
    operations.push(operation) // for last one
    operations = operations.slice(1, )
    return operations;
}

function preProcess(operations){
    // [
    //     { mask: '110010X0100101000110X0X100010XX11010' },
    //     { memoryAddress: 2212, memoryValue: 10472068 },
    //     { memoryAddress: 11369, memoryValue: 8019 },
    //     { memoryAddress: 527, memoryValue: 367177 },
    //     { memoryAddress: 41039, memoryValue: 804169 }
    //     ...
    //     ...
    // ]
    for(let i=0;i<operations.length;i++){
        let operation = operations[i];
        operation = operation.map(op => {
            op = op.split(" = ");
            if(op[0]==='mask'){
                return {mask : op[1]};
            }else{
                numRegex = /[0-9]+/;
                const found = op[0].match(numRegex);
                if(found){
                    return { memoryAddress: parseInt(found[0]), 
                        memoryValue : parseInt(op[1])
                    }
                }
            }
        });
        // console.log(operation)
        operations[i] = operation;

    }
    return operations;
}

let OPERATIONS = preLoad();
OPERATIONS = preProcess(OPERATIONS);

const BIT_LENGTH = 36

let MEMORY = new Map();


function convertDec2Bin(decimal){
    let bin = (+decimal).toString(2);
    if(bin.length<BIT_LENGTH){
        bin = bin.toString();
        let i = bin.length;
        while(i<BIT_LENGTH){
            bin = "0"+bin;
            i++;
        }
    }
    return bin;
}

function convertBin2Dec(binary){
    return parseInt(binary, 2);
}

function applyMaskToMemoryValue(mask, value){
    let result = "";
    for(let i =0;i<mask.length;i++){
        if(mask[i] === 'X'){
            result += value[i];
        }
        else{
            result += mask[i];
        }
    }
    return result;
}

function  part1(){
    MEMORY.clear();
    for(let operation of OPERATIONS){
        let mask = operation[0].mask;
        for(let i =1;i<operation.length;i++){
            let address = operation[i].memoryAddress;
            let decimal = operation[i].memoryValue;
            let binary = convertDec2Bin(decimal);
            let maskedBinary = applyMaskToMemoryValue(mask, binary);
            let newDecimal = convertBin2Dec(maskedBinary);
            // console.log(address, decimal, binary, maskedBinary, newDecimal)
            MEMORY.set(address, newDecimal);
        }
    }
    let memSum = 0;
    for(let value of MEMORY.values()){
        memSum += value;
    }
    console.log(memSum)

}
part1();

//  ************* PART 2 *************
function applyMaskToMemoryAddress(mask, address){
    let result = "";
    for(let i =0;i<mask.length;i++){
        if(mask[i]==='0'){
            result+=address[i]
        }
        else{
            result+=mask[i];
        }
    }
    return result;
}
function memoryDecoder(mask, memoryAddress){
    let binAddress = convertDec2Bin(memoryAddress);
    let maskedAddress = applyMaskToMemoryAddress(mask, binAddress);
    let addressSet = getAdresses(maskedAddress);
    let addressArray = []
    addressSet.forEach(address => {
        let decimal = convertBin2Dec(address);
        addressArray.push(decimal);
    })
    return addressArray;
    
}
function getAdresses(maskedAddress){
    const addressSet = new Set();
    return getAddressUtility(maskedAddress, addressSet);
}
function getAddressUtility(maskedAddress, addressSet){
    if(!maskedAddress.includes('X')){
        addressSet.add(maskedAddress);
    }else{
        for(let i =0;i<maskedAddress.length;i++){
            if(maskedAddress[i] === 'X'){
                let add = maskedAddress.substring(0, i)+"0"+maskedAddress.substring(i+1);
                getAddressUtility(add, addressSet);
                add = maskedAddress.substring(0, i)+"1"+maskedAddress.substring(i+1);
                getAddressUtility(add, addressSet);
                return addressSet;
            }
        } 
    }
}

function part2(){
    MEMORY.clear();
    for(let operation of OPERATIONS){
        let mask = operation[0].mask;
        for(let i =1;i<operation.length;i++){
            let address = operation[i].memoryAddress;
            let decimal = operation[i].memoryValue;
            let addressArray = memoryDecoder(mask, address);
            for(let add of addressArray){
                MEMORY.set(add, decimal);
            }
        }
    }
    let memSum = 0;
    for(let value of MEMORY.values()){
        memSum += value;
    }
    console.log(memSum)
}
part2()
