from django.apps import apps
from rest_framework import serializers
from .models import Agendamento, Estagiario, Profissional, Usuario
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from datetime import date
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Disponibilidade


# Customiza o serializer do JWT para incluir campos adicionais no token,
# como se o usuário é superuser e o tipo do usuário (profissional, estagiário ou usuário comum).
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['is_superuser'] = self.user.is_superuser
        

      
        data['id'] = user.id
        user_type = 'usuario'  # padrão

        if hasattr(user, 'profissional'):
            user_type = 'profissional'
        elif hasattr(user, 'estagiario'):
            user_type = 'estagiario'

        data['user_type'] = user_type
        
        data['name'] = user.nome  

        return data


# Serializer para o modelo Usuario, incluindo a lógica para
# criação do usuário com senha hashada (não salva senha em texto puro).
class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'nome', 'cpf', 'telefone', 'senha']

    def create(self, validated_data):
        senha = validated_data.pop('senha')
        usuario = Usuario(**validated_data)
        usuario.set_password(senha)  # usa o setter para hash
        usuario.save()
        return usuario


# Serializer para o modelo Profissional, expondo campos do profissional
# e o e-mail relacionado ao usuário correspondente (via relação one-to-one).   
class ProfissionalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = Profissional
        fields = ['id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico', 'email']


# Serializer para o modelo Estagiario, similar ao ProfissionalSerializer,
# incluindo o e-mail via relação com o modelo Usuario.
class EstagiarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    class Meta:
        model = Estagiario
        fields = ['id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico', 'email']


# Serializer para o modelo Agendamento, responsável por validar,
# criar e representar agendamentos, incluindo lógica para atualizar
# status baseado na data atual e impedir conflitos de horários.
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

class AgendamentoSerializer(serializers.ModelSerializer):
    content_type = serializers.PrimaryKeyRelatedField(queryset=ContentType.objects.all())
    object_id = serializers.IntegerField()

    class Meta:
        model = Agendamento
        fields = [
            'id',
            'usuario',
            'content_type',
            'object_id',
            'dia',
            'horario',
            'local',
            'sala',
            'status',
            
        ]
        read_only_fields = ['status']

    def validate(self, data):
        content_type = data.get('content_type')
        object_id = data.get('object_id')
        dia = data.get('dia')
        horario = data.get('horario')
        local = data.get('local')
        sala = data.get('sala')

        if not all([content_type, object_id, dia, horario]):
            raise serializers.ValidationError("Campos content_type, object_id, dia e horario são obrigatórios.")

        profissional_class = apps.get_model('site_AMAR', 'Profissional')
        estagiario_class = apps.get_model('site_AMAR', 'Estagiario')

        if content_type.model_class() not in [profissional_class, estagiario_class]:
            raise serializers.ValidationError("Agendamento só pode ser com Profissional ou Estagiário.")

        if Agendamento.objects.filter(
            content_type=content_type,
            object_id=object_id,
            dia=dia,
            horario=horario,
            local=local,
            sala=sala
        ).exists():
            raise serializers.ValidationError("Este horário já está agendado para este atendente.")

        return data

    def create(self, validated_data):
        usuario = self.context['request'].user
        validated_data.pop('usuario', None)
        validated_data['status'] = 'confirmado'
        return Agendamento.objects.create(usuario=usuario, **validated_data)




# Serializer para o modelo Disponibilidade, que expõe a disponibilidade
# dos atendentes (profissionais ou estagiários), incluindo nome, tipo,
# serviço e detalhes do horário e local.
class DisponibilidadeSerializer(serializers.ModelSerializer):
    atendente_nome = serializers.CharField(source='atendente.nome', read_only=True)
    tipo_atendente = serializers.CharField(source='content_type.model', read_only=True)
    servico = serializers.SerializerMethodField()
    object_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Disponibilidade
        fields = ['id', 'atendente_nome', 'tipo_atendente', 'dia', 'horario', 'servico', 'object_id', 'local', 'sala']
        
    def get_servico(self, obj):
        if obj.atendente:
            return obj.atendente.tipo_servico
        return None
    
    
'''
class LoginSerializer(serializers.Serializer):
    cpf = serializers.CharField()
    senha = serializers.CharField(write_only=True)


class ForumSerializer(serializers.ModelSerializer):
    link = serializers.SerializerMethodField()

    class Metal:
        model = Forums #Não está reconhesendo por causa das migrações, não consigo fazer aqui
        fields = ['id', 'nome', 'publicacao', 'like', 'coment', 'link']

    def get_link(self, obj):
        return f"/forum{obj.id}/" #Url do front

'''