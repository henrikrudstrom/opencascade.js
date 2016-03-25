
function query(data){


  this.select(q){
      if(typeof q === "string")
        q = bySig(q)
      // if (fn === undefined) fn = function(f) {
      //   return f
      // };
      for(var i in data.classes){
        cls = data.classes[i]
        if (q(cls)){
          console.log("found")
          yield cls
        }
      }
  }
}




function bySig(name){
  return function(c){
    return c.name == name

  };
}

function* select(q) {
  if(typeof q === "string")
    q = bySig(q)
  // if (fn === undefined) fn = function(f) {
  //   return f
  // };
  for(var i in data.classes){
    cls = data.classes[i]
    if (q(cls)){
      console.log("found")
      yield cls
    }
  }

}


function mark(value){
  return function(obj){ obj.marked = value };
}
// function rename(q, expr){
//   select(q).forEach(function(obj){
//
//     name = expr
//     if(typeof name === "function")
//       name = expr(obj.name)
//     console.log("name", name)
//     if (!obj.$rename)
//       obj.$rename = {
//         oldName: obj.name
//       }
//     obj.name = name;
//   });
// }
//
//
// rename("gp_Pnt", "Point")
// rename(function(obj){
//   return obj.cls !== "calldef";
// }, camelCase);
//

// var camel = function(member) {
//   var name = camelCase(member.name)
//
//   if (name !== member.name) {
//     if (!member.$rename)
//       member.$rename = {
//         oldName: member.name
//       }
//     member.name = name;
//   }
// }
//
// data.classes.forEach(function(cls) {
//
//   cls.members.forEach(function(m) {
//     camel(m)
//   });
// });
var sel = select("gp_Pnt")
console.log("Hmm")
for(var i=0; i < sel.length; i++){

  console.log(sel.next())
}
