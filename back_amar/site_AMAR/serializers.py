from django.apps import apps
from rest_framework import serializers
from .models import Agendamento, Estagiario, ForumCurtida, Profissional, Usuario, Forums, MensagemForum
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
        user_serializer = UsuarioSerializer(user, context=self.context)
        data['user'] = user_serializer.data
        return data


# Serializer para o modelo Usuario, incluindo a lógica para
# criação do usuário com senha hashada (não salva senha em texto puro).
class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=False, allow_blank=True)
    senha_mascara = serializers.SerializerMethodField()
    imagem_perfil = serializers.SerializerMethodField()  # ✅ Adicione isso
    
    class Meta:
        model = Usuario
        fields = ['id','email', 'nome', 'cpf', 'telefone', 'senha', 'foto_perfil', 'senha_mascara', 'imagem_perfil']
        #read_only_fields = ['email', 'cpf']  # CPF e email não editáveis

    def update(self, instance, validated_data):
        senha = validated_data.pop('senha', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if senha:
            instance.set_password(senha)
        instance.save()
        return instance
    def get_senha_mascara(self, obj):
        # Apenas retorna asteriscos se a senha existir
        if obj.password:
            return '********'
        return None
    def get_imagem_perfil(self, obj):
        request = self.context.get('request')
        if obj.foto_perfil and hasattr(obj.foto_perfil, 'url'):
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None
    def create(self, validated_data):
        senha = validated_data.pop('senha', None)
        usuario = Usuario(**validated_data)
        if senha:
            usuario.set_password(senha)
        else:
            usuario.set_unusable_password()
        usuario.save()
        return usuario

    
    
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
    
# Serializer para o modelo Profissional, expondo campos do profissional
# e o e-mail relacionado ao usuário correspondente (via relação one-to-one).   
class ProfissionalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    disponibilidades = DisponibilidadeSerializer(many=True, read_only=True)


    class Meta:
        model = Profissional
        fields = [
            'id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico',
            'email', 'disponibilidades'  # adicione os outros campos que existirem no modelo
        ]


# Serializer para o modelo Estagiario, similar ao ProfissionalSerializer,
# incluindo o e-mail via relação com o modelo Usuario.
class EstagiarioSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='usuario.email', read_only=True)
    disponibilidades = DisponibilidadeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Estagiario
        fields = ['id', 'cpf', 'nome', 'matricula', 'telefone', 'tipo_servico',
            'email', 'disponibilidades']


# Serializer para o modelo Agendamento, responsável por validar,
# criar e representar agendamentos, incluindo lógica para atualizar
# status baseado na data atual e impedir conflitos de horários.
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

class AgendamentoSerializer(serializers.ModelSerializer):
    content_type = serializers.PrimaryKeyRelatedField(queryset=ContentType.objects.all())
    object_id = serializers.IntegerField()
    atendente_nome = serializers.SerializerMethodField()
    servico = serializers.SerializerMethodField()
    usuario_nome = serializers.CharField(source='usuario.nome', read_only=True)


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
            'atendente_nome',
            'servico',
            'usuario_nome'
        ]
        read_only_fields = ['status']

    def get_atendente_nome(self, obj):
        if hasattr(obj, 'atendente') and obj.atendente:
            return getattr(obj.atendente, 'nome', None)
        return None

    def get_servico(self, obj):
        if hasattr(obj, 'atendente') and obj.atendente:
            return getattr(obj.atendente, 'tipo_servico', None)
        return None

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



class ForumsSerializer(serializers.ModelSerializer):
    criador = UsuarioSerializer(read_only=True)
    total_curtidas = serializers.SerializerMethodField()

    foto_perfil_criador = serializers.ImageField(source='criador.foto_perfil', read_only=True)
    curtiu = serializers.SerializerMethodField()  # novo campo
     
    class Meta:
        model = Forums
        fields = ['id', 'criador', 'nome', 'foto_perfil_criador', 'publicacao', 'total_curtidas', 'curtiu']
        
    def get_curtiu(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return ForumCurtida.objects.filter(forum=obj, usuario=user).exists()
        return False
    
    def get_total_curtidas(self, obj):
        return obj.curtidas.count()
    
    def get_foto_perfil_criador(self, obj):
        request = self.context.get("request")
        if obj.criador.foto_perfil and hasattr(obj.criador.foto_perfil, 'url'):
            return request.build_absolute_uri(obj.criador.foto_perfil.url)
        return None


class MensagemForumSerializer(serializers.ModelSerializer):
    autor = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = MensagemForum
        fields = ['id', 'forum', 'autor', 'mensagem', 'data_envio']

class ForumCurtidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumCurtida
        fields = ['id', 'forum', 'usuario', 'data']
        read_only_fields = ['data']