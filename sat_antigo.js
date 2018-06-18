/**
 * This file should be placed at the node_modules sub-directory of the directory where you're 
 * executing it.
 * 
 * Written by Fernando Castor in November/2017. 
 */
exports.solve = function (fileName) {
  let formula = readFormula(fileName)
  let result = doSolve(formula.clauses, formula.variables)
  return result // two fields: isSat and satisfyingAssignment
}
var entrada = process.argv[2]
console.log(exports.solve(entrada))

function readFormula(fileName) {
  // To read the file, it is possible to use the 'fs' module. 
  // Use function readFileSync and not readFile. 
  // First read the lines of text of the file and only afterward use the auxiliary functions.
  //
  let fs = require('fs')
  let text = fs.readFileSync(fileName, 'utf8') // = ...  //  an array containing lines of text extracted from the file. 
  //console.log(text);
  let clauses = readClauses(text)
  let variables = readVariables(clauses)
  // In the following line, text is passed as an argument so that the function
  // is able to extract the problem specification.
  let specOk = checkProblemSpecification(text, clauses, variables)
  let result = {
    'clauses': [],
    'variables': []
  }
  if (specOk) {
    result.clauses = clauses
    result.variables = variables
  }
  //console.log("SpecOk "+specOk);
  return result
}

function readClauses(texto) {
  let separar = texto.split(/[\r\n]+/)
  for (let a = 0; a < separar.length; a++) {
    if (!separar[a].startsWith("p")) {
      if (separar[a].startsWith("c")) {
        separar.splice(a, 1);
        a = a - 1;
      } else if (separar[a].endsWith("0")) {
        separar[a] = separar[a].replace(' 0', '');
      } else if (!(separar[a].endsWith("0"))) {
        separar[a] = separar[a] + " " + separar[a + 1]
        separar.splice(a + 1, 1)
        a--
      }
    }
  }
  let resultado = []
  for (let a = 0; a < separar.length; a++) {
    resultado[a] = separar[a].split(' ');
  }
  return resultado;
}

function readVariables(text) {
  let quantVariables = text[0][2]
  let valorInicial = []
  for (let a = 0; a < quantVariables; a++) {
    valorInicial[a] = false;
  }
  return valorInicial;
}

function checkProblemSpecification(text, clauses, variables) {
  let quantVariables = clauses[0][2]
  let quantClauses = clauses[0][3]
  clauses.shift()
  if (quantClauses != clauses.length) { //verificar se tem mais clausulas que o usuario entrou
    return false;
  } else {
    let compararVariaveisTemp = []
    let teste = 0
    for (let a = 0; a < clauses.length; a++) {
      for (let b = 0; b < clauses[a].length; b++) {
        compararVariaveisTemp[teste] = clauses[a][b]
        teste++
      }
    }
    for (let a = 0; a < compararVariaveisTemp.length; a++) {
      compararVariaveisTemp[a] = Math.abs(compararVariaveisTemp[a])
    }
    let compararVariaveis = [...new Set(compararVariaveisTemp)]
    compararVariaveis.sort((a, b) => a - b)
    if (compararVariaveis.length != quantVariables) {
      return false;
    } else if (compararVariaveis[compararVariaveis.length - 1] > quantVariables) { //verificar se não tem nenhum maior que o valor que o usuario pediu no cnf
      return false;
    } else {
      for (let a = 0; a < compararVariaveis.length; a++) { //verificar se tem todas as variaveis sequencialmente
        if (compararVariaveis[a] > 0) {
          if (a == compararVariaveis.length - 1) return true;
          else {
            let verificar = compararVariaveis[a] - compararVariaveis[a + 1]
            if (verificar != 0 && verificar != -1) return false;
          }
        }
      }
    }
  }
}

function doSolve(clauses, assignment) {
  let isSat = false
  let contarVdd = 0
  while ((!isSat) && contarVdd != assignment.length) {
    //for(let teste=0;teste<1;teste++){
    contarVdd = 0
    for (const valores of assignment) { //must check whether this is the last assignment or not
      if (valores) contarVdd++;
    }
    //let valor=0
    let temp = []
    for (let a = 0; a <= (clauses.length - 1); a++) { //loopa pelas clausulas
      for (let b = 0; b < clauses[a].length; b++) { //loopa pelas variaveis
        if (clauses[a][b] < 0) {
          if (temp[a] === undefined) {
            temp[a] = (!assignment[Math.abs(clauses[a][b]) - 1]);
          } else {
            temp[a] = temp[a] || !(assignment[Math.abs(clauses[a][b]) - 1]);
          }
        } else {
          if (temp[a] === undefined) {
            temp[a] = assignment[clauses[a][b] - 1]
          } else {
            temp[a] = temp[a] || assignment[clauses[a][b] - 1]
          }
        }
      }
    }
    //console.log(" ");
    // does this assignment satisfy the formula? If so, make isSat true. 
    let final = ''
    for (const elementos of temp) {
      if (final === '') {
        final = elementos;
      } else {
        final = final && elementos;
      }
    }
    if (final) {
      isSat = true;
    } else {
      assignment = nextAssignment(assignment)
    }
  }
  let result = {
    'isSat': isSat,
    satisfyingAssignment: null
  }
  if (isSat) {
    result.satisfyingAssignment = assignment
  }
  return result
}
// Receives the current assignment and produces the next one
function nextAssignment(currentAssignment) {
  for (let [posicao, valores] of currentAssignment.entries()) {
    if (valores) {
      currentAssignment[posicao] = false
    } else {
      currentAssignment[posicao] = true
      break; //change only one element to true
    }
  }
  return currentAssignment
}