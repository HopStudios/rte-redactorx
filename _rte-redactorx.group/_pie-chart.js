(function() {
    RedactorX.add("plugin", "pieChart", {
        translations: {
            en: {
                pieChart: {
                    "pieChart": "Pie Chart",
                    "label": "Label",
                    "value": "Value (0-99)",
                    "color": "Hex Color",
                    "insert": "Insert",
                    "generate": "Generate",
                    "cancel": "Cancel",
                    "totalWarning": "Total value exceeds 100%. Please adjust the values.",
                    "totalLessWarning": "Values don't add up to 100%. Filling the rest with 'Unknown'."
                }
            }
        },
        defaults: {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="black" stroke-width="1" fill="none" /><path d="M8 1 A7 7 0 0 1 15 8 L8 8 Z" fill="#FF5733" /><path d="M8 8 L15 8 A7 7 0 0 1 8 15 Z" fill="#33FF57" /><path d="M8 8 L8 15 A7 7 0 0 1 1 8 Z" fill="#3357FF" /></svg>',
            colors: ['FF5733', '33FF57', '3357FF', 'FF33A1', 'FFD433', '33FFF6', 'FF9633', '9633FF', '33FF96', 'FF3333', '33B8FF', 'FF33F6', 'B8FF33', 'FF5733', '3375FF', '33FFB8'],
            currentColorIndex: 0,
            chartId: 'temp'
        },
        start: function() {
            let button = {
                title: '## pieChart.pieChart ##',
                classname: "pieChartBtn",
                icon: this.opts.pieChart.icon,
                command: "pieChart.popup",
                observer: "pieChart.observe"
            };
            this.app.toolbar.add("pieChart", button);
        },
        observe: function (obj, name) {
            let instance = this.app.block.get();
            let isEditable = instance.isEditable();
            let isPieChartBlock = this._getCurrentPieChart();
            // Show the button if the block is editable (text) or contains a pie chart
            if (!isEditable && !isPieChartBlock) {
                return false;
            }
        },
        _getCurrentPieChart: function() {
            let instance = this.app.block.get();
            let chartElement = instance.getBlock();
            return chartElement && chartElement.attr('class').includes('piechart') ? chartElement : false;
        },
        popup: function (params, button) {
            const $popup = this.app.popup.create('pieChart', {
                title: "## pieChart.pieChart ##",
                width: '800px',
                footer: {
                    save: {
                        title: '## pieChart.insert ##',
                        command: 'pieChart.insert',
                        type: 'insert'
                    },
                    generate: {
                        title: '## pieChart.generate ##',
                        command: 'pieChart.generate',
                        type: 'generate'
                    },
                    cancel: {
                        title: '## pieChart.cancel ##',
                        command: 'popup.close'
                    }
                }
            });

            const form = document.createElement('div');
            form.classList.add('pie-chart-form');

            this.opts.pieChart.currentColorIndex = 0;
            let pieChartData = [];
            // Get the current data from pie chart element
            let currentPieChart = this._getCurrentPieChart();
            if (currentPieChart) {
                // Getting the dataset
                pieChartData = JSON.parse(currentPieChart.data('piechart').replace(/&quot;/g, '"'));
                this.opts.pieChart.currentColorIndex = pieChartData.length - 1;
            }

            if (pieChartData.length > 0) {
                pieChartData.forEach(data => {
                    const row = this._createRow(data);
                    form.appendChild(row);
                });
            } else {
                // If no data, create a default row
                const row = this._createRow();
                form.appendChild(row);
            }

            // Append piechart canvas
            let canvas = document.createElement('div');
            canvas.id = 'piechart';
            form.appendChild(canvas);

            $popup.getBody().append(form); // If you give HTML string in form it will fail. Error in console: Uncaught TypeError: t.apply is not a function at HTMLDivElement.

            form.addEventListener('click', (e) => {
                if (e.target.classList.contains('pie-chart-add-row')) {
                    this._addRow(e);
                }
                if (e.target.classList.contains('pie-chart-remove-row')) {
                    this._removeRow(e);
                }
            });

            this.app.popup.open({ button: button });

            document.querySelector('.rx-form-button-insert').style.display = 'none';
            document.querySelector('.rx-form-button-generate').style.display = '';
            document.getElementById('piechart').style.display = 'none';

        },
        _createRow: function (pieChartRowData = { label: '', value: null, color: '' }) {
            const row = document.createElement('div');

            row.classList.add('pie-chart-row');

            const labelInput = document.createElement('input');
            labelInput.classList.add('input');
            labelInput.type = 'text';
            labelInput.name = 'label[]';
            labelInput.value = pieChartRowData.label || '';
            labelInput.placeholder = this.lang.get('pieChart.label');
            row.appendChild(labelInput);

            const valueInput = document.createElement('input');
            valueInput.classList.add('input');
            valueInput.type = 'number';
            valueInput.name = 'value[]';
            valueInput.value = pieChartRowData.value || '';
            valueInput.placeholder = this.lang.get('pieChart.value');
            valueInput.min = 0;
            valueInput.max = 99;
            row.appendChild(valueInput);

            if (this.opts.pieChart.currentColorIndex > 15) {
                this.opts.pieChart.currentColorIndex = 0;
            }
            const nextColor = this.opts.pieChart.colors[this.opts.pieChart.currentColorIndex];
            this.opts.pieChart.currentColorIndex ++;
            const colorInput = document.createElement('input');
            colorInput.classList.add('input');
            colorInput.type = 'color';
            colorInput.name = 'color[]';
            colorInput.value = pieChartRowData.color || `#${nextColor}`;
            colorInput.placeholder = this.lang.get('pieChart.color');
            row.appendChild(colorInput);

            const controls = document.createElement('div');
            controls.classList.add('pie-chart-controls');

            const addButton = document.createElement('button');
            addButton.classList.add('button', 'pie-chart-add-row');
            addButton.type = 'button';
            addButton.textContent = '➕';
            controls.appendChild(addButton);

            const removeButton = document.createElement('button');
            removeButton.classList.add('button', 'pie-chart-remove-row');
            removeButton.type = 'button';
            removeButton.textContent = '➖';
            controls.appendChild(removeButton);

            row.appendChild(controls);

            return row;
        },
        _addRow: function (e) {
            const currentRow = e.target.closest('.pie-chart-row');
            const newRow = this._createRow();
            currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
        },
        _removeRow: function (e) {
            const currentRow = e.target.closest('.pie-chart-row');
            const rowCount = document.querySelectorAll('.pie-chart-row').length;
            if (rowCount > 1) {
                currentRow.remove();
            }
        },
        generate: function() {
            const labels = Array.from(document.querySelectorAll('input[name="label[]"]')).map(input => input.value);
            const values = Array.from(document.querySelectorAll('input[name="value[]"]')).map(input => parseFloat(input.value));
            const colors = Array.from(document.querySelectorAll('input[name="color[]"]')).map(input => input.value);

            const totalValue = values.reduce((acc, val) => acc + val, 0);

            if (totalValue > 100) {
                alert(this.lang.get('pieChart.totalWarning'));
                return;
            }

            const pieChartData = labels.map((label, index) => ({
                label: label,
                value: values[index],
                color: colors[index]
            }));

            // Fill the rest with Unknown
            if (totalValue < 100) {
                pieChartData.push({
                    label: 'Unknown',
                    value: 100 - totalValue,
                    color: '#cccccc'  // Gray color for unknown
                });
                alert(this.lang.get('pieChart.totalLessWarning'));
            }

            // Draw the chart
            this._generateId();
            setTimeout(() => {
                drawChart(pieChartData);
            }, 500);

            document.querySelector('.rx-form-button-insert').style.display = '';
            document.querySelector('.rx-form-button-generate').style.display = 'none';
            document.getElementById('piechart').style.display = '';
        },
        insert: function() {
            // Insert the piechart container
            let instance = this.app.block.get();
            let currentPieChart = this._getCurrentPieChart();
            // Extract SVG after rendering the chart
            let canvasElement = document.getElementById('piechart');
            let pieChartSvg = canvasElement.getElementsByTagName('svg')[0].outerHTML;

            let $source = this.dom('<div id="' + this.opts.pieChart.chartId + '" class="piechart">').html(pieChartSvg);
            // Setting the dataset
            $source.data('piechart', canvasElement.dataset.piechart);

            if (currentPieChart) {
                instance.setHtml(pieChartSvg);
            } else {
                instance = this.app.create('block.embed', $source);
                this.app.block.add({ instance: instance });
            }

            this.app.popup.close();
        },
        _generateId: function() {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            this.opts.pieChart.chartId = 'chart-';
            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * letters.length);
                this.opts.pieChart.chartId += letters[randomIndex];
            }
        }
    });
})();

