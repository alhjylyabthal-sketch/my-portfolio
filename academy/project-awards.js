// Awards and sign-in are intentionally disabled.
function removeAwardLogin(){document.getElementById('award-access')?.remove();}
removeAwardLogin();window.addEventListener('hashchange',removeAwardLogin);
