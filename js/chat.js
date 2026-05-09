document.addEventListener('DOMContentLoaded', () => {
    // Redirect if not logged in
    if (!localStorage.getItem('deepcare_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    const uploadTrigger = document.getElementById('uploadTrigger');
    const imageInput = document.getElementById('imageInput');
    const chatWindow = document.getElementById('chatWindow');
    const sendBtn = document.getElementById('sendBtn');

    let selectedFile = null;
    
    // Helper
    function appendMessage(sender, htmlContent, imgSrc = null) {
        const wrapper = document.createElement('div');
        wrapper.className = `message ${sender}`;

        if (imgSrc) {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = 'message-image';
            wrapper.appendChild(img);
        }
        if (htmlContent) {
            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.innerHTML = htmlContent;
            wrapper.appendChild(bubble);
        }
        chatWindow.appendChild(wrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function setLoading(isLoading) {
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? 'Analyzing...' : 'Send for Analysis';
        uploadTrigger.disabled = isLoading;
    }

    // Image Selection
    uploadTrigger.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        selectedFile = file;
        uploadTrigger.textContent = 'Selected: ' + file.name;
        sendBtn.style.display = 'inline-block';
    });

    // Send for Analysis
    sendBtn.addEventListener('click', async() => {
        if (!selectedFile) return;

        const file        = selectedFile;
        const previewSrc  = URL.createObjectURL(file);

        // Reset UI immediately
        selectedFile              = null;
        sendBtn.style.display     = 'none';
        uploadTrigger.textContent = '+ Upload Image for Analysis';
        imageInput.value          = '';

        // Show user's image in chat
        appendMessage('user', null, previewSrc);
        setLoading(true);

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        appendMessage('bot', '<em id="' + typingId + '">Analyzing your skin image…</em>');

        // ── API Call ──────────────────────────────────────────────────────────
        const formData = new FormData();
        formData.append('image', file); // matches $_FILES['image'] in predict_skin.php

        try {
            const res = await fetch('../backend/predict_skin.php', {
                method: 'POST',
                body:   formData
                // Do NOT set Content-Type — browser sets it with correct boundary
            });

            if (!res.ok) {
                throw new Error('Server returned HTTP ' + res.status);
            }

            const result = await res.json();

            // Remove typing indicator
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.closest('.message').remove();

            if (!result.success) {
                appendMessage('bot', '❌ ' + (result.message || 'Analysis failed. Please try again.'));
                return;
            }

            // ── Build Result Message ──────────────────────────────────────────
            const confidenceColor = result.confidence >= 70 ? '#2ecc71'
                                  : result.confidence >= 50 ? '#f39c12'
                                  : '#e74c3c';

            let html = `
                <strong>Detected Condition:</strong> ${result.prediction}<br>
                <strong>Confidence:</strong>
                <span style="color:${confidenceColor}; font-weight:700;">
                    ${result.confidence}%
                </span><br><br>
                <strong>Top Possibilities:</strong><br>
            `;

            result.top_5.forEach((item, index) => {
                const barWidth = Math.round(item.confidence);
                html += `
                    <div style="margin: 4px 0;">
                        ${index + 1}. ${item.class}
                        <div style="
                            background: #e0e0e0;
                            border-radius: 4px;
                            height: 8px;
                            width: 100%;
                            margin-top: 2px;
                        ">
                            <div style="
                                background: ${confidenceColor};
                                width: ${barWidth}%;
                                height: 8px;
                                border-radius: 4px;
                            "></div>
                        </div>
                        <small>${item.confidence}%</small>
                    </div>
                `;
            });

            if (result.warning) {
                html += `<br>⚠️ <em>${result.warning}</em>`;
            }

            html += `
                <br><small style="color:#999;">
                    ⚕️ This result is for informational purposes only and is 
                    not a substitute for professional medical diagnosis.
                </small>
            `;

            appendMessage('bot', html);

        } catch (err) {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.closest('.message').remove();

            appendMessage('bot',
                'Could not reach the server. Please ensure WAMP and the AI server are both running.'
            );
            console.error('Prediction error:', err);

        } finally {
            setLoading(false);
        }
    });

});