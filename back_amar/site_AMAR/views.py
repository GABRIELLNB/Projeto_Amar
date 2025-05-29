from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Usuario, Estagiario, Profissional
from .utils import get_tipo_usuario # Para reutilizar 
from .serializers import UsuarioSerializer, LoginSerializer
from .models import Usuario
from django.contrib.auth.hashers import check_password
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

class LoginView(APIView):
    permission_classes =[AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            cpf = normalizar_cpf(serializer.validated_data['cpf'])
            senha = serializer.validated_data['senha']

        
            try:
                usuario = Usuario.objects.get(email=email, cpf=cpf)
                if check_password(senha, usuario.senha):
                    return Response({"detail": "Login realizado com sucesso!"}, status=status.HTTP_200_OK)
                else:
                        return Response({"erro": "Senha incorreta"}, status=status.HTTP_401_UNAUTHORIZED)
            except Usuario.DoesNotExist:
                    return Response({"erro": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MenuView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        tipo = get_tipo_usuario(usuario)

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
                        'forum_mais_valiados': [
                            # Exemplo fictício
                            {'titulo': 'Ansiedade', 'autor': 'Prof. Joana'},
                            {'titulo': 'Como melhorar o sono?', 'autor': 'Est. Lucas'}
                        ],
                        'propagandas': [
                            {'imagem': '/media/banner1.jpg', 'link': '/promo1'},
                            {'imagem': '/media/banner2.jpg', 'link': '/promo2'}
                        ]
                    }
                }
        return Response(data, status=status.HTTP_200_OK)