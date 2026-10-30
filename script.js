const currentDisplay = document.querySelector("#current");
const historyDisplay = document.querySelector("#history");

const MAX_DIGITS = 12;
const DIVIDE_BY_ZERO_MESSAGE = "Can't divide by 0";

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let displayValue = "0";
let firstOperand = null;
let operator = null;
let resetDisplay = false; // the next digit starts a new number
let hasError = false;

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

function operate(op, a, b) {
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
  }
}

function formatResult(number) {
  // toPrecision gets rid of things like 0.1 + 0.2 = 0.30000000000000004
  let text = String(Number(number.toPrecision(10)));

  if (text.length > MAX_DIGITS) {
    text = number.toExponential(4);
  }

  return text;
}

function updateDisplay() {
  currentDisplay.textContent = displayValue;

  if (operator !== null) {
    historyDisplay.textContent = `${formatResult(firstOperand)} ${SYMBOLS[operator]}`;
  } else {
    historyDisplay.textContent = "";
  }
}

function showDivideByZero() {
  clearAll();
  displayValue = DIVIDE_BY_ZERO_MESSAGE;
  hasError = true;
}

function clearAll() {
  displayValue = "0";
  firstOperand = null;
  operator = null;
  resetDisplay = false;
  hasError = false;
}

function inputDigit(digit) {
  if (hasError) {
    clearAll();
  }

  if (resetDisplay || displayValue === "0") {
    displayValue = digit;
    resetDisplay = false;
  } else if (displayValue.replace(/[-.]/g, "").length < MAX_DIGITS) {
    displayValue += digit;
  }

  updateDisplay();
}

function inputDecimal() {
  if (hasError) {
    clearAll();
  }

  if (resetDisplay) {
    displayValue = "0.";
    resetDisplay = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }

  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (hasError) {
    return;
  }

  // a second operator in a row just replaces the first one
  if (operator !== null && resetDisplay) {
    operator = nextOperator;
    updateDisplay();
    return;
  }

  const currentNumber = Number(displayValue);

  if (operator === null) {
    firstOperand = currentNumber;
  } else {
    // chained operation: work out the pair we have so far
    if (operator === "/" && currentNumber === 0) {
      showDivideByZero();
      updateDisplay();
      return;
    }

    firstOperand = operate(operator, firstOperand, currentNumber);
    displayValue = formatResult(firstOperand);
  }

  operator = nextOperator;
  resetDisplay = true;
  updateDisplay();
}

function equals() {
  // nothing to do without an operator and a second number
  if (hasError || operator === null || resetDisplay) {
    return;
  }

  const currentNumber = Number(displayValue);

  if (operator === "/" && currentNumber === 0) {
    showDivideByZero();
    updateDisplay();
    return;
  }

  const result = operate(operator, firstOperand, currentNumber);
  displayValue = formatResult(result);
  firstOperand = null;
  operator = null;
  resetDisplay = true;
  updateDisplay();
}

function backspace() {
  if (hasError || resetDisplay) {
    return;
  }

  displayValue = displayValue.slice(0, -1);

  if (displayValue === "" || displayValue === "-") {
    displayValue = "0";
  }

  updateDisplay();
}

function clearEverything() {
  clearAll();
  updateDisplay();
}

document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => inputDigit(button.dataset.digit));
});

document.querySelectorAll("[data-operator]").forEach((button) => {
  button.addEventListener("click", () => chooseOperator(button.dataset.operator));
});

document.querySelector("[data-action='equals']").addEventListener("click", equals);
document.querySelector("[data-action='decimal']").addEventListener("click", inputDecimal);
document.querySelector("[data-action='backspace']").addEventListener("click", backspace);
document.querySelector("[data-action='clear']").addEventListener("click", clearEverything);

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if ("+-*/".includes(key)) {
    event.preventDefault(); // "/" opens quick find in some browsers
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    clearEverything();
  }
});

updateDisplay();
