import os
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS

db = os.path.join(os.path.dirname(__file__), "taskflow.db")

STATUS_VALIDOS = {"A Fazer", "Em Andamento", "Concluído"}

app = Flask(__name__)
CORS(app)


def conectar():
    c = sqlite3.connect(db)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c


def email_gmail_ok(email):
    e = (email or "").strip().lower()
    return e.endswith("@gmail.com")


def criar_tabelas():
    c = conectar()
    try:
        c.executescript(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            );
            CREATE TABLE IF NOT EXISTS tarefas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descricao TEXT NOT NULL,
                status TEXT NOT NULL,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
            );
            CREATE TABLE IF NOT EXISTS tarefas_excluidas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                descricao TEXT NOT NULL,
                status TEXT NOT NULL,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
            );
            """
        )
        c.commit()
    finally:
        c.close()


criar_tabelas()


@app.route("/api/usuarios", methods=["GET"])
def usuarios_get():
    c = conectar()
    try:
        linhas = c.execute("SELECT id, nome, email FROM usuarios ORDER BY id").fetchall()
        return jsonify([dict(x) for x in linhas])
    finally:
        c.close()


@app.route("/api/usuarios", methods=["POST"])
def usuarios_post():
    j = request.get_json() or {}
    nome = (j.get("nome") or "").strip()
    email = (j.get("email") or "").strip()
    if not nome or not email:
        return jsonify({"erro": "Preencha todos os campos"}), 400
    if not email_gmail_ok(email):
        return jsonify({"erro": "Email invalido"}), 400
    email = email.strip().lower()
    c = conectar()
    try:
        try:
            cur = c.execute(
                "INSERT INTO usuarios (nome, email) VALUES (?, ?)", (nome, email)
            )
            c.commit()
            novo_id = cur.lastrowid
        except sqlite3.IntegrityError:
            c.rollback()
            return jsonify({"erro": "Email ja cadastrado"}), 400
        return jsonify({"id": novo_id, "nome": nome, "email": email})
    finally:
        c.close()


@app.route("/api/tarefas", methods=["GET"])
def tarefas_get():
    c = conectar()
    try:
        linhas = c.execute(
            """
            SELECT t.id, t.titulo, t.descricao, t.status, u.nome, u.email
            FROM tarefas t
            JOIN usuarios u ON t.usuario_id = u.id
            ORDER BY t.id
            """
        ).fetchall()
        lista = []
        for x in linhas:
            lista.append(
                {
                    "id": x["id"],
                    "titulo": x["titulo"],
                    "descricao": x["descricao"],
                    "status": x["status"],
                    "responsavel": {"nome": x["nome"], "email": x["email"]},
                }
            )
        return jsonify(lista)
    finally:
        c.close()


@app.route("/api/tarefas", methods=["POST"])
def tarefas_post():
    j = request.get_json() or {}
    titulo = (j.get("titulo") or "").strip()
    descricao = (j.get("descricao") or "").strip()
    status = (j.get("status") or "A Fazer").strip()
    if status not in STATUS_VALIDOS:
        status = "A Fazer"
    uid = j.get("usuario_id")
    if not titulo or not descricao:
        return jsonify({"erro": "Falta titulo ou descricao"}), 400
    try:
        uid = int(uid)
    except (TypeError, ValueError):
        return jsonify({"erro": "Usuario invalido"}), 400
    c = conectar()
    try:
        existe = c.execute("SELECT id FROM usuarios WHERE id = ?", (uid,)).fetchone()
        if not existe:
            return jsonify({"erro": "Usuario nao existe"}), 400
        cur = c.execute(
            "INSERT INTO tarefas (titulo, descricao, status, usuario_id) VALUES (?, ?, ?, ?)",
            (titulo, descricao, status, uid),
        )
        c.commit()
        return jsonify({"id": cur.lastrowid})
    except sqlite3.IntegrityError:
        c.rollback()
        return jsonify({"erro": "Usuario invalido"}), 400
    finally:
        c.close()


@app.route("/api/tarefas/<int:tarefa_id>/concluir", methods=["PATCH"])
def tarefa_concluir(tarefa_id):
    c = conectar()
    try:
        r = c.execute(
            "UPDATE tarefas SET status = ? WHERE id = ?", ("Concluído", tarefa_id)
        )
        c.commit()
        if r.rowcount == 0:
            return jsonify({"erro": "Nao achou"}), 404
        return jsonify({"ok": True})
    finally:
        c.close()


@app.route("/api/tarefas/<int:tarefa_id>/excluir", methods=["POST"])
def tarefa_excluir(tarefa_id):
    c = conectar()
    try:
        t = c.execute(
            "SELECT titulo, descricao, status, usuario_id FROM tarefas WHERE id = ?",
            (tarefa_id,),
        ).fetchone()
        if not t:
            return jsonify({"erro": "Nao achou"}), 404
        c.execute(
            "INSERT INTO tarefas_excluidas (titulo, descricao, status, usuario_id) VALUES (?, ?, ?, ?)",
            (t["titulo"], t["descricao"], t["status"], t["usuario_id"]),
        )
        c.execute("DELETE FROM tarefas WHERE id = ?", (tarefa_id,))
        c.commit()
        return jsonify({"ok": True})
    except sqlite3.IntegrityError:
        c.rollback()
        return jsonify({"erro": "Erro ao excluir"}), 400
    finally:
        c.close()


@app.route("/api/tarefas-excluidas", methods=["GET"])
def excluidas_get():
    c = conectar()
    try:
        linhas = c.execute(
            """
            SELECT e.titulo, e.descricao, e.status, u.nome, u.email
            FROM tarefas_excluidas e
            JOIN usuarios u ON e.usuario_id = u.id
            ORDER BY e.id
            """
        ).fetchall()
        lista = []
        for x in linhas:
            lista.append(
                {
                    "titulo": x["titulo"],
                    "descricao": x["descricao"],
                    "status": x["status"],
                    "responsavel": {"nome": x["nome"], "email": x["email"]},
                }
            )
        return jsonify(lista)
    finally:
        c.close()


if __name__ == "__main__":
    app.run(debug=True)
