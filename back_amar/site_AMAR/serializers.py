from rest_framework import serializers
from .models import Estagiario, Profissional, Usuario
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