from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from collections import defaultdict
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = "chave_super_secreta"  # chave da sessão (necessária para login)

# Configuração do banco de dados SQLite
base_dir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(base_dir, 'barbearia.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modelo de dados
class Agendamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    servico = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(20), nullable=False)  # salva como texto YYYY-MM-DD vindo do <input type="date">
    hora = db.Column(db.String(20), nullable=False)

# Cria o banco de dados
with app.app_context():
    db.create_all()

# --- PÁGINA PRINCIPAL (Agendamento) ---
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        nome = request.form["nome"]
        telefone = request.form["telefone"]
        servico = request.form["servico"]
        data = request.form["data"]  # vem em formato YYYY-MM-DD
        hora = request.form["hora"]

        novo_agendamento = Agendamento(
            nome=nome,
            telefone=telefone,
            servico=servico,
            data=data,
            hora=hora
        )
        db.session.add(novo_agendamento)
        db.session.commit()

        return redirect(url_for("confirmacao", nome=nome, servico=servico, data=data, hora=hora))

    return render_template("index.html")

# --- CONFIRMAÇÃO ---
@app.route("/confirmacao")
def confirmacao():
    nome = request.args.get("nome")
    servico = request.args.get("servico")
    data = request.args.get("data")
    hora = request.args.get("hora")

    # Converte data para DD/MM/YYYY
    try:
        data = datetime.strptime(data, "%Y-%m-%d").strftime("%d/%m/%Y")
    except:
        pass

    return render_template("confirmacao.html", nome=nome, servico=servico, data=data, hora=hora)

# --- LOGIN ---
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        senha = request.form["senha"]
        if senha == "admin007":  # senha fixa
            session["logado"] = True
            return redirect(url_for("agendamentos"))
        else:
            return render_template("login.html", erro="Senha incorreta!")
    return render_template("login.html")

# --- LOGOUT ---
@app.route("/logout")
def logout():
    session.pop("logado", None)
    return redirect(url_for("login"))

# --- ÁREA RESTRITA (Agendamentos) ---
@app.route("/agendamentos")
def agendamentos():
    if not session.get("logado"):
        return redirect(url_for("login"))

    # Buscar todos os agendamentos ordenados
    lista = Agendamento.query.order_by(Agendamento.data, Agendamento.hora).all()

    # Agrupar por data no formato DD/MM/YYYY
    agendamentos_por_data = defaultdict(list)
    for ag in lista:
        try:
            data_formatada = datetime.strptime(ag.data, "%Y-%m-%d").strftime("%d/%m/%Y")
        except:
            data_formatada = ag.data

        agendamentos_por_data[data_formatada].append({
            "id": ag.id,
            "nome": ag.nome,
            "telefone": ag.telefone,
            "servico": ag.servico,
            "data": data_formatada,
            "hora": ag.hora
        })

    return render_template(
        "agendamentos.html",
        agendamentos_por_data=agendamentos_por_data,
        agendamentos_json=json.dumps(agendamentos_por_data, ensure_ascii=False)
    )

# --- API para buscar agendamentos de uma data específica ---
@app.route("/api/agendamentos/<data>")
def api_agendamentos_data(data):
    if not session.get("logado"):
        return jsonify({"erro": "Não autorizado"}), 401

    # Converter data recebida (DD-MM-YYYY ou DD/MM/YYYY) para YYYY-MM-DD
    try:
        data_convertida = datetime.strptime(data, "%d-%m-%Y").strftime("%Y-%m-%d")
    except:
        try:
            data_convertida = datetime.strptime(data, "%d/%m/%Y").strftime("%Y-%m-%d")
        except:
            data_convertida = data

    # Buscar agendamentos da data específica
    agendamentos = Agendamento.query.filter_by(data=data_convertida).order_by(Agendamento.hora).all()

    resultado = []
    for ag in agendamentos:
        try:
            data_formatada = datetime.strptime(ag.data, "%Y-%m-%d").strftime("%d/%m/%Y")
        except:
            data_formatada = ag.data

        resultado.append({
            "id": ag.id,
            "nome": ag.nome,
            "telefone": ag.telefone,
            "servico": ag.servico,
            "data": data_formatada,
            "hora": ag.hora
        })

    return jsonify(resultado)

if __name__ == "__main__":
    app.run(debug=True)
