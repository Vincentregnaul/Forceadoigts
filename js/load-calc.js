// load-calc.js — calcul PUR des charges de travail à partir d'un test de force max.
// Test : suspension de 7 s à deux mains sur 20 mm (poids du corps + lest, lest négatif = assistance).
// Charges de travail à 85, 90 et 95 % de la charge du test, comme dans Gilmore et al. 2024
// (Sports Med Open, PMID 39560837), où les Max Hangs étaient faits à 85–95 % du test.

const round05 = x => Math.round(x * 2) / 2;

export function workingLoads(bodyKg, addedKg, pcts = [85, 90, 95]) {
  if (!Number.isFinite(bodyKg) || !Number.isFinite(addedKg) || bodyKg <= 0) return null;
  const totalKg = bodyKg + addedKg;
  if (totalKg <= 0) return null;
  const rows = pcts.map(pct => {
    const added = round05(totalKg * pct / 100 - bodyKg) || 0; // || 0 : évite −0
    return { pct, addedKg: added, totalKg: bodyKg + added };
  });
  return { totalKg, ratio: totalKg / bodyKg, rows };
}

export function formatKg(kg) {
  if (!kg) return '0 kg';
  const abs = Math.abs(kg).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  return `${kg > 0 ? '+' : '−'}${abs} kg`;
}

// Formulaire du calcul (chaîne HTML, sans DOM). `prefix` rend les id uniques par écran.
export function buildLoadCalcHTML(prefix) {
  return `
  <form class="calc" id="${prefix}-calc" novalidate>
    <div class="calc-inputs">
      <label for="${prefix}-body">Ton poids (kg)
        <input id="${prefix}-body" name="body" type="number" inputmode="decimal" min="25" max="200" step="0.5" placeholder="70" />
      </label>
      <label for="${prefix}-added">Lest du test (kg, négatif si assistance)
        <input id="${prefix}-added" name="added" type="number" inputmode="decimal" min="-100" max="150" step="0.5" placeholder="20" />
      </label>
    </div>
    <output id="${prefix}-out" class="calc-out" for="${prefix}-body ${prefix}-added" aria-live="polite">Entre ton poids et le lest de ton meilleur essai tenu 7 s.</output>
  </form>`;
}

export function describeLoads(result) {
  if (!result) return 'Entre ton poids et le lest de ton meilleur essai tenu 7 s.';
  const pct = Math.round(result.ratio * 100);
  const rows = result.rows.map(r => `${r.pct} % : ${formatKg(r.addedKg)}`).join(' · ');
  return `Ratio force/poids : ${pct} % (deux mains, 20 mm, 7 s). Lest pour tes Max Hangs de 10 s : ${rows}.`;
}
