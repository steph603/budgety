//                                                  *********** BUDGET CONTROLLER ***************
//

var budgetController = (function () {
    var Expense = function (id, desc, value) {
        this.id = id
        this.desc = desc
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }

    var Income = function (id, desc, value) {
        this.id = id
        this.desc = desc
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0

        data.allItems[type].forEach(function (curr) {
            sum += curr.value
        })
        data.totals[type] = sum
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }

            // Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Push it into data structure
            data.allItems[type].push(newItem)

            // Return the new element
            return newItem
        },

        deleteItem: function (type, id) {
            var ids, index

            console.log(data)
            console.log(type)

            ids = data.allItems[type].map(function (current) {
                return current.id
            })

            index = ids.indexOf(id)

            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function () {
            // Calculate total income and expenses

            calculateTotal('exp')
            calculateTotal('inc')

            // Calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp

            // Calculate the percentage of income spent

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (currentExp) {
                currentExp.calcPercentage(data.totals.inc)
            })
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (currentExp) {
                return currentExp.getPercentage()
            })
            return allPerc
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data)
        }
    }
})()

//
//
//
//
//
//
//                                              ******************** UI CONTROLLER *********************

var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercentage: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        month: '.budget__title--month'
    }

    var formatNumber = function (number, type) {
        var numberSplit, integer, decimal

        // + or - before the number
        // exactly 2 decimal points
        // apostrophe separating thousands

        number = Math.abs(number)
        number = number.toFixed(2)
        numberSplit = number.split('.')
        integer = numberSplit[0]
        decimal = numberSplit[1]

        if (integer.length > 3) {
            integer = integer.substr(0, (integer.length - 3)) + ',' + integer.substr(integer.length - 3, integer.length)
        }

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + integer + '.' + decimal
    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc + or exp -
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }

            // Replace placeholder with item data

            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%desc%', obj.desc)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type))

            // Insert HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            var fields, fieldsArr

            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue)
            fieldsArr = Array.prototype.slice.call(fields)

            fieldsArr.forEach(function (current) {
                current.value = ''
            })
            fieldsArr[0].focus()
        },

        displayBudget: function (obj) {
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.expensesPercentage).textContent = obj.percentage + '%'
            } else {
                document.querySelector(DOMstrings.expensesPercentage).textContent = '---'
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.itemPercentage)

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'
                } else {
                    current.textContent = '---'
                }
            })
        },

        displayMonth: function () {
            var now, year, month, months

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            now = new Date()
            year = now.getFullYear()
            month = now.getMonth()
            document.querySelector(DOMstrings.month).textContent = months[month] + ' ' + year
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue
            )
            nodeListForEach(fields, function (cur) { cur.classList.toggle('red-focus') })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        getDOMstrings: function () {
            return DOMstrings
        }
    }
})()

//
//
//
//
//
//                                     *************************    CONTROLLER    ***********************

var controller = (function (budgetCtrl, UICtrl) {
    var DOM = UICtrl.getDOMstrings()
    var setupEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }

    var updateBudget = function () {
        // Calculate budget
        budgetCtrl.calculateBudget()

        // Return the budget

        var budget = budgetCtrl.getBudget()

        // Display the budget on the UI
        UICtrl.displayBudget(budget)
    }

    var updatePercentages = function () {
        // Calculate percentages

        budgetCtrl.calculatePercentages()
        // Read percentages from Budget Controller
        var percentages = budgetCtrl.getPercentages()
        // Update UI
        UICtrl.displayPercentages(percentages)
    }

    var ctrlAddItem = function () {
        var input, newItem
        // Get the field input data

        input = UICtrl.getInput()

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
        // Add the item to the budget

            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // Add the item to the UI

            UICtrl.addListItem(newItem, input.type)

            // Clear the fields

            UICtrl.clearFields()

            // Calculate & Update Budget
            updateBudget()

            //  Calculate and update percentages
            updatePercentages()
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            splitID = itemID.split('-')
            type = splitID[0]
            ID = parseInt(splitID[1])

            console.log(type, ID)
            console.log(itemID)
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID)

            // Delete item from user interface
            UIController.deleteListItem(itemID)
            // Update and show new budget
            updateBudget()

            // Calculate and update percentages
            updatePercentages()
        }
    }

    return {
        init: function () {
            console.log('Application has started')
            setupEventListeners()
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
        }
    }
})(budgetController, UIController)

controller.init()
