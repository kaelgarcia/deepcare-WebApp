const uploadTrigger = document.getElementById('uploadTrigger');
const imageInput = document.getElementById('imageInput');
const chatWindow = document.getElementById('chatWindow');
const sendBtn = document.getElementById('sendBtn');

let selectedFile = null;

uploadTrigger.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        const reader = new FileReader();
        
        reader.onload = (event) => {
            chatWindow.innerHTML = ''; // Clear previous preview
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'message-image';
            img.style.opacity = "0.6"; 
            chatWindow.appendChild(img);
            
            sendBtn.style.display = 'block';
            uploadTrigger.textContent = "Selected: " + file.name;
        };
        reader.readAsDataURL(file);
    }
});

sendBtn.addEventListener('click', () => {
    if (selectedFile) {
        const previewImg = chatWindow.querySelector('.message-image');
        if (previewImg) {
            previewImg.style.opacity = "1";
            previewImg.style.borderColor = "white";
        }
        
        sendBtn.style.display = 'none';
        uploadTrigger.textContent = "+ Upload Image for Analysis";
        selectedFile = null;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});