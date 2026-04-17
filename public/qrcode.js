        // QR Code Functions
        function updateQRPlaceholder() {
            const type = document.getElementById('qrType').value;
            const input = document.getElementById('qrContent');
            const wifiFields = document.getElementById('wifiFields');
            
            wifiFields.style.display = type === 'wifi' ? 'block' : 'none';
            
            const placeholders = {
                url: 'https://your-menu-website.com',
                text: 'Welcome to Birria Fusion!',
                phone: '+1-555-123-4567',
                email: 'info@birriafusion.com',
                wifi: 'Leave blank for WiFi'
            };
            
            input.placeholder = placeholders[type];
            if (type === 'wifi') input.style.display = 'none';
            else input.style.display = 'block';
        }
        
        function generateQR() {
            const type = document.getElementById('qrType').value;
            let content = '';
            
            if (type === 'wifi') {
                const ssid = document.getElementById('wifiSSID').value;
                const password = document.getElementById('wifiPassword').value;
                if (!ssid) {
                    alert('Please enter network name');
                    return;
                }
                content = `WIFI:T:WPA;S:${ssid};P:${password};;`;
            } else {
                content = document.getElementById('qrContent').value;
                if (!content) {
                    alert('Please enter content for QR code');
                    return;
                }
                
                if (type === 'phone') content = `tel:${content}`;
                if (type === 'email') content = `mailto:${content}`;
            }
            
            document.getElementById('qrResult').innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div id="qrcode" style="margin-bottom: 10px;"></div>
                    <div style="font-size: 12px; color: var(--gray); margin-bottom: 10px; word-break: break-all;">${content}</div>
                    <button class="btn" onclick="downloadQRCanvas()" style="width: auto; padding: 8px 16px; font-size: 0.9em;">Download</button>
                </div>
            `;
            
            new QRCode(document.getElementById('qrcode'), {
                text: content,
                width: 200,
                height: 200
            });
        }
        
        function downloadQRCanvas() {
            const canvas = document.querySelector('#qrcode canvas');
            if (canvas) {
                const url = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = url;
                link.download = 'qr-code.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

