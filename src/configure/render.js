const arrify = require('arrify');




function renderParts(mod, features) {
  var parts = {};

  function addPart(part) {
    
    if (!parts.hasOwnProperty(part.part))
      parts[part.part] = [];
    parts[part.part].push(part.src);
  }

  arrify(features).forEach((feat) => {
    if (!feat.hasOwnProperty('render')) return;
    addPart(feat.render(mod));
  });

  Object.keys(parts).forEach((key) => {
    parts[key] = parts[key].join('\n\n');
  });

  return parts;
}

module.exports.renderParts = renderParts;
