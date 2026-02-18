document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    var successMsg = document.getElementById('success-msg');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            form.style.display = 'none';
            successMsg.style.display = 'block';
        });
    }
});
