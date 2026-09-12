package com.projeto.pfc.service;

import com.projeto.pfc.dto.ativ_1409;
import com.projeto.pfc.dto.ativ_1409_1;

public class ativ_1409_2 {
    public ativ_1409_1 gerarPlano(ativ_1409 req) {
        ativ_1409_1 res = new ativ_1409_1();
        res.setAluno(req.getNomeAluno());

        if (req.isSensibilidadeCoresVivas()) {
            res.setTemaInterface("Monocromático");
        } else {
            res.setTemaInterface("Padrão suave");
        }

        int totalMinutos = (req.getTempoFocoHoras() * 60) + req.getTempoFocoMinutos();
        int minutosPausa = (int) Math.round(totalMinutos * 0.5);
        res.setPausaRecomendada(minutosPausa + " minutos");

        int tolerancia = req.isSensibilidadeCoresVivas() ? 60 : 100;
        res.setToleranciaEstimulacao(tolerancia + "%");

        res.setUtilizarPictogramas(req.isUtilizarPictogramas() ? "Sim" : "Não");
        return res;
    }

    public static void main(String[] args) {
        ativ_1409 req = new ativ_1409();
        req.setNomeAluno("Ana");
        req.setTempoFocoHoras(1);
        req.setTempoFocoMinutos(30);
        req.setSensibilidadeCoresVivas(true);
        req.setUtilizarPictogramas(true);

        ativ_1409_1 res = new ativ_1409_2().gerarPlano(req);

        System.out.println("Aluno: " + res.getAluno());
        System.out.println("Tema: " + res.getTemaInterface());
        System.out.println("Pausa: " + res.getPausaRecomendada());
        System.out.println("Tolerancia: " + res.getToleranciaEstimulacao());
        System.out.println("Pictogramas: " + res.getUtilizarPictogramas());
    }
}