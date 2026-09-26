CREATE database IF NOT EXISTS pfc_aprendizagem
	character set utf8mb4 collate utf8mb4_unicode_ci;
use pfc_aprendizagem;

CREATE TABLE usuarios (
id BIGINT auto_increment primary key,
nome varchar(120) not null,
email varchar(160) not null unique,
senha_hash varchar(72) not null,
papel varchar(20) not null default 'ALUNO',
documento_enc varchar(512) null,
ativo tinyint(1) not null default 1,
criado_em timestamp not null default current_timestamp) engine=InnoDB;

create table materias (
id bigint auto_increment primary key,
nome varchar(100) not null unique) engine=InnoDB;

create table assuntos (
id bigint auto_increment primary key,
materia_id bigint not null,
nome varchar(120) not null,
CONSTRAINT fk_assunto_materia FOREIGN KEY (materia_id) REFERENCES materias(id),
  UNIQUE KEY uk_assunto (materia_id, nome)
) ENGINE=InnoDB;

create table questoes (
 id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  professor_id     BIGINT NOT NULL,
  assunto_id       BIGINT NOT NULL,
  enunciado        TEXT NOT NULL,
  resposta_esperada TEXT NOT NULL,
  dificuldade      VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
  ativa            TINYINT(1) NOT NULL DEFAULT 1,
  criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_questao_prof FOREIGN KEY (professor_id) REFERENCES usuarios(id),
  CONSTRAINT fk_questao_assunto FOREIGN KEY (assunto_id) REFERENCES assuntos(id)
) ENGINE=InnoDB;

