from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from collections import defaultdict
from datetime import datetime, time, timedelta
import uuid

# Configuração do Flask
app = Flask(__name__)
app.secret_key = "chave_super_secreta"

# --- CONFIGURAÇÃO DO BANCO DE DADOS MYSQL ---
# Substituindo a configuração SQLite pela do MySQL para o XAMPP
# O usuário padrão é 'root' e a senha é vazia. O nome do banco de dados é 'barbearia'.
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root@localhost/barbearia'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELOS DE DADOS ---
# Renomeei a classe para 'Agendamento' e 'Servico' para seguir o padrão de nomenclatura.


class Agendamento(db.Model):
    __tablename__ = 'agendamento'  # Garante que a tabela se chame 'agendamento'
    # Alterado para String para usar UUID, que é mais seguro
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    servico = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(20), nullable=False)
    hora = db.Column(db.String(20), nullable=False)


class Servico(db.Model):
    __tablename__ = 'servicos'  # Garante que a tabela se chame 'servicos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False, unique=True)
    preco = db.Column(db.Float, nullable=False)
    descricao = db.Column(db.String(255), nullable=True)


class HorarioConfiguracao(db.Model):
    # Garante que a tabela se chame 'horario_configuracao'
    __tablename__ = 'horario_configuracao'
    id = db.Column(db.Integer, primary_key=True)
    dia_semana = db.Column(db.String(20), nullable=False, unique=True)
    abertura = db.Column(db.String(5), nullable=False)
    fechamento = db.Column(db.String(5), nullable=False)


# Cria o banco de dados e as tabelas se não existirem
with app.app_context():
    db.create_all()

    # Verifica se a tabela Servico está vazia e a popula
    if Servico.query.count() == 0:
        servicos_iniciais = [
            {"nome": "Corte Simples", "preco": 30.00,
                "descricao": "✂️ Corte Simples - R$ 30,00"},
            {"nome": "Corte + Barba", "preco": 50.00,
                "descricao": "✂️🧔 Corte + Barba - R$ 50,00"},
            {"nome": "Barba", "preco": 25.00,
                "descricao": "🧔 Apenas Barba - R$ 25,00"},
            {"nome": "Corte Premium", "preco": 45.00,
                "descricao": "✨ Corte Premium - R$ 45,00"},
            {"nome": "Pacote Completo", "preco": 70.00,
                "descricao": "🎩 Pacote Completo - R$ 70,00"},
        ]
        for s in servicos_iniciais:
            servico = Servico(
                nome=s["nome"], preco=s["preco"], descricao=s["descricao"])
            db.session.add(servico)
        db.session.commit()
        print("Serviços iniciais populados no banco de dados.")

# --- ROTAS DA ÁREA DO CLIENTE ---


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        nome = request.form["nome"]
        telefone = request.form["telefone"]
        servico = request.form["servico"]
        data = request.form["data"]
        hora = request.form["hora"]

        novo_agendamento = Agendamento(
            nome=nome, telefone=telefone, servico=servico, data=data, hora=hora)
        db.session.add(novo_agendamento)
        db.session.commit()

        agendamento_id = novo_agendamento.id

        return redirect(url_for("confirmacao",
                                nome=nome,
                                servico=servico,
                                data=data,
                                hora=hora,
                                id=agendamento_id))

    servicos = Servico.query.all()
    return render_template("index.html", servicos=servicos)


@app.route("/confirmacao")
def confirmacao():
    nome = request.args.get("nome")
    servico = request.args.get("servico")
    data = request.args.get("data")
    hora = request.args.get("hora")
    agendamento_id = request.args.get("id")

    return render_template("confirmacao.html",
                           nome=nome,
                           servico=servico,
                           data=data,
                           hora=hora,
                           id=agendamento_id)


@app.route("/cancelar", methods=["GET", "POST"])
@app.route("/cancelar/<string:id_agendamento>", methods=["GET"])
def cancelar_agendamento(id_agendamento=None):
    id_a_cancelar = id_agendamento
    if request.method == "POST":
        id_a_cancelar = request.form.get("id_cancelar")

    if not id_a_cancelar:
        return redirect(url_for("confirmacao_cancelamento", status="erro"))

    agendamento = Agendamento.query.get(id_a_cancelar)

    if agendamento:
        db.session.delete(agendamento)
        db.session.commit()
        return redirect(url_for("confirmacao_cancelamento", status="sucesso"))
    else:
        return redirect(url_for("confirmacao_cancelamento", status="nao_encontrado"))


@app.route("/cancelamento-confirmado")
def confirmacao_cancelamento():
    status = request.args.get("status")
    return render_template("cancelamento_confirmado.html", status=status)

# --- ROTAS DA ÁREA ADMIN ---


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        senha = request.form["senha"]
        if senha == "admin123":
            session["logado"] = True
            return redirect(url_for("agendamentos"))
        else:
            return render_template("login.html", erro="Senha incorreta. Tente novamente.")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("logado", None)
    return redirect(url_for("index"))


