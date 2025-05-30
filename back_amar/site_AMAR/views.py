from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Usuario
from .serializers import UsuarioSerializer
from django.contrib.auth.hashers import make_password
from .models import Usuario, Estagiario, Profissional

import re

def normalizar_cpf(cpf):
    return re.sub(r'\D', '', cpf)

from rest_framework.permissions import AllowAny

class CadastroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Usuário cadastrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.contrib.contenttypes.models import ContentType
from django.utils.dateparse import parse_date
from .models import Disponibilidade

class PreCadastroFuncionarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        tipo = data.get('tipo')
        cpf = normalizar_cpf(data.get('cpf', ''))
        nome = data.get('nome')
        matricula = data.get('matricula', '')
        telefone = data.get('telefone', '')
        tipo_servico = data.get('tipo_servico', '')  # Aqui cuidado para salvar em 'tipo_servico'
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

        # Agora criamos os objetos Disponibilidade
        content_type = ContentType.objects.get_for_model(obj)

        # Se quiser apagar disponibilidades antigas:
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