let pieChartStyle = document.createElement('style');

pieChartStyle.innerHTML = `
    #canvas {
        width: 800px;
        height: 600px;
    }
    .pie-chart-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .pie-chart-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 0 15px;
    }
    .pie-chart-row .input {
        flex: 1;
        padding: 5px;
    }
    .pie-chart-controls {
        display: flex;
        gap: 5px;
    }
    .pie-chart-controls .button {
        background: none;
        border: none;
        box-shadow: none;
        padding: 0 6px !important;
        cursor: pointer;
    }
    .pie-chart-controls .button:hover {
        font-size: 1.2em;
    }
    .pie-chart-footer {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
`;

document.head.appendChild(pieChartStyle);

const pieChartScript = document.createElement('script');
pieChartScript.src = 'https://www.gstatic.com/charts/loader.js';
pieChartScript.type = 'text/javascript';
// pieChartScript.onload = drawChart; // Once script is loaded, execute the drawChart function
document.head.appendChild(pieChartScript); // Append the script to the document's head

function drawChart(pieChartData) {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(() => {
        const dataTable = [['Label', 'Value']];
        
        pieChartData.forEach(item => {
            dataTable.push([item.label, item.value]);
        });

        const data = google.visualization.arrayToDataTable(dataTable);
        const colors = pieChartData.map(item => item.color);
        const options = {
            title: 'Dynamic Pie Chart',
            is3D: true,
            slices: colors.map(color => ({ color })),
        };

        const chart = new google.visualization.PieChart(document.getElementById('piechart'));
        google.visualization.events.addListener(chart, 'ready', function () {
            let canvasElement = document.getElementById('piechart');
            // Setting the dataset
            let dataString = JSON.stringify(pieChartData);
            dataString = dataString.replace(/"/g, '&quot;');
            canvasElement.dataset.piechart = dataString;
        });
        chart.draw(data, options);
    });
}