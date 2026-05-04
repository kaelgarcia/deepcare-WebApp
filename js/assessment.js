document.addEventListener('DOMContentLoaded', () => {
    const skinForm = document.getElementById('skinForm');

    if (skinForm) {
        skinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(skinForm);
            
            // Helper to aggregate checked boxes into a string
            const getChecked = (name) => {
                return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                            .map(cb => cb.value).join(', ');
            };

            const fullProfile = {
                fullName: formData.get('fullName'),
                age: formData.get('age'),
                gender: formData.get('gender'),
                skinType: getChecked('skinType') || 'None',
                skinFeel: getChecked('skinFeel') || 'None',
                concerns: getChecked('concerns') || 'None',
                allergies: formData.get('allergies') || 'None'
            };

            // Save the data to be used by profile.html
            localStorage.setItem('deepcare_user_profile', JSON.stringify(fullProfile));
            window.location.href = 'profile.html';
        });
    }
});