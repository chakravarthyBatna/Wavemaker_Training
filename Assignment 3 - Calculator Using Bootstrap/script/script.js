let calcInput = document.getElementById('calc-input');
let currentInput = '';
let memory = 0;

function handleInput(value) {
    switch (value) {
        case '←':
            currentInput = currentInput.slice(0, -1);
            break;
        case '±':
            if (currentInput.startsWith('-')) {
                currentInput = currentInput.slice(1);
            } else {
                currentInput = '-' + currentInput;
            }
            break;
        case '√':
            currentInput = Math.sqrt(parseFloat(currentInput)).toString();
            break;
        case '1/x':
            currentInput = (1 / parseFloat(currentInput)).toString();
            break;
        default:
            currentInput += value;
    }
    calcInput.value = currentInput;
}

function clearEntry() {
    currentInput = '';
    calcInput.value = '';
}

function clearAll() {
    currentInput = '';
    calcInput.value = '';
    memory = 0;
}

function calculate() {
    try {
        currentInput = eval(currentInput).toString();
    } catch (error) {
        currentInput = 'Error';
    }
    calcInput.value = currentInput;
}


function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    currentInput += memory.toString();
    calcInput.value = currentInput;
}

function memoryStore() {
    memory = parseFloat(currentInput);
    currentInput = '';
    calcInput.value = '';
}

function memoryAdd() {
    memory += parseFloat(currentInput);
    currentInput = '';
    calcInput.value = '';
}

function memorySubtract() {
    memory -= parseFloat(currentInput);
    currentInput = '';
    calcInput.value = '';
}


document.querySelectorAll('.calc-btn').forEach(btn => {
    switch (btn.innerText) {
        case 'MC':
            btn.onclick = memoryClear;
            break;
        case 'MR':
            btn.onclick = memoryRecall;
            break;
        case 'MS':
            btn.onclick = memoryStore;
            break;
        case 'M+':
            btn.onclick = memoryAdd;
            break;
        case 'M-':
            btn.onclick = memorySubtract;
            break;
    }
});
