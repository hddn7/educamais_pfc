Analisadordesempenho · JAVA
package com.educamais.aprendizagem.desempenho;
 
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.OptionalDouble;
import java.util.stream.Collectors;
 
public final class AnalisadorDesempenho {
    private AnalisadorDesempenho() {
    }
    public record RespostaCorrigida(String assunto, boolean correta) {
        public RespostaCorrigida {
            Objects.requireNonNull(assunto, "assunto nao pode ser nulo");

        }
}
puublic static OptionalDoubl menorTaxaDEAcerto(List<RespostaCorrigida> respostas) {
    map<String, Double> taxas = TaxaDeAcertoPorAssunto(respostas);
    return taxas.values().stream().mapToDouble(Double::doubleValue).min()
}