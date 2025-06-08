import re
from urllib import request
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.utils.dateparse import parse_date
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from .models import Agendamento
#from .utils import get_tipo_usuario #PARA O MENU
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
    UsuarioSerializer,
    ProfissionalSerializer,
    EstagiarioSerializer,
    ForumSerializer,
    MensagemForumSerializer
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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.dateparse import parse_date
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import AllowAny

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

        disponibilidades_livres = [
            d for d in disponibilidades
            if (d.content_type_id, d.object_id, d.horario) not in ocupados_set
        ]

        serializer = DisponibilidadeSerializer(disponibilidades_livres, many=True)
        
        if not serializer.data:
            return Response({"error": "Nenhuma disponibilidade encontrada para essa data."}, status=404)

        return Response(serializer.data)


from django.contrib.contenttypes.models import ContentType
from rest_framework import generics
from .models import Agendamento, Profissional, Estagiario
from .serializers import AgendamentoSerializer

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

from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType


class DatasDisponiveisView(APIView):
    def get(self, request):
        prof_ct = ContentType.objects.get_for_model(Profissional)
        est_ct = ContentType.objects.get_for_model(Estagiario)

        disponibilidades = Disponibilidade.objects.filter(
            content_type__in=[prof_ct, est_ct]
        )

        user = request.user
        user_ct = None
        user_obj_id = None

        if hasattr(user, 'profissional'):
            user_ct = prof_ct
            user_obj_id = user.profissional.id
        elif hasattr(user, 'estagiario'):
            user_ct = est_ct
            user_obj_id = user.estagiario.id

        if user_ct and user_obj_id:
            disponibilidades = disponibilidades.exclude(
                content_type=user_ct,
                object_id=user_obj_id
            )

        # Agora pegar as datas únicas ordenadas
        datas_unicas = disponibilidades.values_list('dia', flat=True).distinct().order_by('dia')

        return Response(list(datas_unicas))

    
    
"""
from django.db.models import Q
from django.shortcuts import render
from .models import Usuario, Profissional, Estagiario, Disponibilidade, Agendamento, Forums, MensagemForum

class BuscaGeralView(APIView):
    def get(self, request):
        q = request.GET.get('q', '').strip()
        if not q:
            return Response([])

        queryset = Disponibilidade.objects.filter(
            Q(horario__icontains=q) |
            Q(local__icontains=q) |
            Q(sala__icontains=q) |
            Q(atendente__nome__icontains=q) |
            Q(atendente__tipo_servico__icontains=q)
        )

        resultados = []
        for disp in queryset:
            resultados.append({
                'id': disp.id,
                'horario': disp.horario,
                'atendente_nome': disp.atendente.nome,
                'servico': getattr(disp.atendente, 'tipo_servico', ''),
                'local': disp.local,
                'sala': disp.sala,
            })

        return Response(resultados)
"""

''' #Não sei se via usar isso porque separei as viwes para organizar
class ForumDetailView(APIView):
    def get(self, request, forum_id):
        try:
            forum = Forums.objects.get(id=forum_id)
        except Forums.DoesNotExist:
            return Response({'detail': 'Fórum não encontrado'}, status=404)
        
        serializer = ForumSerializer(forum)
        return Response(serializer.data)
'''
class ForumListView(APIView):
    def get(self, request):
        foruns = Forums.objects.all().order_by('-id')
        serializer = ForumSerializer(foruns, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)



    
'''
class MenuView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        tipo = get_tipo_usuario(usuario)

        # Buscar os fóruns mais curtidos
        foruns = Forums.objects.order_by('-like')[:10]
        serializer = ForumSerializer(foruns, many=True)

        data = {
            'nome': usuario.nome,
            'email': usuario.email,
            'tipo_usuario': tipo,
            'opcoes_menu': [
                'Editar perfil',
                'Bate-Papo',
                'Agendar',
                'Histórico',
                'Configurações',
            ],
            'extras': {
                'forum_mais_valiados': serializer.data,  # agora vem do banco!
                'propagandas': [
                    {'imagem': '/media/banner1.jpg', 'link': '/promo1'},
                    {'imagem': '/media/banner2.jpg', 'link': '/promo2'}
                ]
            }
        }

        return Response(data, status=status.HTTP_200_OK)
'''