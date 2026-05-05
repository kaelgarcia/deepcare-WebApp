document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if not logged in
    if (!localStorage.getItem('deepcare_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    const userId = localStorage.getItem('user_id');

    // Pre-fill username field from DB data
    const usernameField = document.getElementById('fullName');
    if (usernameField) {
        usernameField.value = localStorage.getItem('user_username') || '';
    }

    //  Load existing assessment from DB and pre-fill form 
    try {
        const res = await fetch('../backend/get_assessment.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: userId })
        });
        const data = await res.json();

        if (data.success) {
            // Pre-fill text fields
            if (document.getElementById('age'))       document.getElementById('age').value       = data.age       || '';
            if (document.getElementById('gender'))    document.getElementById('gender').value    = data.gender    || '';
            if (document.getElementById('allergies')) document.getElementById('allergies').value = data.allergies || '';

            // Pre-check skin type checkboxes
            if (data.skin_type) {
                const skinTypes = data.skin_type.split(', ');
                document.querySelectorAll('input[name="skinType"]').forEach(cb => {
                    if (skinTypes.includes(cb.value)) cb.checked = true;
                });
            }

            // Pre-check skin feel checkboxes
            if (data.skin_feel) {
                const skinFeels = data.skin_feel.split(', ');
                document.querySelectorAll('input[name="skinFeel"]').forEach(cb => {
                    if (skinFeels.includes(cb.value)) cb.checked = true;
                });
            }

            // Pre-check concerns checkboxes
            if (data.concerns) {
                const concerns = data.concerns.split(', ');
                document.querySelectorAll('input[name="concerns"]').forEach(cb => {
                    if (concerns.includes(cb.value)) cb.checked = true;
                });
            }
        }
    } catch (err) {
        // No existing assessment — form stays blank, that's fine
        console.log('No existing assessment found.');
    }

    // Save assessment on submit
    const skinForm = document.getElementById('skinForm');
    if (skinForm) {
        skinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const getChecked = (name) =>
                Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                    .map(cb => cb.value).join(', ');

            const formData = new FormData(skinForm);

            const profile = {
                user_id:   userId,
                age:       formData.get('age')       || '',
                gender:    formData.get('gender')    || '',
                skin_type: getChecked('skinType')    || 'None',
                skin_feel: getChecked('skinFeel')    || 'None',
                concerns:  getChecked('concerns')    || 'None',
                allergies: formData.get('allergies') || 'None'
            };

            // Also save to localStorage for fast access
            localStorage.setItem('deepcare_user_profile', JSON.stringify({
                fullName:  localStorage.getItem('user_fullname'),
                age:       profile.age,
                gender:    profile.gender,
                skinType:  profile.skin_type,
                skinFeel:  profile.skin_feel,
                concerns:  profile.concerns,
                allergies: profile.allergies
            }));

            const btn = skinForm.querySelector('.btn-stats');
            btn.disabled    = true;
            btn.textContent = 'Saving…';

            try {
                const res = await fetch('../backend/save_assessment.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(profile)
                });
                const result = await res.json();

                if (result.success) {
                    window.location.href = 'main.html';
                } else {
                    alert('Could not save assessment: ' + result.message);
                }
            } catch (err) {
                alert('Could not reach the server. Make sure WAMP is running.');
            } finally {
                btn.disabled    = false;
                btn.textContent = 'Save Assessment';
            }
        });
    }
});
