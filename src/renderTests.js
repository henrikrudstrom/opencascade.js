

var variables = {}
function getVariable(type){

}
function registerVariable(type){

}


function renderTest(calldef) {
  var src = `it('can call ${calldef.name}', function(){
    ${arguments}
    var res = ${isNew} ${renderCall(calldef, argNames)};
  });`
}

function renderClass(cls){
  var specs = cls.constructors.map(renderTest).join('\n').replace('\n', '\n  ')

  var src = `describe('${cls.name}', function(){
    ${specs}
  });`
}


function arg


function constructor(cons){


}
