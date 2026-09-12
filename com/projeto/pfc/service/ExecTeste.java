package com.projeto.pfc.service;

import com.projeto.pfc.dto.ativ_1409;
import com.projeto.pfc.dto.ativ_1409_1;

public class ExecTeste {
    public static void main(String[] args) {
        ativ_1409 req = new ativ_1409();
        req.setNomeAluno("Ana");
        req.setTempoFocoHoras(1);
        req.setTempoFocoMinutos(30);
        req.setSensibilidadeCoresVivas(true);
        req.setUtilizarPictogramas(true);

        ativ_1409_2 service = new ativ_1409_2();
        ativ_1409_1 res = service.gerarPlano(req);

        System.out.println("Aluno: " + res.getAluno());
        System.out.println("Tema: " + res.getTemaInterface());
        System.out.println("Pausa: " + res.getPausaRecomendada());
        System.out.println("Tolerancia: " + res.getToleranciaEstimulacao());
        System.out.println("Pictogramas: " + res.getUtilizarPictogramas());
    }
}
