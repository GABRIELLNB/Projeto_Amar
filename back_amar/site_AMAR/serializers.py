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

class AgendamentoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    atendente_type = serializers.CharField(write_only=True)
    atendente_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Agendamento
        fields = ['id', 'usuario', 'atendente_type', 'atendente_id', 'dia', 'horario', 'status', 'criado_em']

    def validate(self, data):
        # Verifica se atendente_type é válido
        atendente_type = data.get('atendente_type')
        atendente_id = data.get('atendente_id')

        if atendente_type not in ['profissional', 'estagiario']:
            raise serializers.ValidationError("atendente_type deve ser 'profissional' ou 'estagiario'.")

        # Verifica se atendente existe
        model_map = {
            'profissional': Profissional,
            'estagiario': Estagiario,
        }
        model = model_map[atendente_type]
        try:
            atendente = model.objects.get(id=atendente_id)
        except model.DoesNotExist:
            raise serializers.ValidationError("Atendente não encontrado.")

        # Checar conflito de agendamento
        if Agendamento.objects.filter(
            content_type=ContentType.objects.get_for_model(model),
            object_id=atendente_id,
            dia=data.get('dia'),
            horario=data.get('horario'),
            status__in=['disponivel', 'pendente']
        ).exists():
            raise serializers.ValidationError("Horário já agendado para esse atendente.")

        return data

    def create(self, validated_data):
        atendente_type = validated_data.pop('atendente_type')
        atendente_id = validated_data.pop('atendente_id')

        model_map = {
            'profissional': Profissional,
            'estagiario': Estagiario,
        }
        model = model_map[atendente_type]
        content_type = ContentType.objects.get_for_model(model)

        agendamento = Agendamento.objects.create(
            usuario=self.context['request'].user,
            content_type=content_type,
            object_id=atendente_id,
            **validated_data
        )
        return agendamento

from .models import Disponibilidade

class DisponibilidadeSerializer(serializers.ModelSerializer):
    atendente_nome = serializers.CharField(source='atendente.nome', read_only=True)
    tipo_atendente = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Disponibilidade
        fields = ['id', 'atendente_nome', 'tipo_atendente', 'dia', 'horario']
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