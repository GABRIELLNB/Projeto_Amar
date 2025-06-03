import re
from django.contrib.contenttypes.models import ContentType
from django.utils.dateparse import parse_date
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from .models import Agendamento

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

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

# View para autenticação personalizada usando JWT
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# Utilitário
def normalizar_cpf(cpf):
    return re.sub(r'\D', '', cpf)


# View para cadastro de usuários comuns (usuário normal)
class CadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Usuário cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View para pré-cadastro de funcionários (profissional ou estagiário)
# Também cadastra suas disponibilidades para atendimento
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
        disponibilidades = data.get('disponibilidades', [])
        local = data.get('local', None)
        sala = data.get('sala', None)

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

        for disp in disponibilidades:
            dia_str = disp.get('dia')
            horarios = disp.get('horarios', [])

            dia = parse_date(dia_str)
            if not dia:
                continue

            for horario in horarios:
                Disponibilidade.objects.create(
                    content_type=content_type,
                    object_id=obj.id,
                    dia=dia,
                    horario=horario,
                    local=local,
                    sala=sala
                )

        return Response({'detail': 'Pré-cadastro realizado com sucesso!'}, status=status.HTTP_201_CREATED)


# LISTAGENS

# View para listar todos os usuários comuns cadastrados
class UsuarioListView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

# View para listar todos os profissionais cadastrados
class ProfissionalListView(generics.ListAPIView):
    queryset = Profissional.objects.all()
    serializer_class = ProfissionalSerializer
    permission_classes = [AllowAny]

# View para listar todos os estagiários cadastrados
class EstagiarioListView(generics.ListAPIView):
    queryset = Estagiario.objects.all()
    serializer_class = EstagiarioSerializer
    permission_classes = [AllowAny]


# View para detalhar e deletar um usuário comum pelo id (pk)
class UsuarioDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado'}, status=status.HTTP_404_NOT_FOUND)


# View para detalhar e deletar um profissional pelo id (pk)
class ProfissionalDetailView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            profissional = Profissional.objects.get(pk=pk)
            profissional.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Profissional.DoesNotExist:
            return Response({'error': 'Profissional não encontrado'}, status=status.HTTP_404_NOT_FOUND)


# View para detalhar e deletar um estagiário pelo id (pk)
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
# View para listar e criar agendamentos com autenticação obrigatória
class AgendamentoListCreateView(generics.ListCreateAPIView):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

# View para detalhar, atualizar e deletar agendamento com autenticação obrigatória
class AgendamentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]


# View para listar horários disponíveis por data (filtragem e exclusão de horários já agendados)
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
        agendamentos = Agendamento.objects.filter(
            dia=data_parsed,
            status__in=['pendente', 'confirmado']
        )

        # Obter os horários já agendados
        horarios_agendados = agendamentos.values_list('horario', flat=True)

        # Passo 3: Filtrar as disponibilidades para excluir os horários já agendados
        horarios_disponiveis = disponibilidades.exclude(horario__in=horarios_agendados)

        # Passo 4: Retornar os profissionais e horários disponíveis
        profissionais_disponiveis = [
            {"profissional": disponibilidade.atendente.nome, "horario": disponibilidade.horario, "sala": disponibilidade.sala,
        "local": disponibilidade.local,}
            for disponibilidade in horarios_disponiveis
        ]

        if not profissionais_disponiveis:
            return Response({"message": "Nenhum horário disponível para esta data."}, status=404)

        return Response(profissionais_disponiveis)
    
    
# View para cancelar um agendamento específico (somente usuários autenticados)
class CancelarAgendamentoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            agendamento = Agendamento.objects.get(pk=pk)
        except Agendamento.DoesNotExist:
            return Response({"error": "Agendamento não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if agendamento.status == "cancelado":
            return Response({"detail": "Agendamento já está cancelado."}, status=status.HTTP_400_BAD_REQUEST)

        # Se quiser, pode adicionar verificação se o usuário tem permissão para cancelar aqui
        # Exemplo: if agendamento.usuario != request.user: return 403 forbidden

        agendamento.status = "cancelado"
        agendamento.save()

        return Response({"detail": "Agendamento cancelado com sucesso."}, status=status.HTTP_200_OK)


# View para listar disponibilidades livres em uma data, excluindo horários já ocupados por agendamentos
class DisponibilidadesPorDataView(APIView):
    def get(self, request, data):
        try:
            data_parsed = datetime.strptime(data, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Formato de data inválido. Use YYYY-MM-DD."}, status=400)

        disponibilidades = Disponibilidade.objects.filter(dia=data_parsed)
        agendamentos_ocupados = Agendamento.objects.filter(dia=data_parsed).exclude(status='cancelado')

        ocupados_set = set(
            (a.content_type_id, a.object_id, a.horario) for a in agendamentos_ocupados
        )

        disponibilidades_livres = [
            d for d in disponibilidades
            if (d.content_type_id, d.object_id, d.horario) not in ocupados_set
        ]

        serializer = DisponibilidadeSerializer(disponibilidades_livres, many=True)
        
        if not serializer.data:
            return Response({"error": "Nenhuma disponibilidade encontrada para essa data."}, status=404)

        return Response(serializer.data)




'''
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
'''
