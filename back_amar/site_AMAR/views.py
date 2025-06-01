import re
from django.contrib.contenttypes.models import ContentType
from django.utils.dateparse import parse_date
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Agendamento,
    Usuario,
    Profissional,
    Estagiario,
    Disponibilidade
)
from .serializers import (
    AgendamentoSerializer,
    DisponibilidadeSerializer,
    UsuarioSerializer,
    ProfissionalSerializer,
    EstagiarioSerializer
)

# Utilitário
def normalizar_cpf(cpf):
    return re.sub(r'\D', '', cpf)


# CADASTRO
class CadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Usuário cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PreCadastroFuncionarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        tipo = data.get('tipo')
        cpf = normalizar_cpf(data.get('cpf', ''))
        nome = data.get('nome')
        matricula = data.get('matricula', '')
        telefone = data.get('telefone', '')
        tipo_servico = data.get('tipo_servico', '')
        dias = data.get('diasDisponiveis', [])
        horarios = data.get('horariosDisponiveis', [])

        if tipo == 'profissional':
            obj, created = Profissional.objects.get_or_create(
                cpf=cpf,
                defaults={
                    'nome': nome,
                    'matricula': matricula,
                    'telefone': telefone,
                    'tipo_servico': tipo_servico,
                }
            )
        elif tipo == 'estagiario':
            obj, created = Estagiario.objects.get_or_create(
                cpf=cpf,
                defaults={
                    'nome': nome,
                    'matricula': matricula,
                    'telefone': telefone,
                    'tipo_servico': tipo_servico,
                }
            )
        else:
            return Response({'error': 'Tipo inválido'}, status=status.HTTP_400_BAD_REQUEST)

        if not created:
            return Response({'error': 'Usuário com esse CPF já cadastrado.'}, status=status.HTTP_400_BAD_REQUEST)

        content_type = ContentType.objects.get_for_model(obj)
        Disponibilidade.objects.filter(content_type=content_type, object_id=obj.id).delete()

        for dia_str in dias:
            dia = parse_date(dia_str)
            if not dia:
                continue
            for horario in horarios:
                Disponibilidade.objects.create(
                    content_type=content_type,
                    object_id=obj.id,
                    dia=dia,
                    horario=horario
                )

        return Response({'detail': 'Pré-cadastro realizado com sucesso!'}, status=status.HTTP_201_CREATED)


# LISTAGENS
class UsuarioListView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]


class ProfissionalListView(generics.ListAPIView):
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer
    permission_classes = [AllowAny]


class EstagiarioListView(generics.ListAPIView):
    queryset = Estagiario.objects.all()
    serializer_class = EstagiarioSerializer
    permission_classes = [AllowAny]


# DETALHES E EXCLUSÃO
class UsuarioDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)


class ProfissionalDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            profissional = Profissional.objects.get(pk=pk)
            profissional.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Profissional.DoesNotExist:
            return Response({'error': 'Profissional não encontrado'}, status=status.HTTP_404_NOT_FOUND)


class EstagiarioDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            estagiario = Estagiario.objects.get(pk=pk)
            estagiario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Estagiario.DoesNotExist:
            return Response({'error': 'Estagiário não encontrado'}, status=status.HTTP_404_NOT_FOUND)


# AGENDAMENTO
class AgendamentoListCreateView(generics.ListCreateAPIView):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class AgendamentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from datetime import datetime
from .models import Agendamento

class AgendamentosPorDataView(APIView):
    def get(self, request, data):
        # Convertendo a data para o formato DateTime
        try:
            data_parsed = datetime.strptime(data, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Data inválida"}, status=400)

        # Passo 1: Buscar os horários disponíveis para a data
        disponibilidades = Disponibilidade.objects.filter(dia=data_parsed, status='disponivel')

        # Passo 2: Verificar quais desses horários já foram agendados
        agendamentos = Agendamento.objects.filter(dia=data_parsed, status='disponivel')

        # Obter os horários já agendados
        horarios_agendados = agendamentos.values_list('horario', flat=True)

        # Passo 3: Filtrar as disponibilidades para excluir os horários já agendados
        horarios_disponiveis = disponibilidades.exclude(horario__in=horarios_agendados)

        # Passo 4: Retornar os profissionais e horários disponíveis
        profissionais_disponiveis = [
            {"profissional": disponibilidade.profissional.nome, "horario": disponibilidade.horario}
            for disponibilidade in horarios_disponiveis
        ]

        if not profissionais_disponiveis:
            return Response({"message": "Nenhum horário disponível para esta data."}, status=404)

        return Response(profissionais_disponiveis)

from django.contrib.contenttypes.models import ContentType
from .models import Disponibilidade

@api_view(['GET'])
@permission_classes([AllowAny])
def listar_horarios_disponiveis(request):
    # Opcional: filtrar por data, se informado na query string
    data = request.query_params.get('dia')

    # ContentTypes para filtrar só Profissional e Estagiario
    prof_ct = ContentType.objects.get_for_model(Profissional)
    est_ct = ContentType.objects.get_for_model(Estagiario)

    # Filtra disponibilidades por dia e atendentes certos
    disponibilidades = Disponibilidade.objects.filter(
        content_type__in=[prof_ct, est_ct]
    )
    if data:
        disponibilidades = disponibilidades.filter(dia=data)

    resultado = []

    for disp in disponibilidades:
        # Verifica se já existe agendamento para essa disponibilidade (mesmo dia e horário)
        agendamento_existe = Agendamento.objects.filter(
            content_type=disp.content_type,
            object_id=disp.object_id,
            dia=disp.dia,
            horario=disp.horario,
            status='pendente'  # Considera agendamentos pendentes ocupando o horário
        ).exists()

        if not agendamento_existe:
            resultado.append({
                "id_disponibilidade": disp.id,
                "nome": disp.atendente.nome,
                "tipo_atendente": disp.content_type.model,  # 'profissional' ou 'estagiario'
                "dia": disp.dia,
                "horario": disp.horario,
            })

    return Response(resultado)


class DisponibilidadesPorDataView(APIView):
    def get(self, request, data):
        try:
            data_parsed = datetime.strptime(data, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de data inválido. Use YYYY-MM-DD."}, status=400)

        disponibilidades = Disponibilidade.objects.filter(dia=data_parsed)
        agendamentos_ocupados = Agendamento.objects.filter(
            dia=data_parsed,
        ).exclude(status='cancelado')

        ocupados_set = set(
            (a.content_type_id, a.object_id, a.horario) for a in agendamentos_ocupados
        )

        disponibilidades_livres = [
            d for d in disponibilidades
            if (d.content_type_id, d.object_id, d.horario) not in ocupados_set
        ]

        # Serialize the available times
        serializer = DisponibilidadeSerializer(disponibilidades_livres, many=True)
        
        if not serializer.data:
            return Response({"error": "Nenhuma disponibilidade encontrada para essa data."}, status=404)

        return Response(serializer.data)
