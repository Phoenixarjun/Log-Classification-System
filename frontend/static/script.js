document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const classifyButton = document.getElementById('classifyButton');
    const resultsArea = document.getElementById('resultsArea');
    const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
    const downloadButton = document.getElementById('downloadButton');
    const loading = document.getElementById('loading');

    let currentFile = null;
    let classificationResults = null;
    let processedData = [];

const riskConfig = {
    'Security Alert': {
        level: 'High',
        icon: '🔴',  // Red circle
        description: 'Security threat detected'
    },
    'Workflow Error': {
        level: 'High',
        icon: '❌',  
        description: 'Critical system error'
    },
    'Warning': {
        level: 'Medium',
        icon: '⚠️',  
        description: 'Potential issue'
    },
    'Deprecation Warning': {
        level: 'Medium',
        icon: '⚠️',  
        description: 'Deprecated feature notice'
    },
    'System Notification': {
        level: 'Normal',
        icon: 'ℹ️',  
        description: 'System status update'
    },
    'HTTP Status': {
        level: 'Low',
        icon: '🌐',  
        description: 'Network activity'
    },
    '_default': {
        level: 'Normal',
        icon: '📄',
        description: 'Unclassified log entry'
    }
};


    function cleanLogMessage(message) {
        return message.replace(/^"\s*""|""\s*"$/g, '').trim();
    }

    function getRiskConfig(label) {
        return riskConfig[label] || riskConfig['_default'];
    }

    fileInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            currentFile = e.target.files[0];
            fileInfo.textContent = `Selected file: ${currentFile.name}`;
            classifyButton.disabled = false;
        } else {
            fileInfo.textContent = 'No file selected';
            classifyButton.disabled = true;
        }
    });

    classifyButton.addEventListener('click', async function () {
        if (!currentFile) return;

        loading.style.display = 'block';
        resultsArea.style.display = 'none';
        processedData = [];

        try {
            const formData = new FormData();
            formData.append('file', currentFile);

            const response = await fetch('/classify/', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to classify logs');
            }

            const blob = await response.blob();
            const reader = new FileReader();

            reader.onload = function (e) {
                const csvData = e.target.result;
                const rows = csvData.split('\n');
                const headers = rows[0].split(',');
                resultsTable.innerHTML = '';

                const displayRows = Math.min(100, rows.length - 1);

                for (let i = 1; i <= displayRows; i++) {
                    if (!rows[i]) continue;
                    const cols = rows[i].split(',');
                    if (cols.length < 3) continue;

                    const source = cols[0].trim();
                    const logMessage = cleanLogMessage(cols[1]);
                    const label = cols[2].trim().replace(/^"|"$/g, '');
                    const config = getRiskConfig(label);

                    processedData.push({
                        source,
                        logMessage,
                        label,
                        priority: config.level,
                        description: config.description
                    });

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${source}</td>
                        <td class="log-message">${logMessage}</td>
                        <td class="log-label">
                            <span class="log-icon">${config.icon}</span> ${label}
                        </td>
                        <td class="log-priority">
                            <span class="priority-icon">${config.icon}</span> ${config.level}
                        </td>
                    `;
                    resultsTable.appendChild(row);
                }

                if (rows.length - 1 > displayRows) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="4" class="row-count-message">
                        Showing ${displayRows} of ${rows.length - 1} rows. Download full results below.
                    </td>`;
                    resultsTable.appendChild(row);
                }

                classificationResults = blob;
                loading.style.display = 'none';
                resultsArea.style.display = 'block';
            };
            reader.readAsText(blob);
        } catch (error) {
            loading.style.display = 'none';
            alert(`Error: ${error.message}`);
        }
    });

    downloadButton.addEventListener('click', function () {
        if (!processedData.length) return;

        let csvContent = "Source,Log Message,Label,Priority,Description\n";
        processedData.forEach(item => {
            csvContent += `"${item.source}","${item.logMessage}","${item.label}","${item.priority}","${item.description}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classified_logs_priority.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
