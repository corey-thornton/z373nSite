function ORGate(first,second){   
    let total = first + second
    let b = 1
    if(total >= b){
        return 1
    }
    else{
        return 0
    }
}
function normalize(value){
    if(value < 0){
        return 0
    }
    else{
        return value
    }
}
function firstLayer(){
    let input1 = 1
    let input2 = 1
    let node1 = 0
    let node2 = 0

    node1 = normalize(node1 + input1 - input2)
    node2 = normalize(node2 + input2 - input1)
    return ORGate(node1,node2)
}
console.log(firstLayer())