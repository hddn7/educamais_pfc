package com.projeto.pfc.service;

import com.projeto.pfc.dto.ativ_1409;
import com.projeto.pfc.dto.ativ_1409_1;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LocalhostServer {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        Path webRoot = Paths.get("front-end/ATIVIDADE_1409").toAbsolutePath().normalize();

        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            String fileName = "/".equals(path) ? "/indexativ.html" : path;
            Path file = webRoot.resolve(fileName.substring(1)).normalize();

            if (!file.startsWith(webRoot)) {
                sendText(exchange, 403, "Acesso negado");
                return;
            }

            if (Files.exists(file) && Files.isRegularFile(file)) {
                byte[] bytes = Files.readAllBytes(file);
                String contentType = mimeType(file.getFileName().toString());
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(bytes);
                }
                return;
            }

            sendText(exchange, 404, "Arquivo nao encontrado");
        });

        server.createContext("/api/health", exchange -> {
            sendJson(exchange, 200, "{\"status\":\"ok\"}");
        });

        server.createContext("/api/plano/adaptativo", exchange -> {
            try {
                if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendJson(exchange, 405, "{\"erro\":\"Metodo nao permitido. Use POST.\"}");
                    return;
                }

                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                ativ_1409 req = parseRequest(body);
                ativ_1409_1 res = new ativ_1409_2().gerarPlano(req);
                sendJson(exchange, 200, toJson(res));
            } catch (Exception e) {
                sendJson(exchange, 400, "{\"erro\":\"JSON invalido ou faltando campos.\"}");
            }
        });

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("Servidor rodando em http://localhost:8080");
        System.out.println("Pagina: http://localhost:8080/indexativ.html");
        System.out.println("API: http://localhost:8080/api/plano/adaptativo");
    }

    private static ativ_1409 parseRequest(String json) {
        ativ_1409 req = new ativ_1409();
        req.setNomeAluno(extractString(json, "nomeAluno"));
        req.setTempoFocoHoras(extractInt(json, "tempoFocoHoras"));
        req.setTempoFocoMinutos(extractInt(json, "tempoFocoMinutos"));
        req.setSensibilidadeCoresVivas(extractBoolean(json, "sensibilidadeCoresVivas"));
        req.setUtilizarPictogramas(extractBoolean(json, "utilizarPictogramas"));
        return req;
    }

    private static String extractString(String json, String key) {
        Pattern p = Pattern.compile("\\\"" + key + "\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"");
        Matcher m = p.matcher(json);
        return m.find() ? m.group(1) : "";
    }

    private static int extractInt(String json, String key) {
        Pattern p = Pattern.compile("\\\"" + key + "\\\"\\s*:\\s*(\\d+)");
        Matcher m = p.matcher(json);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }

    private static boolean extractBoolean(String json, String key) {
        Pattern p = Pattern.compile("\\\"" + key + "\\\"\\s*:\\s*(true|false)");
        Matcher m = p.matcher(json);
        return m.find() && Boolean.parseBoolean(m.group(1));
    }

    private static String toJson(ativ_1409_1 res) {
        return "{\n"
                + "  \"aluno\": \"" + res.getAluno() + "\",\n"
                + "  \"temaInterface\": \"" + res.getTemaInterface() + "\",\n"
                + "  \"pausaRecomendada\": \"" + res.getPausaRecomendada() + "\",\n"
                + "  \"toleranciaEstimulacao\": \"" + res.getToleranciaEstimulacao() + "\",\n"
                + "  \"utilizarPictogramas\": \"" + res.getUtilizarPictogramas() + "\"\n"
                + "}";
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] payload = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, payload.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(payload);
        }
    }

    private static void sendText(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] payload = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, payload.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(payload);
        }
    }

    private static String mimeType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".html")) return "text/html; charset=UTF-8";
        if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
        if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (lower.endsWith(".json")) return "application/json; charset=UTF-8";
        return "application/octet-stream";
    }
}
