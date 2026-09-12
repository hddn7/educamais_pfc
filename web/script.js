document.getElementById('formPlano').addEventListener('submit', async function (event) {
    event.preventDefault();

    const payload = {
        nomeAluno: document.getElementById('nomeAluno').value,
        tempoFocoHoras: Number(document.getElementById('tempoFocoHoras').value),
        tempoFocoMinutos: Number(document.getElementById('tempoFocoMinutos').value),
        sensibilidadeCoresVivas: document.getElementById('sensibilidadeCoresVivas').checked,
        utilizarPictogramas: document.getElementById('utilizarPictogramas').checked
    };

    const response = await fetch('http://localhost:8080/api/plano/adaptativo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    document.getElementById('resultadoAluno').textContent = result.aluno || '-';
    document.getElementById('resultadoTema').textContent = result.temaInterface || '-';
    document.getElementById('resultadoPausa').textContent = result.pausaRecomendada || '-';
    document.getElementById('resultadoTolerancia').textContent = result.toleranciaEstimulacao || '-';
    document.getElementById('resultadoPictogramas').textContent = result.utilizarPictogramas || '-';
});
