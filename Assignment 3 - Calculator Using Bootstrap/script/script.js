let input = document.getElementById('calc-input');
let currentInput = '';
let storedValue = '';
let operation = '';

// Update the display function
function updateDisplay(value) {
    input.value = value;
}

// Handle button inputs
function handleInput(value) {
    if (!isNaN(value) || value === '.') {
        // Append numbers or decimal point
        currentInput += value;
        updateDisplay(currentInput);
    } else {
        // Handle mathematical operations and special functions
        switch (value) {
            case '←':
                currentInput = currentInput.slice(0, -1);
                updateDisplay(currentInput);
                break;
            case '±':
                currentInput = currentInput ? (parseFloat(currentInput) * -1).toString() : '';
                updateDisplay(currentInput);
                break;
            case '√':
                currentInput = currentInput ? Math.sqrt(parseFloat(currentInput)).toString() : '';
                updateDisplay(currentInput);
                break;
            case '1/x':
                currentInput = currentInput ? (1 / parseFloat(currentInput)).toString() : '';
                updateDisplay(currentInput);
                break;
            case '%':
                currentInput = currentInput ? (parseFloat(currentInput) / 100).toString() : '';
                updateDisplay(currentInput);
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                if (currentInput) {
                    if (storedValue && operation) {
                        calculate();
                    }
                    storedValue = currentInput;
                    operation = value;
                    currentInput = '';
                }
                break;
            case 'MC':
            case 'MR':
            case 'MS':
            case 'M+':
            case 'M-':
                // Handle memory functions as needed
                break;
        }
    }
}

// Clear the current input
function clearEntry() {
    currentInput = '';
    updateDisplay(currentInput);
}

// Clear all inputs and operations
function clearAll() {
    currentInput = '';
    storedValue = '';
    operation = '';
    updateDisplay(currentInput);
}

// Perform the calculation based on stored value and current input
function calculate() {
    if (storedValue && currentInput && operation) {
        let result;
        switch (operation) {
            case '+':
                result = parseFloat(storedValue) + parseFloat(currentInput);
                break;
            case '-':
                result = parseFloat(storedValue) - parseFloat(currentInput);
                break;
            case '*':
                result = parseFloat(storedValue) * parseFloat(currentInput);
                break;
            case '/':
                result = parseFloat(storedValue) / parseFloat(currentInput);
                break;
        }
        currentInput = result.toString();
        storedValue = '';
        operation = '';
        updateDisplay(currentInput);
    }
}
