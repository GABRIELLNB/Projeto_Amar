from django.apps import apps
from rest_framework import serializers
from .models import Agendamento, Estagiario, Profissional, Usuario
from django.contrib.auth.hashers import make_password



class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'nome', 'cpf', 'telefone', 'senha']

    def create(self, validated_data):
        senha = validated_data.pop('senha')
        usuario = Usuario(**validated_data)
        usuario.senha = senha  # usa o setter para hash
        usuario.save()
        return usuario
    
class ProfissionalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = Profissional
        fields = ['id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico', 'email']

class EstagiarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    class Meta:
        model = Estagiario
        fields = ['id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico', 'email']

from rest_framework import serializers

# serializers.py
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Agendamento

# serializers.py
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Agendamento

from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'
        read_only_fields = ('usuario', 'criado_em')

    def validate(self, data):
        content_type = data.get('content_type')
        object_id = data.get('object_id')
        dia = data.get('dia')
        horario = data.get('horario')

        if not all([content_type, object_id, dia, horario]):
            raise DRFValidationError("Campos content_type, object_id, dia e horario são obrigatórios.")

        model_class = content_type.model_class()
        profissional_class = apps.get_model('site_AMAR', 'Profissional')
        estagiario_class = apps.get_model('site_AMAR', 'Estagiario')

        if model_class not in [profissional_class, estagiario_class]:
            raise DRFValidationError("Agendamento só pode ser com Profissional ou Estagiário.")

        if Agendamento.objects.filter(
            content_type=content_type,
            object_id=object_id,
            dia=dia,
            horario=horario
        ).exists():
            raise DRFValidationError("Este horário já está agendado para este atendente.")

        return data

    def create(self, validated_data):
        usuario = self.context['request'].user
        validated_data.pop('usuario', None)
        return Agendamento.objects.create(usuario=usuario, **validated_data)


from .models import Disponibilidade

class DisponibilidadeSerializer(serializers.ModelSerializer):
    atendente_nome = serializers.CharField(source='atendente.nome', read_only=True)
    tipo_atendente = serializers.CharField(source='content_type.model', read_only=True)
    servico = serializers.SerializerMethodField()
    object_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Disponibilidade
        fields = ['id', 'atendente_nome', 'tipo_atendente', 'dia', 'horario', 'servico', 'object_id']
        
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