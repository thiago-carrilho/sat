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
  let fs = require('fs')
  let text = fs.readFileSync(fileName, 'utf8') // = ...  //  an array containing lines of text extracted from the file. 
  //console.log(text);
  let clauses = readClauses(text)
  let variables = readVariables(clauses)
  // In the following line, text is passed as an argument so that the function.a
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
  return result
}

function readClauses(texto) {
  let separar = texto.split(/[\r\n]+/)
  for (let a = 0; a < separar.length; a++) {
    if (!separar[a].startsWith("p")) {
      if (separar[a].startsWith("c")) {
        separar.splice(a, 1);
        a--;
      } else if (separar[a].endsWith("0")) {
        separar[a] = separar[a].replace(' 0', '');
      } else if (!(separar[a].endsWith("0"))) {
        separar[a] = separar[a] + " " + separar[a + 1]
        separar.splice(a + 1, 1)
        a--;
      }
    }
  }
  let resultado = []
  for (const [id, linhas] of separar.entries()) {
    resultado[id] = linhas.split(/\s+/);
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
    let compararVariaveisTemp = [] //variavel temp
    for (let a = 0, comp = 0; a < clauses.length; a++) { //guardar as variaveis em compararVariaveisTemp
      for (let b = 0; b < clauses[a].length; b++) {
        compararVariaveisTemp[comp] = clauses[a][b]
        comp++
      }
    }
    for (let a = 0; a < compararVariaveisTemp.length; a++) { //transformar todos os valores em positivo
      compararVariaveisTemp[a] = Math.abs(compararVariaveisTemp[a])
    }
    let compararVariaveis = [...new Set(compararVariaveisTemp)] //salvar apenas os elementos unicos de Temp em compararVariaveis
    compararVariaveis.sort((a, b) => a - b) //colocar em sequencia
    if (compararVariaveis.length != quantVariables) { //verificar se não tem variavel a menos ou a mais
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
    contarVdd = 0
    for (const valores of assignment) { //must check whether this is the last assignment or not
      if (valores) contarVdd++;
    }
    let temp = []
    for (const [id, linha] of clauses.entries()) {
      for (const variavel of linha) {
        if (variavel < 0) temp[id] = !assignment[Math.abs(variavel) - 1]
        else temp[id] = assignment[variavel - 1]
        if (temp[id] === true) break;
      }
    }
    let final = false;
    final = !temp.includes(false)// does this assignment satisfy the formula? If so, make isSat true. 
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