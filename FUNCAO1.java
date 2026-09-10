import java.util.HashMap;
import java.util.List;
import java.util.Map;

record PerfilAlunoDTO(
    String nomeCompleto,
    Integer idade,
    String nivelSuporte,
    List<String> gatilhosSensoriais,
    String estiloAprendizagem,
    Integer tempoMaximoFoco
) {}

public class AdaptacaoPerfil {
    public Map<String, Object> cadastrarEGerarPlanoAdaptativo(PerfilAlunoDTO dto) {
        String temaInterface = "PADRAO_SUAVE";
        boolean utilizarPictogramas = false;
        int intervaloPausaRecomendado = dto.tempoMaximoFoco() / 2;

        if (dto.gatilhosSensoriais() != null
                && dto.gatilhosSensoriais().contains("Cores vivas")) {
            temaInterface = "MONOCROMATICO";
        }

        if ("Visual".equalsIgnoreCase(dto.estiloAprendizagem())
                && "Nivel_1".equalsIgnoreCase(dto.nivelSuporte())) {
            utilizarPictogramas = true;
        }

        int quantidadeGatilhos = dto.gatilhosSensoriais() == null
                ? 0
                : dto.gatilhosSensoriais().size();
        int toleranciaEstimulacao = Math.max(100 - quantidadeGatilhos * 20, 0);

        Map<String, Object> planoAdaptativo = new HashMap<>();
        planoAdaptativo.put("idAluno", System.currentTimeMillis());
        planoAdaptativo.put("nomeAluno", dto.nomeCompleto());
        planoAdaptativo.put("nivelSuporte", dto.nivelSuporte());
        planoAdaptativo.put("configuracaoUI", Map.of(
                "temaInterface", temaInterface,
                "utilizarPictogramas", utilizarPictogramas,
                "intervaloPausaRecomendado", intervaloPausaRecomendado,
                "toleranciaEstimulacao", toleranciaEstimulacao));
        planoAdaptativo.put("metricasAprendizagem", Map.of(
                "toleranciaEstimulacaoScore", toleranciaEstimulacao,
                "tempoMaximoFoco", dto.tempoMaximoFoco()));
        planoAdaptativo.put("status", "PERFIL_ADAPTATIVO_GERADO");
        return planoAdaptativo;
    }

    public static void main(String[] args) {
        PerfilAlunoDTO aluno = new PerfilAlunoDTO(
                "Aluno teste", 12, "Nivel_1", List.of("Cores vivas"), "Visual", 30);
        Map<String, Object> plano = new AdaptacaoPerfil()
                .cadastrarEGerarPlanoAdaptativo(aluno);
        System.out.println(plano);
    }
}