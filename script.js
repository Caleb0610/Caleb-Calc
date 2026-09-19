const expressionEl = document.getElementById("expression");
    const resultEl = document.getElementById("result");

    let currentValue = "0";
    let previousValue = null;
    let operator = null;
    let waitingForOperand = false;
    let expression = "";

    function updateDisplay() {
      resultEl.textContent = currentValue;
      expressionEl.textContent = expression;
    }

    function formatNumber(number) {
      if (!Number.isFinite(number)) {
        return "Error";
      }

      // Avoid unnecessarily long floating-point results.
      const rounded = Number.parseFloat(number.toPrecision(12));
      return String(rounded);
    }

    function calculate(a, b, op) {
      const first = Number(a);
      const second = Number(b);

      switch (op) {
        case "+":
          return first + second;
        case "-":
          return first - second;
        case "×":
          return first * second;
        case "÷":
          return second === 0 ? NaN : first / second;
        default:
          return second;
      }
    }

    function inputNumber(number) {
      if (currentValue === "Error") {
        clearCalculator();
      }

      if (waitingForOperand) {
        currentValue = number;
        waitingForOperand = false;
      } else {
        currentValue =
          currentValue === "0" ? number : currentValue + number;
      }

      updateDisplay();
    }

    function inputDecimal() {
      if (currentValue === "Error") {
        clearCalculator();
      }

      if (waitingForOperand) {
        currentValue = "0.";
        waitingForOperand = false;
      } else if (!currentValue.includes(".")) {
        currentValue += ".";
      }

      updateDisplay();
    }

    function inputOperator(nextOperator) {
      if (currentValue === "Error") {
        return;
      }

      const inputValue = Number(currentValue);

      if (operator && waitingForOperand) {
        // Replace the operator if the user presses another operator.
        operator = nextOperator;
        expression = `${previousValue} ${operator}`;
        updateDisplay();
        return;
      }

      if (previousValue === null) {
        previousValue = inputValue;
      } else if (operator) {
        const result = calculate(previousValue, inputValue, operator);

        if (!Number.isFinite(result)) {
          currentValue = "Error";
          expression = "Cannot divide by zero";
          previousValue = null;
          operator = null;
          waitingForOperand = true;
          updateDisplay();
          return;
        }

        currentValue = formatNumber(result);
        previousValue = result;
      }

      operator = nextOperator;
      waitingForOperand = true;
      expression = `${currentValue} ${operator}`;

      updateDisplay();
    }

    function performCalculation() {
      if (
        operator === null ||
        previousValue === null ||
        currentValue === "Error"
      ) {
        return;
      }

      const firstValue = previousValue;
      const secondValue = Number(currentValue);
      const currentOperator = operator;

      const result = calculate(
        firstValue,
        secondValue,
        currentOperator
      );

      expression =
        `${formatNumber(firstValue)} ${currentOperator} ` +
        `${formatNumber(secondValue)} =`;

      if (!Number.isFinite(result)) {
        currentValue = "Error";
      } else {
        currentValue = formatNumber(result);
      }

      previousValue = null;
      operator = null;
      waitingForOperand = true;

      updateDisplay();
    }

    function deleteLast() {
      if (currentValue === "Error") {
        clearCalculator();
        return;
      }

      if (waitingForOperand) {
        return;
      }

      if (currentValue.length <= 1) {
        currentValue = "0";
      } else {
        currentValue = currentValue.slice(0, -1);

        if (currentValue === "-" || currentValue === "") {
          currentValue = "0";
        }
      }

      updateDisplay();
    }

    function clearCalculator() {
      currentValue = "0";
      previousValue = null;
      operator = null;
      waitingForOperand = false;
      expression = "";
      updateDisplay();
    }

    document.querySelector(".buttons").addEventListener("click", (event) => {
      const button = event.target.closest("button");

      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const value = button.dataset.value;

      switch (action) {
        case "number":
          inputNumber(value);
          break;

        case "decimal":
          inputDecimal();
          break;

        case "operator":
          inputOperator(value);
          break;

        case "equals":
          performCalculation();
          break;

        case "clear":
          clearCalculator();
          break;

        case "delete":
          deleteLast();
          break;
      }
    });

    // Optional keyboard support.
    document.addEventListener("keydown", (event) => {
      const key = event.key;

      if (/^[0-9]$/.test(key)) {
        inputNumber(key);
        return;
      }

      if (key === ".") {
        inputDecimal();
        return;
      }

      if (["+", "-", "*", "/"].includes(key)) {
        const operators = {
          "+": "+",
          "-": "-",
          "*": "×",
          "/": "÷"
        };

        inputOperator(operators[key]);
        return;
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        performCalculation();
        return;
      }

      if (key === "Backspace") {
        deleteLast();
        return;
      }

      if (key === "Escape" || key.toLowerCase() === "c") {
        clearCalculator();
      }
    });

    updateDisplay();