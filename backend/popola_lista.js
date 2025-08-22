async function popola_lista_capitoli() {
    const r = await fetch('../database/Corano.json');
    const dati = await r.json();

    const lista_capitoli = document.getElementById('lista_capitoli');
    const contenitore = document.querySelector('.contenitore_capitolo');

    function caricaCapitolo(capitolo) {
        contenitore.innerHTML = ""; 
        contenitore.innerHTML += `<div style="height: 24px;"></div>`;

        if (capitolo.basmala === true && capitolo.indice !== 1) {
            contenitore.innerHTML += `
                <div class="basmala" style="display: flex; justify-content: center; align-items: center;">
                    <img src="../pages/assets/basmala.png" style="width: 340px; filter: invert(100%);">
                </div>`;
        }

        let htmlVersi = `<div class="versi" style="margin-left: 15%; margin-right: 15%;">`;

        capitolo.versi.forEach(verso => {
            let paroleHTML = "";
            verso.parole.forEach(parola => {
                paroleHTML += `
                    <div class="parola" style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                        <span class="arabo">${parola.arabo} &nbsp;</span>
                        <span class="traslitterazione">${parola.traslitterazione}</span>
                    </div>`;

            });

            htmlVersi += `
                <div class="verso">
                    <div class="contenuto">
                        <div class="testo_arabo">
                            ${paroleHTML}
                        </div>
                        <div class="testo_tradotto">
                            <p>${verso.traduzioni[0].testo_tradotto}</p>
                            <div class="autore">
                                <p>— ${verso.traduzioni[0].autore}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        htmlVersi += `</div>`;
        contenitore.innerHTML += htmlVersi;

        let i = 0;
        const paroleDivs = contenitore.querySelectorAll(".parola");
        capitolo.versi.forEach(verso => {
            verso.parole.forEach(parola => {
                if (parola.pronuncia) {
                    paroleDivs[i].addEventListener("click", () => {
                        new Audio(parola.pronuncia).play();
                    });
                }
                i++;
            });
        });
    }

    dati.capitoli.forEach((capitolo, index) => {
        const c = document.createElement('div');
        c.classList.add("capitolo");
        c.innerHTML = `<p>${capitolo.indice}&nbsp;&nbsp;&nbsp; ${capitolo.nome_traslitterato}</p>`;

        c.addEventListener("click", () => caricaCapitolo(capitolo));

        lista_capitoli.appendChild(c);

        if (index === 0) {
            caricaCapitolo(capitolo);
        }
    });
}

popola_lista_capitoli();
