document.addEventListener('DOMContentLoaded', async () => {
    // Redirect if not logged in
    if (!localStorage.getItem('deepcare_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    const userId   = localStorage.getItem('user_id');
    const fullname = localStorage.getItem('user_fullname') || 'User';
    const email    = localStorage.getItem('user_email')    || '—';
    const phone    = localStorage.getItem('user_phone')    || '—';

    // Fill in account info
    const nameEl   = document.getElementById('display-name');
    const emailEl  = document.getElementById('display-email');
    const mobileEl = document.getElementById('display-mobile');

    if (nameEl)   nameEl.textContent   = fullname;
    if (emailEl)  emailEl.textContent  = email;
    if (mobileEl) mobileEl.textContent = phone || '—';

    //  Load assessment from DB and display in profile
    const infoContainer = document.getElementById('extra-stats');

    try {
        const res = await fetch('../backend/get_assessment.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: userId })
        });
        const data = await res.json();

        if (data.success && infoContainer) {
            // Also sync localStorage so assessment page can pre-fill
            localStorage.setItem('deepcare_user_profile', JSON.stringify({
                fullName:  fullname,
                age:       data.age,
                gender:    data.gender,
                skinType:  data.skin_type,
                skinFeel:  data.skin_feel,
                concerns:  data.concerns,
                allergies: data.allergies
            }));

            const fields = [
                { label: 'Age',       value: data.age       },
                { label: 'Gender',    value: data.gender    },
                { label: 'Skin Type', value: data.skin_type },
                { label: 'Skin Feel', value: data.skin_feel },
                { label: 'Concerns',  value: data.concerns  },
                { label: 'Allergens', value: data.allergies }
            ];

            infoContainer.innerHTML = fields.map(f => `
                <div class="info-item">
                    <strong>${f.label}</strong>
                    <span>${f.value || 'Not provided'}</span>
                </div>
            `).join('');
        } else if (infoContainer) {
            infoContainer.innerHTML = '<p>No assessment yet. Click <strong>Update Statistics</strong> to fill it out.</p>';
        }
    } catch (err) {
        if (infoContainer) infoContainer.innerHTML = '<p>Could not load assessment data.</p>';
    }

    //  Logout
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
});
