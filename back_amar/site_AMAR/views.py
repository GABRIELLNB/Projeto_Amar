from itertools import count
import re
from urllib import request
from arrow import now
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.utils.dateparse import parse_date
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from .models import Agendamento, ForumCurtida
from django.db.models import Count
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics
from .models import Agendamento, Profissional, Estagiario
from .serializers import AgendamentoSerializer
from django.utils import timezone
from .models import Agendamento, Forums
from .serializers import ForumsSerializer
from datetime import date
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now

from .models import (
    Agendamento,
    Usuario,
    Profissional,
    Estagiario,
    Disponibilidade,
    Forums,
    MensagemForum
)
from .serializers import (
    AgendamentoSerializer,
    DisponibilidadeSerializer,
    ForumsSerializer,
    UsuarioSerializer,
    ProfissionalSerializer,
    EstagiarioSerializer,
    MensagemForumSerializer
)

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

# View para autenticação personalizada usando JWT
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    def get_serializer_context(self):
        return {'request': self.request}

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

    def put(self, request, tipo, cpf):
        if not cpf:
            return Response({'error': 'CPF não informado na URL.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        cpf_normalizado = normalizar_cpf(cpf)

        if cpf_normalizado != normalizar_cpf(data.get('cpf', '')):
            return Response({'error': 'Não é permitido alterar o CPF.'}, status=status.HTTP_400_BAD_REQUEST)

        if tipo == 'profissional':
            try:
                obj = Profissional.objects.get(cpf=cpf_normalizado)
            except Profissional.DoesNotExist:
                return Response({'error': 'Profissional não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        elif tipo == 'estagiario':
            try:
                obj = Estagiario.objects.get(cpf=cpf_normalizado)
            except Estagiario.DoesNotExist:
                return Response({'error': 'Estagiário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Tipo inválido'}, status=status.HTTP_400_BAD_REQUEST)

        obj.nome = data.get('nome', obj.nome)
        obj.matricula = data.get('matricula', obj.matricula)
        obj.telefone = data.get('telefone', obj.telefone)
        obj.tipo_servico = data.get('tipo_servico', obj.tipo_servico)
        obj.save()

        disponibilidades = data.get('disponibilidades', [])
        local = data.get('local', None)
        sala = data.get('sala', None)

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

        return Response({'detail': 'Funcionário atualizado com sucesso!'}, status=status.HTTP_200_OK)
    def get(self, request, tipo, cpf):
        cpf_normalizado = normalizar_cpf(cpf)

        if tipo == 'profissional':
            try:
                obj = Profissional.objects.get(cpf=cpf_normalizado)
            except Profissional.DoesNotExist:
                return Response({'error': 'Profissional não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        elif tipo == 'estagiario':
            try:
                obj = Estagiario.objects.get(cpf=cpf_normalizado)
            except Estagiario.DoesNotExist:
                return Response({'error': 'Estagiário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Tipo inválido'}, status=status.HTTP_400_BAD_REQUEST)

        # Monta os dados para retornar
        content_type = ContentType.objects.get_for_model(obj)
        disponibilidades_qs = Disponibilidade.objects.filter(content_type=content_type, object_id=obj.id)

        disponibilidades = []
        for disp in disponibilidades_qs:
            # Agrupando horários por dia, simplificado
            dia_str = disp.dia.isoformat()
            # aqui você pode organizar melhor os horários em listas por dia
            disponibilidades.append({
                'dia': dia_str,
                'horario': disp.horario,
                'local': disp.local,
                'sala': disp.sala
            })

        data = {
            'tipo': tipo,
            'cpf': cpf_normalizado,
            'nome': obj.nome,
            'matricula': obj.matricula,
            'telefone': obj.telefone,
            'tipo_servico': obj.tipo_servico,
            'disponibilidades': disponibilidades,
        }
        return Response(data, status=status.HTTP_200_OK)


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


from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_superuser or obj == request.user


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]

    def delete(self, request, pk):
        usuario = get_object_or_404(Usuario, pk=pk)

        # Verifica permissão personalizada
        self.check_object_permissions(request, usuario)

        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# View para detalhar e deletar um profissional pelo id (pk)
class ProfissionalDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Profissional.objects.get(pk=pk)
        except Profissional.DoesNotExist:
            return None
        
    def get(self, request, pk):
        profissional = self.get_object(pk)
        if not profissional:
            return Response({'error': 'Profissional não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfissionalSerializer(profissional)
        return Response(serializer.data)

    def patch(self, request, pk):  # PATCH para atualização parcial
        profissional = self.get_object(pk)
        if not profissional:
            return Response({'error': 'Profissional não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfissionalSerializer(profissional, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Atualizar disponibilidades (se vierem na request)
            disponibilidades_data = request.data.get('disponibilidades')
            if disponibilidades_data:
                profissional.disponibilidades.all().delete()
                for disp in disponibilidades_data:
                    Disponibilidade.objects.create(
                        content_type=ContentType.objects.get_for_model(Profissional),
                        object_id=profissional.id,
                        dia=disp['dia'],
                        horario=disp['horario'],
                        local=disp.get('local'),
                        sala=disp.get('sala'),
                    )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, pk):
        profissional = self.get_object(pk)
        if not profissional:
            return Response({'error': 'Profissional não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        profissional.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



# View para detalhar e deletar um estagiário pelo id (pk)
class EstagiarioDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get_object(self, pk):
        try:
            return Estagiario.objects.get(pk=pk)
        except Estagiario.DoesNotExist:
            return None
        
    def get(self, request, pk):
        estagiario = self.get_object(pk)
        if not estagiario:
            return Response({'error': 'Estagiário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EstagiarioSerializer(estagiario)
        return Response(serializer.data)


    def patch(self, request, pk):  # Atualização parcial com PATCH
        estagiario = self.get_object(pk)
        if not estagiario:
            return Response({'error': 'Estagiário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EstagiarioSerializer(estagiario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # Atualizar disponibilidades (se vierem na request)
            disponibilidades_data = request.data.get('disponibilidades')
            if disponibilidades_data:
                estagiario.disponibilidades.all().delete()
                for disp in disponibilidades_data:
                    Disponibilidade.objects.create(
                        content_type=ContentType.objects.get_for_model(Estagiario),
                        object_id=estagiario.id,
                        dia=disp['dia'],
                        horario=disp['horario'],
                        local=disp.get('local'),
                        sala=disp.get('sala'),
                    )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk):
        estagiario = self.get_object(pk)
        if not estagiario:
            return Response({'error': 'Estagiário não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        estagiario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# AGENDAMENTO
# View para listar e criar agendamentos com autenticação obrigatória
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import IsAuthenticated

class AgendamentoListCreateView(generics.ListCreateAPIView):  # <- CORRIGIDO AQUI
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        profissional = Profissional.objects.filter(usuario=user).first()
        estagiario = Estagiario.objects.filter(usuario=user).first()

        if profissional:
            ct = ContentType.objects.get_for_model(Profissional)
            return Agendamento.objects.filter(content_type=ct, object_id=profissional.id)

        if estagiario:
            ct = ContentType.objects.get_for_model(Estagiario)
            return Agendamento.objects.filter(content_type=ct, object_id=estagiario.id)

        return Agendamento.objects.filter(usuario=user)

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

        # Filtrar as disponibilidades para excluir os horários já agendados
        horarios_disponiveis = disponibilidades.exclude(horario__in=horarios_agendados)

        # Retornar os profissionais e horários disponíveis
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
        
        user = request.user
        profissional = Profissional.objects.filter(usuario=user).first()
        estagiario = Estagiario.objects.filter(usuario=user).first()

        def is_mesma_pessoa(disponibilidade):
            return (
                (profissional and
                 disponibilidade.content_type == ContentType.objects.get_for_model(Profissional) and
                 disponibilidade.object_id == profissional.id)
                or
                (estagiario and
                 disponibilidade.content_type == ContentType.objects.get_for_model(Estagiario) and
                 disponibilidade.object_id == estagiario.id)
            )

        disponibilidades_livres = [
            d for d in disponibilidades
            if (d.content_type_id, d.object_id, d.horario) not in ocupados_set
            and not is_mesma_pessoa(d)
        ]


        serializer = DisponibilidadeSerializer(disponibilidades_livres, many=True)
        
        if not serializer.data:
            return Response({"error": "Nenhuma disponibilidade encontrada para essa data."}, status=404)

        return Response(serializer.data)

class MinhasConsultasAPIView(generics.ListAPIView):
    serializer_class = AgendamentoSerializer

    def get_queryset(self):
        user = self.request.user

        profissional = Profissional.objects.filter(usuario=user).first()
        estagiario = Estagiario.objects.filter(usuario=user).first()

        if profissional:
            ct = ContentType.objects.get_for_model(Profissional, for_concrete_model=False)
            return Agendamento.objects.filter(content_type=ct, object_id=profissional.id)

        if estagiario:
            ct = ContentType.objects.get_for_model(Estagiario, for_concrete_model=False)
            return Agendamento.objects.filter(content_type=ct, object_id=estagiario.id)

        return Agendamento.objects.none()

class DisponibilidadesPorhorariosView(APIView):
    def get(request):
        # ContentTypes para filtrar só Profissional e Estagiario
        prof_ct = ContentType.objects.get_for_model(Profissional)
        est_ct = ContentType.objects.get_for_model(Estagiario)

        # Filtra disponibilidades por dia e atendentes certos
        disponibilidades = Disponibilidade.objects.filter(
            content_type__in=[prof_ct, est_ct]
        )
        
        #Identifica quem é o usuario
        user = request.user
        user_ct = None
        user_obj_id = None
        
        #remove as diponibilidades dos proprios funcionario/estagiario(ou seja pra eles não alto se atender)
        if hasattr(user, 'profissional'):
            user_ct = prof_ct
            user_obj_id = user.profissional.id
        elif hasattr(user, 'estagiario'):
            user_ct = est_ct
            user_obj_id = user.estagiario.id
            
        if user_ct and user_obj_id:
            disponibilidades = disponibilidades.exclude(
                Content_type = user_ct,
                object_id = user_obj_id
            )
            
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


class ForumsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        forums = Forums.objects.all().prefetch_related('curtidas')
        serializer = ForumsSerializer(forums, many=True, context={'request': request})
        return Response(serializer.data)


    def post(self, request):
        serializer = ForumsSerializer(data=request.data, context={'request': request})  # 👈 adicionado context
        if serializer.is_valid():
            serializer.save(criador=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            forum = Forums.objects.get(pk=pk)
        except Forums.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ForumsSerializer(forum, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            forum = Forums.objects.get(pk=pk)
        except Forums.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        forum.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ForumDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Forums, pk=pk)

    def get(self, request, pk):
        forum = self.get_object(pk)
        serializer = ForumsSerializer(forum, context={'request': request})  # 👈 adicionado context
        return Response(serializer.data)


    def put(self, request, pk):
        forum = self.get_object(pk)
        serializer = ForumsSerializer(forum, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        forum = self.get_object(pk)
        forum.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from django.db.models import Count

class CurtirForumAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        forum = get_object_or_404(Forums, pk=pk)
        usuario = request.user

        if ForumCurtida.objects.filter(forum=forum, usuario=usuario).exists():
            return Response({'detail': 'Você já curtiu este fórum.'}, status=status.HTTP_400_BAD_REQUEST)

        ForumCurtida.objects.create(forum=forum, usuario=usuario)
        total_curtidas = ForumCurtida.objects.filter(forum=forum).count()

        return Response({
            'detail': 'Curtida registrada com sucesso.',
            'total_curtidas': total_curtidas,
            'curtiu': True
        }, status=status.HTTP_201_CREATED)


class DescurtirForumAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        forum = get_object_or_404(Forums, pk=pk)
        usuario = request.user

        curtida = ForumCurtida.objects.filter(forum=forum, usuario=usuario).first()
        if not curtida:
            return Response({'detail': 'Você não curtiu este fórum.'}, status=status.HTTP_400_BAD_REQUEST)

        curtida.delete()
        total_curtidas = ForumCurtida.objects.filter(forum=forum).count()

        return Response({
            'detail': 'Curtida removida com sucesso.',
            'total_curtidas': total_curtidas,
            'curtiu': False
        }, status=status.HTTP_200_OK)

        
class MensagemForumAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        forum_id = request.query_params.get('forum')
        if forum_id:
            mensagens = MensagemForum.objects.filter(forum_id=forum_id).order_by("data_envio")
        else:
            mensagens = MensagemForum.objects.all().order_by("data_envio")
        serializer = MensagemForumSerializer(mensagens, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MensagemForumSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(autor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MensagemForumDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(MensagemForum, pk=pk)

    def get(self, request, pk):
        mensagem = self.get_object(pk)
        serializer = MensagemForumSerializer(mensagem)
        return Response(serializer.data)

    def put(self, request, pk):
        mensagem = self.get_object(pk)
        serializer = MensagemForumSerializer(mensagem, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        mensagem = self.get_object(pk)
        mensagem.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class MensagemForumListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MensagemForumSerializer

    def get_queryset(self):
        forum_id = self.kwargs['forum_id']
        return MensagemForum.objects.filter(forum=forum_id).order_by('data_envio')



class EditarPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def menu_data(request):
    user = request.user

    top_foruns = Forums.objects.annotate(total_curtidas_count=Count('curtidas')).order_by('-total_curtidas_count')[:5]

    # Serializa os fóruns
    top_foruns_serialized = ForumsSerializer(top_foruns, many=True, context={'request': request}).data

    # Próximo agendamento confirmado e futuro para o usuário
    proximo = Agendamento.objects.filter(
        usuario=user,
        status='confirmado',
        dia__gte=now().date()
    ).order_by('dia', 'horario').first()

    proximo_serialized = AgendamentoSerializer(proximo).data if proximo else None


    links_e_imagens = [
    {
        "titulo": "UNIJORGE",
        "url": "https://www.unijorge.edu.br/",
        "imagem": request.build_absolute_uri('/media/imagens/unijorge.png')
    },
    {
        "titulo": "Núcleo AMADO",
        "url": "https://www.unijorge.edu.br/nucleoamado/",
        "imagem": request.build_absolute_uri('/media/imagens/amado.png')

    },
    ];
    return Response({
        "top_foruns": top_foruns_serialized,
        "proximo_agendamento": proximo_serialized,
        "links_e_imagens": links_e_imagens,
    })
