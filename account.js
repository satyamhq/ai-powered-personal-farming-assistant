document.addEventListener('DOMContentLoaded', function () {
    var name = localStorage.getItem('agri1_user_name') || 'Farmer';
    var email = localStorage.getItem('agri1_user_email') || 'farmer@agri1.com';

    var uname = document.getElementById('uname');
    var uemail = document.getElementById('uemail');
    var pname = document.getElementById('pname');
    var pemail = document.getElementById('pemail');

    if (uname) uname.textContent = name;
    if (uemail) uemail.textContent = email;
    if (pname) pname.textContent = name;
    if (pemail) pemail.textContent = email;
});
