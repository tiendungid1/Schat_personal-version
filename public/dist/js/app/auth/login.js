document
    .getElementById('loginForm')
    .addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('inputEmail').value;
        const password = document.getElementById('inputPassword').value;

        const response = await fetch(`${location.origin}/api/users/login`, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                credentials: 'include',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            console.log(error);

            return;
        }

        localStorage.setItem('user', JSON.stringify(await response.json()));

        location.href = '/';
    });
