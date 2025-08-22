const barra = document.getElementById('barra_laterale');
const bottone = document.getElementById('bottone_toggle');

bottone.addEventListener('click', () => {
    barra.classList.toggle('chiusa');
});