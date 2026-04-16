document.getElementById('reportPeriod').addEventListener('change', function() {
    const custom = this.value === 'custom';
    document.getElementById('reportStartDate').style.display = custom ? 'block' : 'none';
    document.getElementById('reportEndDate').style.display = custom ? 'block' : 'none';
});

function loadInventoryReport() {
    const period = document.getElementById('reportPeriod').value;
    let startDate, endDate;
    const today = new Date();
    
    if (period === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else {
        startDate = document.getElementById('reportStartDate').value;
        endDate = document.getElementById('reportEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }
    }
    
    fetch(`/api/inventory-report?start_date=${startDate}&end_date=${endDate}`)
        .then(r => r.json())
        .then(data => {
            if (data.length === 0) {
                document.getElementById('inventoryReportData').innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gray);">No inventory changes in this period</div>';
                return;
            }
            
            let html = '<table style="width: 100%; border-collapse: collapse;">';
            html += '<thead><tr style="background: var(--orange); color: white;">';
            html += '<th style="padding: 12px; text-align: left;">Item</th>';
            html += '<th style="padding: 12px; text-align: right;">Used</th>';
            html += '<th style="padding: 12px; text-align: right;">Added</th>';
            html += '<th style="padding: 12px; text-align: right;">Net Change</th>';
            html += '<th style="padding: 12px; text-align: center;">Transactions</th>';
            html += '</tr></thead><tbody>';
            
            data.forEach((item, i) => {
                const netChange = item.total_added - item.total_used;
                const bgColor = i % 2 === 0 ? 'var(--gray-light)' : 'var(--white)';
                html += `<tr style="background: ${bgColor};">`;
                html += `<td style="padding: 12px;">${item.item_name}</td>`;
                html += `<td style="padding: 12px; text-align: right; color: var(--danger);">${item.total_used.toFixed(2)} ${item.unit || ''}</td>`;
                html += `<td style="padding: 12px; text-align: right; color: var(--success);">+${item.total_added.toFixed(2)} ${item.unit || ''}</td>`;
                html += `<td style="padding: 12px; text-align: right; font-weight: bold; color: ${netChange >= 0 ? 'var(--success)' : 'var(--danger)'};">${netChange >= 0 ? '+' : ''}${netChange.toFixed(2)} ${item.unit || ''}</td>`;
                html += `<td style="padding: 12px; text-align: center;">${item.transaction_count}</td>`;
                html += '</tr>';
            });
            
            html += '</tbody></table>';
            document.getElementById('inventoryReportData').innerHTML = html;
        });
}

function exportInventoryReport() {
    const period = document.getElementById('reportPeriod').value;
    let startDate, endDate;
    const today = new Date();
    
    if (period === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date().toISOString().split('T')[0];
    } else {
        startDate = document.getElementById('reportStartDate').value;
        endDate = document.getElementById('reportEndDate').value;
        if (!startDate || !endDate) {
            alert('Please select start and end dates');
            return;
        }
    }
    
    fetch(`/api/inventory-report?start_date=${startDate}&end_date=${endDate}`)
        .then(r => r.json())
        .then(data => {
            let csv = 'Item,Used,Added,Net Change,Unit,Transactions\n';
            data.forEach(item => {
                const netChange = item.total_added - item.total_used;
                csv += `"${item.item_name}",${item.total_used},${item.total_added},${netChange},"${item.unit || ''}",${item.transaction_count}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `inventory-report-${startDate}-to-${endDate}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
}
