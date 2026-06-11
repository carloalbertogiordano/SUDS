# SUDS — Subjective Units of Distress Scale

Tool web standalone per psicologi clinici che utilizzano la **SUDS** (Wolpe, anni '50) per costruire gerarchie di esposizione graduata con i propri pazienti e generare schede stampabili.

**[Apri il tool →](https://carloalbertogiordano.github.io/SUDS/)**

---

## Funzionamento

Singolo file HTML — niente server, niente installazione. Si apre nel browser e funziona subito.

## Feature

- Creazione scheda paziente con nome, cognome e codice identificativo a 4 cifre generato automaticamente
- Salvataggio scheda come file JSON scaricabile
- Caricamento scheda da file JSON esistente
- Aggiunta e rimozione libera di attività alla scheda
- Assegnazione punteggio SUDS 0–100 a ogni attività
- Riordino automatico della lista per punteggio crescente ad ogni modifica
- Selezione tramite checkbox delle attività da includere nella scheda stampabile
- Generazione PDF "Voglio Provare" con le attività selezionate, ordinate per punteggio crescente
- Il PDF include: nome paziente, data di generazione, commento generale della sessione, nota specifica per ogni attività selezionata
- Layout responsive, font grande, palette calma — pensato per uso in studio

## Licenza

Vedi [LICENSE](LICENSE).
