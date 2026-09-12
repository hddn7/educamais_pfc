import com.pfc.projeto.dto.ativ1409;
import com.pfc.projeto.dto.ativ1409_1;
import org.springframework.stereotype.Service;

@service
public class ativ1409_2{
    public ativ1409_1 gerarPlano(ativ1409req){
        ativ1409_1 res = new ativ1409_1();
        res.setAluno(req.getNomeAluno());

        if (req.isSensibilidadeCoresVivas()) {
            res.setTemaInterface("Monocromático");
        } else {
            res.setTemaInterface("Padrão suave");
        }

        int totalMinutos = (req.getTempoFocoHoras() * 60) + req.getTempoFocoMinutos();
        int minutosPausa = (int) Math.round(totalMinutos * 0.5);
        res.setTempoDescanso(minutosPausa + " minutos");

        int tolerancia = req.isSensibilidadeCoresVivas() ? 60 : 100;
        res.setToleranciaEstimulacao(tolerancia + "%");

        res.setUtilizarPictogramas(req.isUtilizarPictogramas() ? "Sim" : "Não");
        return res;
    }
}