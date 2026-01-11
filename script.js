const currentDisplay = document.getElementById('current');
const previousDisplay = document.getElementById('previous');
const buttons = document.querySelectorAll('.btn');

let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetCurrent = false;

function updateDisplay() {
    currentDisplay.textContent = currentValue;
    currentDisplay.classList.remove('error');

    if (operator && previousValue) {
        const operatorSymbol = getOperatorSymbol(operator);
        previousDisplay.textContent = previousValue + ' ' + operatorSymbol;
    } else {
        previousDisplay.textContent = '';
    }
}

function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };
    return symbols[op] || op;
}

function inputNumber(num) {
    if (currentValue === 'Error') {
        currentValue = num;
        shouldResetCurrent = false;
        updateDisplay();
        return;
    }

    if (shouldResetCurrent) {
        currentValue = num;
        shouldResetCurrent = false;
    } else {
        if (currentValue === '0' && num !== '.') {
            currentValue = num;
        } else {
            if (currentValue.length < 15) {
                currentValue += num;
            }
        }
    }
    updateDisplay();
}

function inputDecimal() {
    if (shouldResetCurrent) {
        currentValue = '0.';
        shouldResetCurrent = false;
        updateDisplay();
        return;
    }

    if (!currentValue.includes('.')) {
        currentValue += '.';
        updateDisplay();
    }
}

function inputOperator(op) {
    if (currentValue === 'Error') return;

    clearActiveOperator();

    if (operator && !shouldResetCurrent) {
        calculate();
    }

    previousValue = currentValue;
    operator = op;
    shouldResetCurrent = true;

    highlightOperator(op);
    updateDisplay();
}

function highlightOperator(op) {
    buttons.forEach(function (btn) {
        if (btn.dataset.value === op && btn.classList.contains('operator')) {
            btn.classList.add('active');
        }
    });
}

function clearActiveOperator() {
    buttons.forEach(function (btn) {
        btn.classList.remove('active');
    });
}

function calculate() {
    if (!operator || !previousValue) return;

    clearActiveOperator();

    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    if (isNaN(prev) || isNaN(current)) {
        showError();
        return;
    }

    let result;

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                showError();
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    if (!isFinite(result)) {
        showError();
        return;
    }

    result = Math.round(result * 1000000000000) / 1000000000000;

    currentValue = result.toString();

    if (currentValue.length > 15) {
        currentValue = parseFloat(currentValue).toExponential(5);
    }

    previousValue = '';
    operator = null;
    shouldResetCurrent = true;

    updateDisplay();
}

function showError() {
    currentValue = 'Error';
    previousValue = '';
    operator = null;
    shouldResetCurrent = true;
    currentDisplay.textContent = 'Error';
    currentDisplay.classList.add('error');
    previousDisplay.textContent = '';
    clearActiveOperator();
}

function clearAll() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetCurrent = false;
    clearActiveOperator();
    updateDisplay();
}

function deleteChar() {
    if (currentValue === 'Error') {
        clearAll();
        return;
    }

    if (shouldResetCurrent) {
        currentValue = '0';
        shouldResetCurrent = false;
    } else {
        currentValue = currentValue.slice(0, -1);
        if (currentValue === '' || currentValue === '-') {
            currentValue = '0';
        }
    }
    updateDisplay();
}

function inputPercent() {
    if (currentValue === 'Error') return;

    const current = parseFloat(currentValue);
    if (isNaN(current)) return;

    currentValue = (current / 100).toString();
    updateDisplay();
}

function negateValue() {
    if (currentValue === 'Error' || currentValue === '0') return;

    if (currentValue.startsWith('-')) {
        currentValue = currentValue.slice(1);
    } else {
        currentValue = '-' + currentValue;
    }
    updateDisplay();
}

buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        const action = this.dataset.action;
        const value = this.dataset.value;

        switch (action) {
            case 'number':
                inputNumber(value);
                break;
            case 'operator':
                inputOperator(value);
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'equals':
                calculate();
                break;
            case 'clear':
                clearAll();
                break;
            case 'delete':
                deleteChar();
                break;
            case 'percent':
                inputPercent();
                break;
            case 'negate':
                negateValue();
                break;
        }
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
    } else if (e.key === '.') {
        inputDecimal();
    } else if (e.key === '+') {
        inputOperator('+');
    } else if (e.key === '-') {
        inputOperator('-');
    } else if (e.key === '*') {
        inputOperator('*');
    } else if (e.key === '/') {
        e.preventDefault();
        inputOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        deleteChar();
    } else if (e.key === 'Escape') {
        clearAll();
    } else if (e.key === '%') {
        inputPercent();
    }
});

updateDisplay();