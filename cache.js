function LRU(){
    let cache={}

    function getkey(key){
        // if(!cache[key]) return -1
        return cache[key]
    }
     function addkey(key,v){
        if(cache[key]){
            cache[key]=v
        }
     }
     return {getkey,addkey}
}
let neL= LRU()
neL.addkey("1","hiii")
neL.getkey("1")
console.log("------",neL.getkey("1"))