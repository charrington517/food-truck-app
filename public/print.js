        // Print Functions
        function printEvents() {
            fetch('/api/events')
                .then(r => r.json())
                .then(events => {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    printWindow.document.write('<html><head><title>Event Schedule</title>');
                    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;}.event{border:1px solid #ddd;padding:15px;margin-bottom:15px;page-break-inside:avoid;}.event-title{font-size:18px;font-weight:bold;color:#ff6b35;margin-bottom:10px;}.event-detail{margin:5px 0;}</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write('<h1>Event Schedule</h1>');
                    printWindow.document.write('<p>Printed: ' + new Date().toLocaleDateString() + '</p>');
                    events.forEach(e => {
                        printWindow.document.write(`<div class="event">`);
                        printWindow.document.write(`<div class="event-title">${e.name}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Type:</strong> ${e.type || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Location:</strong> ${e.location || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Date:</strong> ${e.date || 'N/A'}${e.end_date ? ' to ' + e.end_date : ''}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Time:</strong> ${e.time || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Fee:</strong> $${e.fee || 0}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Status:</strong> ${e.status || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Paid:</strong> ${e.paid ? 'Yes' : 'No'}</div>`);
                        if (e.notes) printWindow.document.write(`<div class="event-detail"><strong>Notes:</strong> ${e.notes}</div>`);
                        printWindow.document.write(`</div>`);
                    });
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.print();
                });
        }
        
        function printCatering() {
            fetch('/api/catering')
                .then(r => r.json())
                .then(orders => {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    printWindow.document.write('<html><head><title>Catering Orders</title>');
                    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;}.event{border:1px solid #ddd;padding:15px;margin-bottom:15px;page-break-inside:avoid;}.event-title{font-size:18px;font-weight:bold;color:#ff6b35;margin-bottom:10px;}.event-detail{margin:5px 0;}</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write('<h1>Catering Orders</h1>');
                    printWindow.document.write('<p>Printed: ' + new Date().toLocaleDateString() + '</p>');
                    orders.forEach(c => {
                        printWindow.document.write(`<div class="event">`);
                        printWindow.document.write(`<div class="event-title">${c.client}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Date:</strong> ${c.date || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Location:</strong> ${c.location || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Guests:</strong> ${c.guests || 0}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Price:</strong> $${c.price || 0}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Status:</strong> ${c.status || 'N/A'}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Deposit:</strong> $${c.deposit || 0}</div>`);
                        printWindow.document.write(`<div class="event-detail"><strong>Payment Status:</strong> ${c.payment_status || 'N/A'}</div>`);
                        if (c.setup_time) printWindow.document.write(`<div class="event-detail"><strong>Setup Time:</strong> ${c.setup_time} hours</div>`);
                        if (c.event_start_time) printWindow.document.write(`<div class="event-detail"><strong>Event Time:</strong> ${c.event_start_time} - ${c.event_end_time || ''}</div>`);
                        if (c.service_type) printWindow.document.write(`<div class="event-detail"><strong>Service:</strong> ${c.service_type}</div>`);
                        if (c.staff_count) printWindow.document.write(`<div class="event-detail"><strong>Staff:</strong> ${c.staff_count} ($${c.staff_cost || 0})</div>`);
                        if (c.equipment_provider) printWindow.document.write(`<div class="event-detail"><strong>Equipment:</strong> ${c.equipment_provider} ($${c.equipment_cost || 0})</div>`);
                        if (c.equipment_notes) printWindow.document.write(`<div class="event-detail"><strong>Equipment Details:</strong> ${c.equipment_notes}</div>`);
                        if (c.notes) printWindow.document.write(`<div class="event-detail"><strong>Notes:</strong> ${c.notes}</div>`);
                        if (c.personal_notes) printWindow.document.write(`<div class="event-detail"><strong>Internal Notes:</strong> ${c.personal_notes}</div>`);
                        printWindow.document.write(`</div>`);
                    });
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.print();
                });
        }

        function printSchedule() {
            const printWindow = window.open('', '', 'width=800,height=600');
            const content = document.getElementById('timePunchHistory').innerHTML;
            printWindow.document.write('<html><head><title>Time Punch History</title>');
            printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#ff6b35;color:white;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<h1>Time Punch History</h1>');
            printWindow.document.write('<p>Printed: ' + new Date().toLocaleDateString() + '</p>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }

        async function printEventDetails(eventId) {
            const response = await fetch('/api/events');
            const events = await response.json();
            const event = events.find(e => e.id === eventId);
            if (!event) return;
            
            const printWindow = window.open('', '', 'width=800,height=600');
            let html = '<html><head><title>Event Details - ' + event.name + '</title>';
            html += '<style>body { font-family: Arial, sans-serif; padding: 40px; } h1 { color: #ff6b35; } .detail { margin: 10px 0; } .label { font-weight: bold; }</style>';
            html += '</head><body><h1>' + event.name + '</h1>';
            html += '<div class="detail"><span class="label">Type:</span> ' + event.type + '</div>';
            html += '<div class="detail"><span class="label">Location:</span> ' + event.location + '</div>';
            html += '<div class="detail"><span class="label">Date:</span> ' + event.date + (event.end_date ? ' - ' + event.end_date : '') + '</div>';
            if (event.time) html += '<div class="detail"><span class="label">Time:</span> ' + event.time + '</div>';
            if (event.fee > 0) html += '<div class="detail"><span class="label">Fee:</span> $' + event.fee.toFixed(2) + '</div>';
            html += '<div class="detail"><span class="label">Status:</span> ' + event.status + '</div>';
            if (event.notes) html += '<div class="detail"><span class="label">Notes:</span> ' + event.notes + '</div>';
            html += '<script>window.print(); window.close();<\/script></body></html>';
            printWindow.document.write(html);
            printWindow.document.close();
        }

        async function printCateringDetails(orderId) {
            const response = await fetch('/api/catering');
            const orders = await response.json();
            const order = orders.find(o => o.id === orderId);
            if (!order) return;
            
            const printWindow = window.open('', '', 'width=800,height=600');
            let html = '<html><head><title>Catering Order - ' + order.client + '</title>';
            html += '<style>body { font-family: Arial, sans-serif; padding: 40px; } h1 { color: #ff6b35; } .detail { margin: 10px 0; } .label { font-weight: bold; } ul { margin: 5px 0 0 20px; }</style>';
            html += '</head><body><h1>Catering Order - ' + order.client + '</h1>';
            html += '<div class="detail"><span class="label">Date:</span> ' + order.date + '</div>';
            html += '<div class="detail"><span class="label">Guests:</span> ' + order.guests + '</div>';
            if (order.location) html += '<div class="detail"><span class="label">Location:</span> ' + order.location + '</div>';
            if (order.event_start_time || order.event_end_time) html += '<div class="detail"><span class="label">Event Time:</span> ' + (order.event_start_time || 'TBD') + ' - ' + (order.event_end_time || 'TBD') + '</div>';
            if (order.setup_time) html += '<div class="detail"><span class="label">Setup Time:</span> ' + order.setup_time + ' hours</div>';
            if (order.service_type) html += '<div class="detail"><span class="label">Service Type:</span> ' + order.service_type + '</div>';
            if (order.staff_count > 0) html += '<div class="detail"><span class="label">Staff:</span> ' + order.staff_count + ' staff - $' + order.staff_cost.toFixed(2) + '</div>';
            if (order.equipment_provider) html += '<div class="detail"><span class="label">Equipment:</span> ' + order.equipment_provider + (order.equipment_cost > 0 ? ' - $' + order.equipment_cost.toFixed(2) : '') + '</div>';
            if (order.equipment_notes) html += '<div class="detail"><span class="label">Equipment Notes:</span> ' + order.equipment_notes + '</div>';
            if (order.price > 0) html += '<div class="detail"><span class="label">Price:</span> $' + order.price.toFixed(2) + '</div>';
            if (order.deposit > 0) html += '<div class="detail"><span class="label">Deposit:</span> $' + order.deposit.toFixed(2) + '</div>';
            if (order.payment_status) html += '<div class="detail"><span class="label">Payment Status:</span> ' + order.payment_status + '</div>';
            html += '<div class="detail"><span class="label">Status:</span> ' + order.status + '</div>';
            if (order.selected_menu) {
                try {
                    const menu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
                    if (menu && menu.length > 0) {
                        html += '<div class="detail"><span class="label">Menu Items:</span><ul>';
                        menu.forEach(item => {
                            html += '<li>' + item.name + ' (' + item.quantity + ' servings) - $' + (item.total || item.totalPrice).toFixed(2) + '</li>';
                        });
                        html += '</ul></div>';
                    }
                } catch(e) {}
            }
            if (order.notes) html += '<div class="detail"><span class="label">Event Notes:</span> ' + order.notes + '</div>';
            if (order.personal_notes) html += '<div class="detail"><span class="label">Personal Notes:</span> ' + order.personal_notes + '</div>';
            html += '<script>window.print(); window.close();<\/script></body></html>';
            printWindow.document.write(html);
            printWindow.document.close();
        }

