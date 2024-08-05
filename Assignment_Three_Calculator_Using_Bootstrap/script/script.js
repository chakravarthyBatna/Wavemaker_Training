const inputBoxDisplay = document.getElementById('inputBox');
let memory = 0; 

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
    memory = 0;
    inputBoxDisplay.value = '';
}

function memoryRecall() {
    inputBoxDisplay.value = memory.toString();
}

function memoryStore() {
    memory = parseFloat(inputBoxDisplay.value) || 0;
    inputBoxDisplay.value = '';
}

function memoryPlus() {
    memory += parseFloat(inputBoxDisplay.value) || 0;
}

function memoryMinus() {
    memory -= parseFloat(inputBoxDisplay.value) || 0;
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
