function intersect(a, b){
  return a.filter(function(n) {
    return b.indexOf(n) != -1;
  });
}

function MapArray(arr){
  //Find properties
  if(arr.length < 1) return;
  var getProps = (obj) => Object.keys(obj)
      .filter((k) => obj.hasOwnProperty(k))
      .concat(Object.keys(obj.constructor.prototype)
      .filter((k) => obj.constructor.prototype.hasOwnProperty(k)))
  
  var getFunctions = (obj) => {
    return getProps(obj)
      .filter((k) => typeof obj[k] === 'function');
  }
  var getVariables = (obj) => {
    return getProps(obj)
      .filter((k) => typeof obj[k] !== 'function');
  }
  
  //find common properties for whole array
  var functions = null;
  var variables = null;
  arr.forEach((obj) => {
    //console.log('proto', obj.constructor.prototype);
    //console.log(getFunctions(obj))
    if(functions === null)
      functions = getFunctions(obj);
    else 
      functions = intersect(functions, getFunctions(obj));
    
    if(variables === null)
      variables = getVariables(obj);
    else 
      variables = intersect(variables, getVariables(obj));
    this.push(obj);
  });

  //create mapping functions
  functions.forEach((p) =>
    this[p] = (a1, a2, a3, a4, a5, a6) =>
      this.map((v) => v[p](a1, a2, a3, a4, a5, a6))
  );
  variables.forEach((p) => 
    this[p] = () => this.map((v) => v[p])
  );
}
MapArray.prototype = new Array();
module.exports = MapArray;