document.addEventListener('DOMContentLoaded', () => {
    const infoContainer = document.getElementById('extra-stats');
    const savedData = JSON.parse(localStorage.getItem('deepcare_user_profile'));

    if (savedData && infoContainer) {
        // Update header info
        document.getElementById('display-name').textContent = savedData.fullName;
        
        // Map all data into the grid
        const fields = [
            { label: 'Age', value: savedData.age },
            { label: 'Gender', value: savedData.gender },
            { label: 'Skin Type', value: savedData.skinType },
            { label: 'Skin Feel', value: savedData.skinFeel },
            { label: 'Concerns', value: savedData.concerns },
            { label: 'Allergens', value: savedData.allergies }
        ];

        infoContainer.innerHTML = fields.map(field => `
            <div class="info-item">
                <strong>${field.label}</strong>
                <span>${field.value || 'Not provided'}</span>
            </div>
        `).join('');
    }
});