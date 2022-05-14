document.getElementById('logout').addEventListener('click', function (e) {
    e.preventDefault();

    localStorage.removeItem('user');

    location.href = '/login';
});
