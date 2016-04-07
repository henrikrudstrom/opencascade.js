const arrify = require('arrify');




// function renderParts(mod, features) {
//   var parts = {};

//   function addPart(part) {
    
//     if (!parts.hasOwnProperty(part.part))
//       parts[part.part] = [];
//     parts[part.part].push(part.src);
//   }

//   arrify(features).forEach((feat) => {
//     if (!feat.hasOwnProperty('render')) return;
//     addPart(feat.render(mod));
//   });

//   Object.keys(parts).forEach((key) => {
//     parts[key] = parts[key].join('\n\n');
//   });

//   return parts;
// }

function renderFeatures(decl, features){
  return features
    .filter((feat) => feat.hasOwnProperty('renderSwig'))
    .map((feat) => arrify(feat.renderSwig(decl)))
    .reduce((a, b) => a.concat(b))
    .filter((src) => src)
}



function renderParts(mod, features){
  features = arrify(features)
  
  var parts = {}
  function addParts(list) {
    //if(!parts) return;
    console.log("ADD", list)
    list = arrify(list);
    list.forEach((part) => {
      if (!parts.hasOwnProperty(part.name))
        parts[part.name] = [];
      parts[part.name].push(part.src);  
    });
    
  }
  function collectParts(decl, parent){
    //console.log("collect", decl.name, decl.cls);
    addParts(renderFeatures(decl, features));
    if(decl.declarations)
      decl.declarations.forEach((d) => collectParts(d, decl));
  }
  
  collectParts(mod);
  //console.log("PARTS", parts)
  return parts;
}




module.exports.renderParts = renderParts;