@app.route("/agendamentos")
def agendamentos():
    if not session.get("logado"):
        return redirect(url_for("login"))

    lista = Agendamento.query.order_by(
        Agendamento.data, Agendamento.hora).all()

    agendamentos_por_data = defaultdict(list)
    for ag in lista:
        try:
            data_formatada = datetime.strptime(
                ag.data, "%Y-%m-%d").strftime("%d/%m/%Y")
        except ValueError:
            data_formatada = ag.data
        agendamentos_por_data[data_formatada].append({
            "id": ag.id,
            "nome": ag.nome,
            "telefone": ag.telefone,
            "servico": ag.servico,
            "data": data_formatada,
            "hora": ag.hora
        })

    import json
    return render_template(
        "agendamentos.html",
        agendamentos_por_data=agendamentos_por_data,
        agendamentos_json=json.dumps(agendamentos_por_data, ensure_ascii=False)
    )


@app.route("/gerenciar-servicos", methods=["GET", "POST"])
def gerenciar_servicos():
    if not session.get("logado"):
        return redirect(url_for("login"))

    if request.method == "POST":
        if request.is_json:
            data = request.json
            db.session.query(HorarioConfiguracao).delete()
            for dia, horarios in data.items():
                if horarios['aberto']:
                    nova_config = HorarioConfiguracao(
                        dia_semana=dia,
                        abertura=horarios['abertura'],
                        fechamento=horarios['fechamento']
                    )
                    db.session.add(nova_config)

            db.session.commit()
            return jsonify({"message": "Configuração de horários salva com sucesso!"})
        else:
            acao = request.form.get("acao")

            if acao == "adicionar":
                nome = request.form.get("nome")
                preco = request.form.get("preco")
                descricao = request.form.get("descricao")
                if nome and preco:
                    try:
                        novo_servico = Servico(
                            nome=nome, preco=float(preco), descricao=descricao)
                        db.session.add(novo_servico)
                        db.session.commit()
                    except:
                        db.session.rollback()

            elif acao == "remover":
                servico_id = request.form.get("servico_id")
                servico_a_remover = Servico.query.get(servico_id)
                if servico_a_remover:
                    db.session.delete(servico_a_remover)
                    db.session.commit()

            return redirect(url_for("gerenciar_servicos"))

    servicos = Servico.query.all()

    dias_semana_ordem = ["Segunda", "Terça", "Quarta",
                         "Quinta", "Sexta", "Sábado", "Domingo"]
    configuracao_atual = {c.dia_semana: {"abertura": c.abertura, "fechamento": c.fechamento, "aberto": True}
                          for c in HorarioConfiguracao.query.all()}
    configuracao_completa = {dia: configuracao_atual.get(dia, {"abertura": "", "fechamento": "", "aberto": False})
                             for dia in dias_semana_ordem}

    return render_template("gerenciar_servicos.html",
                           servicos=servicos,
                           configuracao_completa=configuracao_completa)


@app.route("/api/horarios/<data>")
def api_horarios(data):
    try:
        data_convertida = datetime.strptime(data, "%Y-%m-%d")
        dia_semana_nome = data_convertida.strftime('%A')
        dias_em_portugues = {
            'Monday': 'Segunda', 'Tuesday': 'Terça', 'Wednesday': 'Quarta',
            'Thursday': 'Quinta', 'Friday': 'Sexta', 'Saturday': 'Sábado',
            'Sunday': 'Domingo'
        }
        dia_semana_pt = dias_em_portugues.get(dia_semana_nome)
    except ValueError:
        return jsonify({"erro": "Formato de data inválido"}), 400

    config_do_dia = HorarioConfiguracao.query.filter_by(
        dia_semana=dia_semana_pt).first()

    if not config_do_dia:
        return jsonify([])

    abertura = datetime.strptime(config_do_dia.abertura, "%H:%M").time()
    fechamento = datetime.strptime(config_do_dia.fechamento, "%H:%M").time()

    horarios_disponiveis = []

    hora_loop = datetime.combine(datetime.min, abertura)
    fechamento_datetime = datetime.combine(datetime.min, fechamento)

    while hora_loop < fechamento_datetime:
        horario_str = hora_loop.strftime("%H:%M")
        horarios_disponiveis.append(horario_str)
        hora_loop += timedelta(minutes=30)

    hoje_data = datetime.now().date()
    hora_atual = datetime.now().time()
    if data_convertida.date() == hoje_data:
        horarios_disponiveis = [
            h for h in horarios_disponiveis if time.fromisoformat(h) > hora_atual]

    agendamentos_do_dia = Agendamento.query.filter_by(data=data).all()
    horarios_ocupados = [ag.hora for ag in agendamentos_do_dia]

    horarios_filtrados = [
        h for h in horarios_disponiveis if h not in horarios_ocupados]

    return jsonify(horarios_filtrados)


@app.route("/remover-agendamento", methods=["POST"])
def remover_agendamento():
    if not session.get("logado"):
        return redirect(url_for("login"))

    agendamento_id = request.form.get("agendamento_id")
    agendamento_a_remover = Agendamento.query.get(agendamento_id)

    if agendamento_a_remover:
        db.session.delete(agendamento_a_remover)
        db.session.commit()

    return redirect(url_for("agendamentos"))


if __name__ == "__main__":
    app.run(debug=True)
