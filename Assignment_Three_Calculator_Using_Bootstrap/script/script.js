const inputBoxDisplay = document.getElementById('inputBox');

function handleInput(value) {
    const lastChar = inputBoxDisplay.value.slice(-1);
    if (inputBoxDisplay.value === '0' || inputBoxDisplay.value === 'Invalid') {
        inputBoxDisplay.value = value;
    } else if (['+', '-', '*', '/', '%'].includes(lastChar) && ['+', '-', '*', '/', '%'].includes(value)) {
        inputBoxDisplay.value = inputBoxDisplay.value.slice(0, -1) + value;
    } else {
        inputBoxDisplay.value += value;
    }
}

function clearAll() {
    inputBoxDisplay.value = '';
}

function clearEntry() {
    inputBoxDisplay.value = inputBoxDisplay.value.slice(0, -1);
}

function clearMemory() {
    localStorage.removeItem('memory');
    inputBoxDisplay.value = '';
}

function memoryRecall() {
    const memory = localStorage.getItem('memory');
    if (memory) {
        inputBoxDisplay.value = memory;
    }
}

function memoryStore() {
    localStorage.setItem('memory', inputBoxDisplay.value);
    inputBoxDisplay.value = '';
}

function memoryPlus() {
    const memory = parseFloat(localStorage.getItem('memory')) || 0;
    const display = parseFloat(inputBoxDisplay.value) || 0;
    localStorage.setItem('memory', memory + display);
}

function memoryMinus() {
    const memory = parseFloat(localStorage.getItem('memory')) || 0;
    const display = parseFloat(inputBoxDisplay.value) || 0;
    localStorage.setItem('memory', memory - display);
}

function calculate() {
    try {
        let expression = inputBoxDisplay.value.replace(/√/g, 'Math.sqrt');
        expression = expression.replace(/Math.sqrt([0-9.]+)/g, 'Math.sqrt($1)');
        if (/[+\-*/%]$/.test(expression)) {
            throw new Error('Invalid');
        }
        inputBoxDisplay.value = eval(expression);
    } catch (e) {
        inputBoxDisplay.value = 'Invalid';
    }
}
